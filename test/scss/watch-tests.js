'use strict';

var proxyquire = require('proxyquire'),
    should = require('should'),
    sinon = require('sinon');

/* global describe, it */
describe('scss/watch', function() {

    describe('_compile', function() {
        function test(scssSpyArgs, helperIsPartialStubArgs, changedFilePath) {
            var scssSpy = {};
            if (scssSpyArgs.compileAll) {
                scssSpy.compileAll = sinon.spy();
            } else if (scssSpyArgs.compile) {
                scssSpy.compile = sinon.spy();
            }

            var helperStub = {};
            helperStub.isPartial = sinon.stub();
            helperStub.isPartial.withArgs(changedFilePath)
                .returns(helperIsPartialStubArgs.returnValue);

            var ScssWatcher = require('../../lib/scss/watch');
            var watcher = new ScssWatcher(scssSpy, helperStub);
            watcher._compile(changedFilePath);

            if (scssSpyArgs.compileAll) {
                should.strictEqual(scssSpy.compileAll.calledOnce, true,
                    'compileAll was called once');
            } else if (scssSpyArgs.compile) {
                should.strictEqual(scssSpy.compile.calledOnce, true,
                    'compile was called once');
                should.strictEqual(scssSpy.compile.calledWithExactly(changedFilePath), true,
                    'compile was called with exactly the expected argument');
            }
        }

        it('changedFilePath is a partial', function() {
            var scssSpyArgs = {
                    compileAll: true
                },
                helperIsPartialStubArgs = {
                    returnValue: true
                },
                changedFilePath = 'foo/_bar.scss';
            test(scssSpyArgs, helperIsPartialStubArgs, changedFilePath);
        });

        it('changedFilePath is not a partial', function() {
            var scssSpyArgs = {
                    compile: true
                },
                helperIsPartialStubArgs = {
                    returnValue: false
                },
                changedFilePath = 'foo/bar.scss';
            test(scssSpyArgs, helperIsPartialStubArgs, changedFilePath);
        });
    });

    describe('watch', function() {
        function test(gazeAddSpyArgs, helperGetWatchPatternStubArgs) {
            var gazeOnSpy = sinon.spy(),
                gazeAddSpy = sinon.spy();
            function GazeSpy() {}
            GazeSpy.prototype.on = gazeOnSpy;
            GazeSpy.prototype.add = gazeAddSpy;

            var helperStub = {};
            helperStub.getWatchPattern = sinon.stub();
            helperStub.getWatchPattern.returns(helperGetWatchPatternStubArgs.returnValue);

            var loggerSpy = { log: sinon.spy() };

            var ScssWatcher = proxyquire('../../lib/scss/watch', {
                'gaze': { Gaze: GazeSpy }
            });
            var watcher = new ScssWatcher(undefined, helperStub, undefined, loggerSpy);
            watcher.watch();

            should.strictEqual(gazeAddSpy.calledOnce, true,
                'Gaze.add was called once');
            should.strictEqual(gazeAddSpy.calledWithExactly(gazeAddSpyArgs.expectedArg), true,
                'Gaze.add was called with exactly the expected argument');
        }

        it('watches the pattern', function() {
            var helperGetWatchPatternStubArgs = {
                    returnValue: 'foo/bar/*.scss'
                },
                gazeAddSpyArgs = {
                    expectedArg: 'foo/bar/*.scss'
                };
            test(gazeAddSpyArgs, helperGetWatchPatternStubArgs);
        });
    });

});