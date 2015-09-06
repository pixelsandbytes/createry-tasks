'use strict';

var path = require('path');

function ScssHelper(args, envArgs, fs) {
    this.args = args;
    this.envArgs = envArgs;
    this.fs = fs;
}

ScssHelper.prototype._getInFolder = function _getInFolder() {
    return path.join(this.envArgs.websrc, this.args.inFolder);
};

ScssHelper.prototype.getInFilePaths = function getInFilePaths() {
    var inFilePattern = path.join(this._getInFolder(), this.args.inFiles);
    var inFilePaths = this.fs.expand(inFilePattern);
    return inFilePaths;
};

ScssHelper.prototype.getOutFilePath = function getOutFilePath(inFilePath) {
    var relOutFilePath = path.relative(this._getInFolder(), inFilePath);
    var outScssFilePath = path.join(this.envArgs.websrc, this.args.outFolder, relOutFilePath);
    // Replace .scss with .css
    var outDirName = path.dirname(outScssFilePath);
    var outBaseName = path.join(
        path.basename(outScssFilePath, path.extname(outScssFilePath)) + '.css'
    );
    return path.join(outDirName, outBaseName);
};

ScssHelper.prototype.getWatchPattern = function getWatchPattern() {
    return path.join(this._getInFolder(), this.args.watchFiles);
};

ScssHelper.prototype.isPartial = function isPartial(scssFilePath) {
    var scssFileName = path.basename(scssFilePath);
    return 0 === scssFileName.indexOf('_');
};

module.exports = ScssHelper;