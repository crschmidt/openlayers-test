/* Copyright (c) 2006 MetaCarta, Inc., published under the BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the full
 * text of the license. */
// @require: OpenLayers/Control.js

/**
 * @class
 */
OpenLayers.Control.KeyboardDefaults = function() {
    this.initialize();
}
OpenLayers.Control.KeyboardDefaults.prototype = MochiKit.Base.merge(
	OpenLayers.Control.prototype, {

    /** @type int */
    slideFactor: 50,

    /**
     * @constructor
     */
    initialize: function() {
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
    },
    
    /**
     * 
     */
    draw: function() {
    	MochiKit.Signal.connect(document, "onkeypress", this, this.defaultKeyDown);
    },
    
    /**
    * @param {Event} evt
    */
    defaultKeyDown: function (evt) {
		MochiKit.Logging.logDebug('defaultKeyDown: ', MochiKit.Base.items(evt.key()));
        switch(evt.key().string) {
            case 'KEY_ARROW_LEFT':
                this.map.pan( -50, 0);
                break;
            case 'KEY_ARROW_RIGHT': 
                this.map.pan(50, 0);
                break;
            case 'KEY_ARROW_UP':
                this.map.pan(0, 50);
                break;
            case 'KEY_ARROW_DOWN':
                this.map.pan(0, -50);
                break;
        }
    },
    
    /** @final @type String */
    CLASS_NAME: "OpenLayers.Control.KeyboardDefaults"
});
