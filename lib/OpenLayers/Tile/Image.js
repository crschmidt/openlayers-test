/* Copyright (c) 2006 MetaCarta, Inc., published under the BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the full
 * text of the license. */
// @require: OpenLayers/Tile.js
/**
* @class
*/
OpenLayers.Tile.Image = function(layer, position, bounds, url, size) {
    OpenLayers.Tile.Image.prototype.initialize.apply(this, arguments);
}
OpenLayers.Tile.Image.prototype = MochiKit.Base.merge(
	OpenLayers.Tile.prototype, {
    
    /** @type DOMElement img */
    imgDiv:null,

    /** 
    * @constructor
    *
    * @param {OpenLayers.Grid} layer
    * @param {OpenLayers.Pixel} position
    * @param {OpenLayers.Bounds} bounds
    * @param {String} url
    * @param {OpenLayers.Size} size
    */
    initialize: function(layer, position, bounds, url, size) {
        OpenLayers.Tile.prototype.initialize.apply(this, arguments);
    },

    destroy: function() {
        if ((this.imgDiv != null) && (this.imgDiv.parentNode == this.layer.div)) {
            this.layer.div.removeChild(this.imgDiv);
        }
        this.imgDiv = null;
        OpenLayers.Tile.prototype.destroy.apply(this, arguments);
    },

    /**
    */
    draw:function(transparent) {
        if (false) { // don't actually use the alpha PNG hack right now
                     // it has a fiercely bad effect on IE6's performance
            // if (transparent) {
            this.imgDiv = OpenLayers.Util.createAlphaImageDiv(null,
                                                           this.position,
                                                           this.size,
                                                           this.url,
                                                           "absolute");
        } else {
            this.imgDiv = OpenLayers.Util.createImage(null,
                                                      this.position,
                                                      this.size,
                                                      this.url,
                                                      "absolute");
        }
        this.layer.div.appendChild(this.imgDiv);
    },

    /** @final @type String */
    CLASS_NAME: "OpenLayers.Tile.Image"
  }
);
