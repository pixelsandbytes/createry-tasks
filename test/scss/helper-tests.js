'use strict';

var path = require('path'),
    should = require('should'),
    sinon = require('sinon');

var ScssHelper = require('../../lib/scss/helper');

function normalizePathForPlatform(filePath) {
    return filePath.replace(/\//g, path.sep);
}

/* global describe, it */
describe('scss/helper', function() {

    describe('_getInFolder', function() {
        function test(args, envArgs, expected) {
            var helper = new ScssHelper(args, envArgs),
                inFolder = helper._getInFolder();
            expected = normalizePathForPlatform(expected);
            should.strictEqual(inFolder, expected);
        }

        it('no inFolder', function() {
            var args = { inFolder: '' },
                envArgs = { websrc: 'web' },
                expected = 'web';
            test(args, envArgs, expected);
        });

        it('first-level folders', function() {
            var args = { inFolder: 'scss' },
                envArgs = { websrc: 'web' },
                expected = 'web/scss';
            test(args, envArgs, expected);
        });

        it('first-level folders with trailing slashes', function() {
            var args = { inFolder: 'scss/' },
                envArgs = { websrc: 'web/' },
                expected = 'web/scss/';
            test(args, envArgs, expected);
        });

        it('nested folders', function() {
            var args = { inFolder: 'scss/src' },
                envArgs = { websrc: 'web/src/' },
                expected = 'web/src/scss/src';
            test(args, envArgs, expected);
        });
    });

    describe('getInFilePaths', function() {
        function test(args, envArgs, fsExpandStubArgs, expected) {
            var fsExpandStub = sinon.stub();
            fsExpandStub.withArgs( normalizePathForPlatform(fsExpandStubArgs.expectedArg) )
                .returns(fsExpandStubArgs.returnValue);
            var fsStub = { expand: fsExpandStub };
            var helper = new ScssHelper(args, envArgs, fsStub);
            var inFilePaths = helper.getInFilePaths();
            should.deepEqual(inFilePaths, expected);
        }

        it('no inFiles', function() {
            var args = {
                    inFolder: 'scss',
                    inFiles: ''
                },
                envArgs = { websrc: 'web' },
                fsExpandStubArgs = {
                    expectedArg: 'web/scss',
                    returnValue: []
                },
                expected = [];
            test(args, envArgs, fsExpandStubArgs, expected);
        });

        it('has inFiles', function() {
            var args = {
                    inFolder: 'scss',
                    inFiles: '**/*.scss'
                },
                envArgs = { websrc: 'web' },
                fsExpandStubArgs = {
                    expectedArg: 'web/scss/**/*.scss',
                    returnValue: [
                        'web/scss/foo/bar.scss',
                        'web/scss/foo/baz.scss',
                        'web/scss/blah.scss'
                    ]
                },
                expected = [
                    'web/scss/foo/bar.scss',
                    'web/scss/foo/baz.scss',
                    'web/scss/blah.scss'
                ];
            test(args, envArgs, fsExpandStubArgs, expected);
        });
    });

    describe('getOutFilePath', function() {
        function test(args, envArgs, inFilePath, expected) {
            var helper = new ScssHelper(args, envArgs),
                outFilePath = helper.getOutFilePath(inFilePath);
            expected = normalizePathForPlatform(expected);
            should.strictEqual(outFilePath, expected);
        }

        it('has outFolder', function() {
            var args = {
                    inFolder: 'scss',
                    outFolder: 'css'
                },
                envArgs = {
                    websrc: 'web'
                },
                inFilePath = 'web/scss/foo.scss',
                expected = 'web/css/foo.css';
            test(args, envArgs, inFilePath, expected);
        });

        it('nested outFolder', function() {
            var args = {
                    inFolder: 'scss',
                    outFolder: '_auto/css'
                },
                envArgs = {
                    websrc: 'web'
                },
                inFilePath = 'web/scss/foo.scss',
                expected = 'web/_auto/css/foo.css';
            test(args, envArgs, inFilePath, expected);
        });

        it('nested inFilePath', function() {
            var args = {
                    inFolder: 'scss/',
                    outFolder: 'css/'
                },
                envArgs = {
                    websrc: 'web/'
                },
                inFilePath = 'web/scss/foo/bar/baz.scss',
                expected = 'web/css/foo/bar/baz.css';
            test(args, envArgs, inFilePath, expected);
        });
    });

    describe('getWatchPattern', function() {
        function test(args, envArgs, expected) {
            var helper = new ScssHelper(args, envArgs),
                watchPattern = helper.getWatchPattern();
            expected = normalizePathForPlatform(expected);
            should.strictEqual(watchPattern, expected);
        }

        it('no watchPattern', function() {
            var args = {
                    inFolder: 'scss',
                    watchFiles: ''
                },
                envArgs = {
                    websrc: 'web'
                },
                expected = 'web/scss';
            test(args, envArgs, expected);
        });

        it('has watchPattern', function() {
            var args = {
                    inFolder: 'scss',
                    watchFiles: '**/*.scss'
                },
                envArgs = {
                    websrc: 'web'
                },
                expected = 'web/scss/**/*.scss';
            test(args, envArgs, expected);
        });
    });

    describe('isPartial', function() {
        function test(scssFilePath, expected) {
            var helper = new ScssHelper(),
                isPartial = helper.isPartial(scssFilePath);
            should.strictEqual(isPartial, expected);
        }

        it('not partial, in root directory', function() {
            var scssFilePath = 'foo.scss',
                expected = false;
            test(scssFilePath, expected);
        });

        it('not partial, in nested directory', function() {
            var scssFilePath = 'foo/_bar/baz.scss',
                expected = false;
            test(scssFilePath, expected);
        });

        it('is partial, in root directory', function() {
            var scssFilePath = '_foo.scss',
                expected = true;
            test(scssFilePath, expected);
        });

        it('is partial, in nested directory', function() {
            var scssFilePath = 'foo/bar/_baz.scss',
                expected = true;
            test(scssFilePath, expected);
        });
    });

});