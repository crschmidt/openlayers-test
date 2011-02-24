#!/usr/bin/env python

import sys
sys.path.append("../tools")
import mergejs
import optparse

def build(config_file = None, output_file = None, options = None):
    have_compressor = []
    try:
        import jsmin
        have_compressor.append("jsmin")
    except ImportError:
        print "No jsmin"
    
    try:
        import minimize
        have_compressor.append("minimize")
    except ImportError:
        print "No minimize"

    use_compressor = None
    if options.compressor and options.compressor in have_compressor:
        use_compressor = options.compressor

    sourceDirectory = "../lib"
    configFilename = "full.cfg"
    outputFilename = "OpenLayers.js"

    if config_file:
        configFilename = config_file
        extension = configFilename[-4:]

        if extension  != ".cfg":
            configFilename = config_file + ".cfg"

    if output_file:
        outputFilename = output_file

    print "Merging libraries."
    merged = mergejs.run(sourceDirectory, None, configFilename)
    if use_compressor == "jsmin":
        print "Compressing using jsmin."
        minimized = jsmin.jsmin(merged)
    elif use_compressor == "minimize":
        print "Compressing using minimize."
        minimized = minimize.minimize(merged)
    else: # fallback
        print "Not compressing."
        minimized = merged 
    print "Adding license file."
    minimized = file("license.txt").read() + minimized

    print "Writing to %s." % outputFilename
    file(outputFilename, "w").write(minimized)

    print "Done."

if __name__ == '__main__':
  opt = optparse.OptionParser(usage="%s [options] [config_file] [output_file]\n  Default config_file is 'full.cfg', Default output_file is 'OpenLayers.js'")
  opt.add_option("-c", "--compressor", dest="compressor", help="compression method: one of 'jsmin', 'minimize', or 'none'", default="jsmin")
  (options, args) = opt.parse_args()
  build(*args, options=options)
