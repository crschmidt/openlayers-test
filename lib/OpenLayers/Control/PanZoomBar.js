/* Copyright (c) 2006 MetaCarta, Inc., published under the BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the full
 * text of the license. */
// @require: OpenLayers/Control/PanZoom.js

//
// default zoom/pan controls
//
OpenLayers.Control.PanZoomBar = function() {
    this.initialize();
}
OpenLayers.Control.PanZoomBar.X = 4;
OpenLayers.Control.PanZoomBar.Y = 4;
OpenLayers.Control.PanZoomBar.prototype = MochiKit.Base.merge(
	OpenLayers.Control.PanZoom.prototype, {
    /** @type [] */
    buttons: null,

    /** @type int */
    zoomStopWidth: 18,

    /** @type int */
    zoomStopHeight: 11,

    initialize: function() {
        OpenLayers.Control.PanZoom.prototype.initialize.apply(this, arguments);
        this.position = new OpenLayers.Pixel(OpenLayers.Control.PanZoomBar.X,
                                             OpenLayers.Control.PanZoomBar.Y);

        // put code here to catch "changebaselayer" event from map, because
        //  we are going to have to redraw this thing each time, because 
        //  maxZoom will/might change.
    },

    /**
    * @param {OpenLayers.Pixel} px
    */
    draw: function(px) {
        // initialize our internal div
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        px = this.position;

        // place the controls
        this.buttons = [];

        var sz = new OpenLayers.Size(18,18);
        var centered = new OpenLayers.Pixel(px.x+sz.w/2, px.y);

        this._addButton("panup", "north-mini.png", centered, sz);
        px.y = centered.y+sz.h;
        this._addButton("panleft", "west-mini.png", px, sz);
        this._addButton("panright", "east-mini.png", px.add(sz.w, 0), sz);
        this._addButton("pandown", "south-mini.png", centered.add(0, sz.h*2), sz);
        this._addButton("zoomin", "zoom-plus-mini.png", centered.add(0, sz.h*3+5), sz);
        centered = this._addZoomBar(centered.add(0, sz.h*4 + 5));
        this._addButton("zoomout", "zoom-minus-mini.png", centered, sz);
        return this.div;
    },

    /** 
    * @param {OpenLayers.Pixel} location where zoombar drawing is to start.
    */
    _addZoomBar:function(centered) {
        var imgLocation = OpenLayers.Util.getImagesLocation();
        
        var id = "OpenLayers_Control_PanZoomBar_Slider" + this.map.id;
        var slider = OpenLayers.Util.createAlphaImageDiv(id,
                       centered.add(-1, 
                         (this.map.getMaxZoomLevel())*this.zoomStopHeight), 
                       new OpenLayers.Size(20,9), 
                       imgLocation+"slider.png",
                       "absolute");
        this.slider = slider;
        
        var connect = MochiKit.Signal.connect;
        connect(slider, "onmousedown", this, this.zoomBarDown);
        connect(slider, "onmousemove", this, this.zoomBarDrag);
        connect(slider, "onmouseup", this, this.zoomBarUp);
        connect(slider, "ondblclick", this, this.doubleClick);
        connect(slider, "onclick", this, this.doubleClick);
        
        sz = new OpenLayers.Size();
        sz.h = this.zoomStopHeight*(this.map.getMaxZoomLevel()+1);
        sz.w = this.zoomStopWidth;
        var div = null
        
        if (OpenLayers.Util.alphaHack()) {
            var id = "OpenLayers_Control_PanZoomBar" + this.map.id;
            div = OpenLayers.Util.createAlphaImageDiv(id, centered,
                                      new OpenLayers.Size(sz.w, 
                                              this.zoomStopHeight),
                                      imgLocation + "zoombar.png", 
                                      "absolute", null, "crop");
            div.style.height = sz.h;
        } else {
            div = OpenLayers.Util.createDiv(
                        'OpenLayers_Control_PanZoomBar_Zoombar' + this.map.id,
                        centered,
                        sz,
                        imgLocation+"zoombar.png");
        }
        
        this.zoombarDiv = div;
        
        connect(div, "onmousedown", this, this.divClick);
        connect(div, "onmousemove", this, this.zoomBarDrag);
        connect(div, "ondblclick", this, this.doubleClick);
        connect(div, "onclick", this, this.doubleClick);
        
        this.div.appendChild(div);

        this.startTop = parseInt(div.style.top);
        this.div.appendChild(slider);

        connect(this.map,"zoomend", this, this.moveZoomBar);

        centered = centered.add(0, 
            this.zoomStopHeight*(this.map.getMaxZoomLevel()+1));
        return centered; 
    },
    
    /*
     * divClick: Picks up on clicks directly on the zoombar div
     *           and sets the zoom level appropriately.
     */
    divClick: function (evt) {
        var mouse = evt.mouse();
        if (!mouse.button.left) return;
        //var y = this.map.getMousePosition(mouse.client).y;
        var y = mouse.client.y;
        var top = MochiKit.Style.elementPosition(evt.src()).y;
        var levels = Math.floor((y - top)/this.zoomStopHeight);
        this.map.zoomTo(this.map.getMaxZoomLevel() - levels);
        evt.stop();
    },
    
    /* 
     * @param evt
     * event listener for clicks on the slider
     */
    zoomBarDown:function(evt) {
        var mouse = evt.mouse();
        if (!mouse.button.left) return;
        this.temp_evts = [
            connect(this.slider, "onmousemove", this, this.zoomBarDrag),
            connect(this.slider, "onmouseup", this, this.zoomBarUp)
        ];
        this.mouseDragStart = this.map.getMousePosition(mouse.client);
        this.zoomStart = this.map.getMousePosition(mouse.client);
        this.div.style.cursor = "move";
        evt.stop();
    },
    
    /*
     * @param evt
     * This is what happens when a click has occurred, and the client is dragging.
     * Here we must ensure that the slider doesn't go beyond the bottom/top of the 
     * zoombar div, as well as moving the slider to its new visual location
     */
    zoomBarDrag:function(evt) {
        if (this.mouseDragStart != null) {
            var clientXY = evt.mouse().client;
            var xy = this.map.getMousePosition(clientXY);
            var deltaY = this.mouseDragStart.y - xy.y
            var offsets = MochiKit.Style.elementPosition(this.zoombarDiv);
            if ((clientXY.y - offsets.y) > 0 && 
                (clientXY.y - offsets.y) < parseInt(this.zoombarDiv.style.height) - 2) {
                var newTop = parseInt(this.slider.style.top) - deltaY;
                this.slider.style.top = newTop+"px";
            }
            this.mouseDragStart = xy;
        }
        evt.stop();
    },
    
    /* 
     * @param evt
     * Perform cleanup when a mouseup event is received -- discover new zoom level
     * and switch to it.
     */
    zoomBarUp:function(evt) {
        var mouse = evt.mouse();
        if (!mouse.button.left) return;
        if (this.zoomStart) {
            this.div.style.cursor="default";
            MochiKit.Signal.disconnect(this.temp_evts[0]);
            MochiKit.Signal.disconnect(this.temp_evts[1]);
            this.temp_evts = null;
            var deltaY = this.zoomStart.y - this.map.getMousePosition(mouse.client).y;
            this.map.zoomTo(this.map.zoom + Math.round(deltaY/this.zoomStopHeight));
            this.moveZoomBar();
            this.mouseDragStart = null;
            evt.stop();
        }
    },
    
    /* 
    * Change the location of the slider to match the current zoom level.
    */
    moveZoomBar:function() {
        var newTop = 
            (this.map.getMaxZoomLevel() - this.map.getZoom()) * this.zoomStopHeight
            + this.startTop + 1;
        this.slider.style.top = newTop + "px";
    },    
    
    CLASS_NAME: "OpenLayers.Control.PanZoomBar"
});
