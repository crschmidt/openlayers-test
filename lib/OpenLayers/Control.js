/* Copyright (c) 2006 MetaCarta, Inc., published under the BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the full
 * text of the license. */
/**
* @class
*/
OpenLayers.Control = function(options) {
	this.initialize(options);
}
OpenLayers.Control.prototype = {

    /** this gets set in the addControl() function in OpenLayers.Map
    * @type OpenLayers.Map */
    map: null,

    /** @type DOMElement */
    div: null,

    /** @type OpenLayers.Pixel */
    position: null,

    /**
    * @constructor
    */
    initialize: function (options) {
        MochiKit.Base.update(this, options);
    },

    /**
    * @param {OpenLayers.Pixel} px
    *
    * @returns A reference to the DIV DOMElement containing the control
    * @type DOMElement
    */
    draw: function (px) {
        if (this.div == null) {
            this.div = OpenLayers.Util.createDiv();
        }
        if (px != null) {
            this.position = px.copyOf();
        }
        this.moveTo(this.position);        
        return this.div;
    },

    /**
    * @param {OpenLayers.Pixel} px
    */
    moveTo: function (px) {
        if ((px != null) && (this.div != null)) {
            this.div.style.left = px.x + "px";
            this.div.style.top = px.x + "px";
        }
    },

    /**
    */
    destroy: function () {
        // eliminate circular references
        this.map = null;
        MochiKit.Signal.disconnect(this);
    },

    /** @final @type String */
    CLASS_NAME: "OpenLayers.Control"
};
