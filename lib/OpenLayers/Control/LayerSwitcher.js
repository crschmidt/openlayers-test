/* Copyright (c) 2006 MetaCarta, Inc., published under the BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the full
 * text of the license. */
// @require: OpenLayers/Control.js
/** 
* @class
*/
OpenLayers.Control.LayerSwitcher = function(options) {
    this.initialize(options);
}
/** color used in the UI to show a layer is active/displayed
*
* @final
* @type String 
*/
OpenLayers.Control.LayerSwitcher.ACTIVE_COLOR = "darkblue";

/** color used in the UI to show a layer is deactivated/hidden
*
* @final
* @type String 
*/
OpenLayers.Control.LayerSwitcher.NONACTIVE_COLOR = "lightblue";


OpenLayers.Control.LayerSwitcher.prototype = MochiKit.Base.merge(
	OpenLayers.Control.prototype, {

    /** @type String */
    activeColor: "",
    
    /** @type String */
    nonActiveColor: "",
    
    /** @type String */
    mode: "checkbox",

    /**
    * @constructor
    */
    initialize: function(options) {
        this.activeColor = OpenLayers.Control.LayerSwitcher.ACTIVE_COLOR;
        this.nonActiveColor = OpenLayers.Control.LayerSwitcher.NONACTIVE_COLOR;
        this.backdrops = [];
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
    },

    /**
    * @returns A reference to the DIV DOMElement containing the switcher tabs
    * @type DOMElement
    */  
    draw: function() {
        // initialize our internal div
        OpenLayers.Control.prototype.draw.apply(this);
		var connect = MochiKit.Signal.connect;
		
        this.div.style.position = "absolute";
        this.div.style.top = "10px";
        this.div.style.right = "0px";
        this.div.style.left = "";
        this.div.style.fontFamily = "sans-serif";
        this.div.style.color = "white";
        this.div.style.fontWeight = "bold";
        this.div.style.marginTop = "3px";
        this.div.style.marginLeft = "3px";
        this.div.style.marginBottom = "3px";
        this.div.style.fontSize="smaller";   
        this.div.style.width = "10em";

        connect(this.map,"addlayer", this, this.redraw);
        connect(this.map,"removelayer", this, this.redraw);
        return this.redraw();    
    },

    /**
    * @returns A reference to the DIV DOMElement containing the switcher tabs
    * @type DOMElement
    */  
    redraw: function() {

        //clear out previous incarnation of LayerSwitcher tabs
        this.div.innerHTML = "";
        var visible = false;
        for( var i = 0; i < this.map.layers.length; i++) {
            if (visible && this.mode == "radio") {
                this.map.layers[i].setVisibility(false);
            } else {
                visible = this.map.layers[i].getVisibility();
            }
            this.addTab(this.map.layers[i]);
        }
            
        return this.div;
    },
    
    /** 
    * @param {event} evt
    */
    singleClick: function(evt) {
        var div = evt.src();

        // See comment about OL #57 fix below.
        // If the click occurred on the corner spans we need
        // to make sure we act on the actual label tab instead.
        div = div.labelElement || div;

        var layer = div.layer;
        if (this.mode == "radio") {
            for(var i=0; i < this.backdrops.length; i++) {
                this.setTabActivation(this.backdrops[i], false);
                this.backdrops[i].layer.setVisibility(false);
            }
            this.setTabActivation(div, true);
            layer.setVisibility(true);
        } else {
            var visible = layer.getVisibility();
            
            this.setTabActivation(div, !visible);
            layer.setVisibility(!visible);
        }
        evt.stop();
    },
    
    /** 
    * @private
    *
    * @param {event} evt
    */
    ignoreEvent: function(evt) {
        evt.stop();
        return false;
    },

    /** 
    * @private
    * 
    * @param {OpenLayers.Layer} layer
    */            
    addTab: function(layer) {
        var DOM = MochiKit.DOM;
		var color = (layer.getVisibility()) ? this.activeColor : this.nonActiveColor;
        var backdropLabelOuter = DOM.DIV({
            id: "LayerSwitcher_" + layer.name + "_Tab", style: {
            	backgroundColor: color,
                marginTop: "4px", marginBottom: "4px"}});
        this._setEventHandlers(backdropLabelOuter);
        
        var backdropLabel = DOM.P({style: {
                marginTop: "0px", marginBottom: "0px",
                paddingTop: "4px", paddingBottom: "4px",
                paddingLeft: "10px", paddingRight: "10px"
                }},
                layer.name);
        
        // add reference to layer onto the div for use in event handlers
        backdropLabel.layer = layer;

        // set event handlers
        this._setEventHandlers(backdropLabel);

        // add label to div
        backdropLabelOuter.appendChild(backdropLabel);
        
        this.backdrops.append(backdropLabel); 
        
        // add div to main LayerSwitcher Div
        this.div.appendChild(backdropLabelOuter);
        if (false) {
        MochiKit.Visual.roundElement(backdropLabelOuter, {corners: "tl bl",
                                      //bgColor: "transparent",
                                      //color: "fromElement",
                                      //__unstable__wrapElement: true,
                                      blend: false});

        // extend the event handlers to operate on the
        // rounded corners as well. (Fixes OL #57.)
        //var spanElements=backdropLabel.parentNode.getElementsByTagName("span");
        
        //for (var currIdx = 0; currIdx < spanElements.length; currIdx++) {
            //this._setEventHandlers(spanElements[currIdx], backdropLabel);
        //}
        }

        this.setTabActivation(backdropLabel, layer.getVisibility());
    },

    /*
      @private
    
      @param {DOMElement} div
      @param {Boolean} activate
    */
    _setEventHandlers : function(element, labelDiv) {

        // We only want to respond to a mousedown event.
        var connect = MochiKit.Signal.connect;
        connect( element, "onclick", this, this.singleClick );
        connect( element, "ondblclick", this, this.singleClick );
        connect( element, "onmouseup", this, this.ignoreEvent );
        connect( element, "onmousedown", this, this.ignoreEvent );

        // If we are operating on a corner span we need to store a
        // reference to the actual tab. (See comment about OL #57 fix above.)
        if (labelDiv) {
            element.labelElement = labelDiv;
        }
    },

    /**
    * @private
    *
    * @param {DOMElement} div
    * @param {Boolean} activate
    */
    setTabActivation:function(div, activate) {
        var color = (activate) ? this.activeColor : this.nonActiveColor;
        div.style.backgroundColor = color;
        // Rico.Corner.changeColor(div, color);
    },



    /** @final @type String */
    CLASS_NAME: "OpenLayers.Control.LayerSwitcher"
});

