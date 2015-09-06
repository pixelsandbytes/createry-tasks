'use strict';

var Gaze = require('gaze').Gaze;

var loggerOpts = { ns: 'scss' };

function ScssWatch(scss, helper, fs, logger, done) {
    this.scss = scss;
    this.helper = helper;
    this.fs = fs;
    this.logger = logger;
    this.done = done;
}

ScssWatch.prototype._compile = function _compile(changedFilePath) {
    if (this.helper.isPartial(changedFilePath)) {
        this.scss.compileAll();
    } else {
        this.scss.compile(changedFilePath);
    }
};

ScssWatch.prototype.watch = function watch() {
    var gaze = new Gaze();
    var watchPattern = this.helper.getWatchPattern();
    var me = this;

    gaze.on('error', function(error) {
        me.logger.error('Error initializing gaze: ' + error, loggerOpts);
        me.done(false);
    });

    gaze.on('changed', function(filePath) {
        me._compile(filePath);
    });
    gaze.on('added', function(filePath) {
        me._compile(filePath);
    });
    gaze.on('renamed', function(newFilePath) {
        me._compile(newFilePath);
    });
    gaze.on('deleted', function(filePath) {
        if (me.helper.isPartial(filePath)) {
            me.scss.compileAll();
        } else {
            // Delete CSS file
            var outFilePath = me.helper.getOutFilePath(filePath);
            me.fs.remove(outFilePath);
            me.logger.log('Deleted ' + outFilePath, loggerOpts);
        }
    });

    gaze.add(watchPattern);
    this.logger.log('Watching ' + watchPattern + ' to (re-)compile scss', loggerOpts);
};

module.exports = ScssWatch;