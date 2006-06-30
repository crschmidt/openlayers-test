/* Copyright (c) 2006 MetaCarta, Inc., published under the BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the full
 * text of the license. */
// @require: OpenLayers/Control.js
OpenLayers.Control.MouseDefaults = function() {
    this.initialize();
}
OpenLayers.Control.MouseDefaults.prototype = MochiKit.Base.merge(
	OpenLayers.Control.prototype, {

    performedDrag: false,

    initialize: function() {
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
    },
    
    draw: function() {
        var connect = MochiKit.Signal.connect;
        connect( this.map.div, "onclick", this, this.defaultClick );
        connect( this.map.div, "ondblclick", this, this.defaultDblClick );
        connect( this.map.div, "onmousedown", this, this.defaultMouseDown );
        connect( this.map.div, "onmouseup", this, this.defaultMouseUp );
        connect( this.map.div, "onmousemove", this, this.defaultMouseMove );
        connect( this.map.div, "onmouseout", this, this.defaultMouseOut );
    },

    defaultClick: function (evt) {
        if (!evt.mouse().button.left) return;
        var notAfterDrag = !this.performedDrag;
        this.performedDrag = false;
        return notAfterDrag;
    },

    /**
    * @param {Event} evt
    */
    defaultDblClick: function (evt) {
        var newCenter = this.map.getLonLatFromViewPortPx(
            this.map.getMousePosition(evt.mouse().client)); 
        this.map.setCenter(newCenter, this.map.zoom + 1);
    },

    /**
    * @param {Event} evt
    */
    defaultMouseDown: function (evt) {
        var mouse = evt.mouse();
        var mod = evt.modifier();
        if (!mouse.button.left) return;
        this.mouseDragStart = this.map.getMousePosition(mouse.client);
        this.performedDrag  = false;
        if (mod.shift) {
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
        }
        document.onselectstart=function() { return false; }
        evt.stop();
    },

    /**
    * @param {Event} evt
    */
    defaultMouseMove: function (evt) {
        var xy = this.map.getMousePosition(evt.mouse().client);
        if (this.mouseDragStart != null) {
            if (this.zoomBox) {
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
            } else {
                var deltaX = this.mouseDragStart.x - xy.x;
                var deltaY = this.mouseDragStart.y - xy.y;
                var size = this.map.getSize();
                var newXY = new OpenLayers.Pixel(size.w / 2 + deltaX,
                                                 size.h / 2 + deltaY);
                var newCenter = this.map.getLonLatFromViewPortPx( newXY ); 
                this.map.setCenter(newCenter, null, true);
                this.mouseDragStart = MochiKit.Base.clone(xy);
                this.map.div.style.cursor = "move";
            }
            this.performedDrag = true;
        }
    },

    /**
    * @param {Event} evt
    */
    defaultMouseUp: function (evt) {
        var mouse = evt.mouse();
        if (!mouse.button.left) return;
        if (this.zoomBox) {
            var start = this.map.getLonLatFromViewPortPx( this.mouseDragStart ); 
            var end = this.map.getLonLatFromViewPortPx( this.map.getMousePosition(mouse.client) );
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
        } else {
            this.map.setCenter(this.map.center);
        }
        document.onselectstart=null;
        this.mouseDragStart = null;
        this.map.div.style.cursor = "default";
    },

    defaultMouseOut: function (evt) {
        if (this.mouseDragStart != null) {
            if (OpenLayers.Util.mouseLeft(evt, this.map.div)) {
                this.defaultMouseUp(evt);
            }
        }
    }
});

