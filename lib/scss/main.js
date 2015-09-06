'use strict';

var sass = require('node-sass');

var loggerOpts = { ns: 'scss' };

function Scss(helper, fs, logger) {
   this.helper = helper;
   this.fs = fs;
   this.logger = logger;
}

Scss.prototype.compileAll = function compileAll() {
    var inFilePaths = this.helper.getInFilePaths();
    var me = this;
    inFilePaths.forEach(function(inFilePath) {
        me.compile(inFilePath);
    });
};

Scss.prototype.compile = function compile(inFilePath) {
    var outFilePath = this.helper.getOutFilePath(inFilePath);
    var result = sass.renderSync({
        file: inFilePath
    });
    this.fs.write(outFilePath, result.css);
    this.logger.log('Compiled scss: ' + inFilePath + ' > ' + outFilePath, loggerOpts);
};

module.exports = Scss;