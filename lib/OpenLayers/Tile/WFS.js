/* Copyright (c) 2006 MetaCarta, Inc., published under the BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the full
 * text of the license. */
// @require: OpenLayers/Tile.js
/**
* @class
*/
OpenLayers.Tile.WFS = function(layer, position, bounds, url, size) {
    OpenLayers.Tile.WFS.prototype.initialize.apply(this, arguments);
}
OpenLayers.Tile.WFS.prototype = MochiKit.Base.merge(
	OpenLayers.Tile.prototype, {

    /** @type Array(OpenLayers.Feature)*/ 
    features: null,


    /** 
    * @constructor
    *
    * @param {OpenLayers.Layer} layer
    * @param {OpenLayers.Pixel} position
    * @param {OpenLayers.Bounds} bounds
    * @param {String} url
    * @param {OpenLayers.Size} size
    */
    initialize: function(layer, position, bounds, url, size) {
        OpenLayers.Tile.prototype.initialize.apply(this, arguments);
        
        this.features = new Array();
    },

    /**
     * 
     */
    destroy: function() {
        for(var i=0; i < this.features.length; i++) {
            this.features[i].destroy();
        }
        OpenLayers.Tile.prototype.destroy.apply(this, arguments);
    },

    /**
    */
    draw:function() {
        this.loadFeaturesForRegion(MochiKit.Base.bind(this.requestSuccess,this));        
    },

    
    /** get the full request string from the ds and the tile params 
    *     and call the AJAX loadURL(). 
    *
    *     input are function pointers for what to do on success and failure.
    * 
    * @param {function} success
    * @param {function} failure
    */
    loadFeaturesForRegion:function(success, failure) {

        if (!this.loaded) {
        
            if (this.url != "") {
        
                // TODO: Hmmm, this stops multiple loads of the data when a 
                //       result isn't immediately retrieved, but it's hacky. 
                //       Do it better.
                this.loaded = true; 
                var d = MochiKit.Async.doSimpleXMLHttpRequest(this.url);
                d.addCallbacks(success, failure);
                // OpenLayers.loadURL(this.url, null, this, success, failure);
            }
        }
    },
    
    /** Return from AJAX request
    *
    * @param {} request
    */
    requestSuccess:function(request) {
        var doc = request.responseXML;
        
        if (!doc || request.fileType!="XML") {
            doc = OpenLayers.parseXMLString(request.responseText);
        }
        
        var resultFeatures = doc.getElementsByTagName("featureMember");
            
        //clear old featureList
        this.features = [];

        for (var i=0; i < resultFeatures.length; i++) {
        
            var feature = new this.layer.featureClass(this.layer, 
                                                      resultFeatures[i]);
            this.features.append(feature);
        }
        
    },

    /** @final @type String */
    CLASS_NAME: "OpenLayers.Tile.WFS"
  }
);

