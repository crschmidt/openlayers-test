/* Copyright (c) 2006 MetaCarta, Inc., published under the BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the full
 * text of the license. */
// @require: OpenLayers/Control.js
OpenLayers.Control.MouseToolbar = function(position, direction) {
    this.initialize(position, direction);
}
OpenLayers.Control.MouseToolbar.X = 6;
OpenLayers.Control.MouseToolbar.Y = 300;
OpenLayers.Control.MouseToolbar.prototype = MochiKit.Base.merge(
	OpenLayers.Control.prototype, {
    
    mode: null,

    buttons: null,

    direction: "vertical",
    
    initialize: function(position, direction) {
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
        this.position = new OpenLayers.Pixel(OpenLayers.Control.MouseToolbar.X,
                                             OpenLayers.Control.MouseToolbar.Y);
        if (position) {
            this.position = position;
        }
        if (direction) {
            this.direction = direction; 
        }
        this.measureDivs = [];
    },
    
    draw: function() {
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        var connect = MochiKit.Signal.connect;
        this.buttons = {};
        connect(this.map.div,"ondblclick", this, this.defaultDblClick );
        connect(this.map.div,"onmousedown", this, this.defaultMouseDown );
        connect(this.map.div,"onmouseup", this, this.defaultMouseUp );
        connect(this.map.div,"onmousemove", this, this.defaultMouseMove );
        connect(this.map.div,"onmouseout", this, this.defaultMouseOut );
        var sz = new OpenLayers.Size(28,28);
        var centered = this.position;
        this._addButton("zoombox", "drag-rectangle-off.png", "drag-rectangle-on.png", centered, sz, "Shift->Drag to zoom to area");
        centered = centered.add((this.direction == "vertical" ? 0 : sz.w), (this.direction == "vertical" ? sz.h : 0));
        this._addButton("pan", "panning-hand-off.png", "panning-hand-on.png", centered, sz, "Drag the map to pan.");
        centered = centered.add((this.direction == "vertical" ? 0 : sz.w), (this.direction == "vertical" ? sz.h : 0));
        this._addButton("measure", "measuring-stick-off.png", "measuring-stick-on.png", centered, sz, "Hold alt when clicking to show distance between selected points");
        this.switchModeTo("pan");
        connect(this.map,"zoomend", this, function() { this.switchModeTo("pan"); });
        return this.div;
        
    },
    
    _addButton:function(id, img, activeImg, xy, sz, title) {
        var imgLocation = OpenLayers.Util.getImagesLocation() + img;
        var activeImgLocation = OpenLayers.Util.getImagesLocation() + activeImg;
        // var btn = new ol.AlphaImage("_"+id, imgLocation, xy, sz);
        var btn = OpenLayers.Util.createAlphaImageDiv(
                                    "OpenLayers_Control_MouseToolbar_" + id, 
                                    xy, sz, imgLocation, "absolute");
        var connect = MochiKit.Signal.connect;

        //we want to add the outer div
        this.div.appendChild(btn);
        btn.imgLocation = imgLocation;
        btn.activeImgLocation = activeImgLocation;
        
        connect(btn, 'onmousedown', this, this.buttonClick);
        connect(btn, 'onmouseup', this, this.buttonUp);
        btn.action = id;
        btn.title = title;
        btn.alt = title;
        btn.map = this.map;

        //we want to remember/reference the outer div
        this.buttons[id] = btn;
        return btn;
    },

    buttonClick: function(evt) {
        if (!evt.mouse().button.left) return;
        this.switchModeTo(evt.src().action);
        evt.stop();
    },

    buttonUp: function(evt) {
        evt.stop();
    },
    
    /**
    * @param {Event} evt
    */
    defaultDblClick: function (evt) {
        this.switchModeTo("pan");
        var newCenter = this.map.getLonLatFromViewPortPx(
            this.map.getMousePosition(evt.mouse().client)); 
        this.map.setCenter(newCenter, this.map.zoom + 2);
    },

    /**
    * @param {Event} evt
    */
    defaultMouseDown: function (evt) {
        var mouse = evt.mouse();
        var mod = evt.modifier();
        if (!mouse.button.left) return;
        this.mouseDragStart = this.map.getMousePosition(mouse.client);
        if (mod.shift && this.mode !="zoombox") {
            this.switchModeTo("zoombox");
        } else if (mod.alt && this.mode !="measure") {
            this.switchModeTo("measure");
        } else if (!this.mode) {
            this.switchModeTo("pan");
        }
        
        switch (this.mode) {
            case "zoombox":
                this.map.div.style.cursor = "crosshair";
                this.zoomBox = OpenLayers.Util.createDiv('zoomBox',
                                                         this.mouseDragStart,
                                                         null,
                                                         null,
                                                         "absolute",
                                                         "2px solid red");
                this.zoomBox.style.backgroundColor = "white";
                this.zoomBox.style.filter = "alpha(opacity=50)"; // IE
                this.zoomBox.style.opacity = "0.50";
                this.zoomBox.style.zIndex = this.map.Z_INDEX_BASE["Popup"] - 1;
                this.map.viewPortDiv.appendChild(this.zoomBox);
                break;
            case "measure":
                var distance = "";
                if (this.measureStart) {
                    measureEnd = this.map.getLonLatFromViewPortPx(this.mouseDragStart);
                    distance = OpenLayers.Util.distVincenty(this.measureStart, measureEnd);
                    distance = Math.round(distance * 100) / 100;
                    distance = distance + "km";
                    this.measureStartBox = this.measureBox;
                }    
                this.measureStart = this.map.getLonLatFromViewPortPx(this.mouseDragStart);;
                this.measureBox = OpenLayers.Util.createDiv(null,
                                                         this.mouseDragStart.add(
                                                           -2-parseInt(this.map.layerContainerDiv.style.left),
                                                           -2-parseInt(this.map.layerContainerDiv.style.top)),
                                                         null,
                                                         null,
                                                         "absolute");
                this.measureBox.style.width="4px";
                this.measureBox.style.height="4px";
                this.measureBox.style.backgroundColor="red";
                this.measureBox.style.zIndex = this.map.Z_INDEX_BASE["Popup"] - 1;
                this.map.layerContainerDiv.appendChild(this.measureBox);
                if (distance) {
                    this.measureBoxDistance = OpenLayers.Util.createDiv(null,
                                                         this.mouseDragStart.add(
                                                           -2-parseInt(this.map.layerContainerDiv.style.left),
                                                           2-parseInt(this.map.layerContainerDiv.style.top)),
                                                         null,
                                                         null,
                                                         "absolute");
                    
                    this.measureBoxDistance.innerHTML = distance;
                    this.measureBoxDistance.style.zIndex = this.map.Z_INDEX_BASE["Popup"] - 1;
                    this.map.layerContainerDiv.appendChild(this.measureBoxDistance);
                    this.measureDivs.append(this.measureBoxDistance);
                }
                this.measureBox.style.zIndex = this.map.Z_INDEX_BASE["Popup"] - 1;
                this.map.layerContainerDiv.appendChild(this.measureBox);
                this.measureDivs.append(this.measureBox);
                break;
            default:
                this.map.div.style.cursor = "move";
                break;
        }
        document.onselectstart = function() { return false; } 
        evt.stop();
    },

    switchModeTo: function(mode) {
        if (mode != this.mode) {
            if (this.mode) {
                OpenLayers.Util.modifyAlphaImageDiv(this.buttons[this.mode], null, null, null, this.buttons[this.mode].imgLocation);
            }
            if (this.mode == "measure" && mode != "measure") {
                for(var i = 0; i < this.measureDivs.length; i++) {
                    if (this.measureDivs[i]) { 
                        this.map.layerContainerDiv.removeChild(this.measureDivs[i]);
                    }
                }
                this.measureDivs = [];
                this.measureStart = null;
            }
            this.mode = mode;
            OpenLayers.Util.modifyAlphaImageDiv(this.buttons[mode], null, null, null, this.buttons[mode].activeImgLocation);
        } 
    }, 

    leaveMode: function() {
        this.switchModeTo("pan");
    },
    
    /**
    * @param {Event} evt
    */
    defaultMouseMove: function (evt) {
        if (this.mouseDragStart != null) {
            var xy = this.map.getMousePosition(evt.mouse().client);
            switch (this.mode) {
                case "zoombox": 
                    var deltaX = Math.abs(this.mouseDragStart.x - xy.x);
                    var deltaY = Math.abs(this.mouseDragStart.y - xy.y);
                    this.zoomBox.style.width = deltaX+"px";
                    this.zoomBox.style.height = deltaY+"px";
                    if (xy.x < this.mouseDragStart.x) {
                        this.zoomBox.style.left = xy.x+"px";
                    }
                    if (xy.y < this.mouseDragStart.y) {
                        this.zoomBox.style.top = xy.y+"px";
                    }
                    break;
                default:
                    var deltaX = this.mouseDragStart.x - xy.x;
                    var deltaY = this.mouseDragStart.y - xy.y;
                    var size = this.map.getSize();
                    var newXY = new OpenLayers.Pixel(size.w / 2 + deltaX,
                                                     size.h / 2 + deltaY);
                    var newCenter = this.map.getLonLatFromViewPortPx( newXY ); 
                    this.map.setCenter(newCenter, null, true);
                    this.mouseDragStart = xy;
            }
        }
    },

    /**
    * @param {Event} evt
    */
    defaultMouseUp: function (evt) {
        if (!evt.mouse().button.left) return;
        switch (this.mode) {
            case "zoombox":
                var start = this.map.getLonLatFromViewPortPx( this.mouseDragStart ); 
                var end = this.map.getLonLatFromViewPortPx(
                    this.map.getMousePosition(evt.mouse().client) );
                var top = Math.max(start.lat, end.lat);
                var bottom = Math.min(start.lat, end.lat);
                var left = Math.min(start.lon, end.lon);
                var right = Math.max(start.lon, end.lon);
                var bounds = new OpenLayers.Bounds(left, bottom, right, top);
                var zoom = this.map.getZoomForExtent(bounds);
                this.map.setCenter(new OpenLayers.LonLat(
                  (start.lon + end.lon) / 2,
                  (start.lat + end.lat) / 2
                 ), zoom);
                this.map.viewPortDiv.removeChild(document.getElementById("zoomBox"));
                this.zoomBox = null;
                this.leaveMode();
                break;
            case "pan":
                this.map.setCenter(this.map.center);
            
        }
        document.onselectstart = null;
        this.mouseDragStart = null;
        this.map.div.style.cursor = "default";
    },

    defaultMouseOut: function (evt) {
        if (this.mouseDragStart != null
            && OpenLayers.Util.mouseLeft(evt, this.map.div)) {
                this.defaultMouseUp(evt);
        }
    }
});

