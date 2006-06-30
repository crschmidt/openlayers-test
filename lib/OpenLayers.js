/* Copyright (c) 2006 MetaCarta, Inc., published under the BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the full
 * text of the license. */
////
/// This blob sucks in all the files in uncompressed form for ease of use
///

OpenLayers = {};
OpenLayers._scriptName = "lib/OpenLayers.js";
OpenLayers._scriptLocation = null;
OpenLayers._getScriptLocation = function () {
    if (OpenLayers._scriptLocation != null){
        return OpenLayers._scriptLocation;
    }
    var scriptLocation = "";
    var SCRIPT_NAME = OpenLayers._scriptName;
 
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
        var src = scripts[i].getAttribute('src');
        if (src) {
            if (src.match(/MochiKit.js$/)) {
                scriptLocation = src.substring(0, src.lastIndexOf('lib/MochiKit/MochiKit.js'));
                break;
            }
        }
    }
    OpenLayers._scriptLocation = scriptLocation;
    return scriptLocation;
}

/*
  `_OPENLAYERS_SFL_` is a flag indicating this file is being included
  in a Single File Library build of the OpenLayers Library.

  When we are *not* part of a SFL build we dynamically include the
  OpenLayers library code.

  When we *are* part of a SFL build we do not dynamically include the 
  OpenLayers library code as it will be appended at the end of this file.
*/
if (typeof(_OPENLAYERS_SFL_) == "undefined") {
    /*
      The original code appeared to use a try/catch block
      to avoid polluting the global namespace,
      we now use a anonymous function to achieve the same result.
     */
    (function() {
    var jsfiles= [
        //"Prototype.js",
        //"Rico/Corner.js",
        //"Rico/Color.js",
        "OpenLayers/Util.js",
        // "OpenLayers/Ajax.js",
        //"OpenLayers/Events.js",
        "OpenLayers/Map.js",
        "OpenLayers/Layer.js",
        "OpenLayers/Icon.js",
        "OpenLayers/Marker.js",
        "OpenLayers/Popup.js",
        "OpenLayers/Tile.js",
        "OpenLayers/Feature.js",
        "OpenLayers/Feature/WFS.js",
        "OpenLayers/Tile/Image.js",
        "OpenLayers/Tile/WFS.js",
//        "OpenLayers/Layer/Google.js",
//        "OpenLayers/Layer/VirtualEarth.js",
//        "OpenLayers/Layer/Yahoo.js",
        "OpenLayers/Layer/Grid.js",
        "OpenLayers/Layer/KaMap.js",
        "OpenLayers/Layer/Markers.js",
        "OpenLayers/Layer/Text.js",
        "OpenLayers/Layer/WorldWind.js",
        "OpenLayers/Layer/WMS.js",
        "OpenLayers/Layer/WFS.js",
        "OpenLayers/Layer/WMS/Untiled.js",
        "OpenLayers/Layer/GeoRSS.js",
        "OpenLayers/Popup/Anchored.js",
        "OpenLayers/Popup/AnchoredBubble.js",
        "OpenLayers/Control.js",
        "OpenLayers/Control/MouseDefaults.js",
        "OpenLayers/Control/MouseToolbar.js",
        "OpenLayers/Control/KeyboardDefaults.js",
        "OpenLayers/Control/PanZoom.js",
        "OpenLayers/Control/PanZoomBar.js",
        "OpenLayers/Control/LayerSwitcher.js"
    ]; // etc.

    var allScriptTags = "";
    var host = OpenLayers._getScriptLocation() + "lib/";

    //"<script>MochiKit.Logging.logDebug(Start loading');</script>";
    for (var i = 0; i < jsfiles.length; i++) {
        var currentScriptTag = "<script src='" + host + jsfiles[i] + "'></script>"; 
        allScriptTags += currentScriptTag;
        //allScriptTags += "<script>MochiKit.Logging.logDebug('"+jsfiles[i]+"');</script>";
    }
    document.write(allScriptTags);
    })();
}
