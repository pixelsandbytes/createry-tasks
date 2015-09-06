'use strict';

var debug = require('debug');

/**
 * debug implementation of logger
 */
function Logger() {
    this.namespacedLoggers = {};
}

Logger.prototype.log = function log(msg, opts) {
    opts = opts || {};
    var logger = this._getLoggers(opts.ns).log;
    logger(msg);
};

Logger.prototype.error = function error(msg, opts) {
    opts = opts || {};
    var logger = this._getLoggers(opts.ns).error;
    logger(msg);
};

Logger.prototype._getLoggers = function _getLoggers(ns) {
    if (!this.namespacedLoggers[ns]) {
        this.namespacedLoggers[ns] = {
            log: debug('createry:' + ns),
            error: debug('createry:' + ns + ':error')
        };
    }
    return this.namespacedLoggers[ns];
};

module.exports = Logger;