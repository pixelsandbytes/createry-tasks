'use strict';

var proxyquire = require('proxyquire'),
    should = require('should'),
    sinon = require('sinon');

/* global describe, it */
describe('scss/main', function() {
    function setupSingleArgStub(stub, args) {
        stub.withArgs(args.expectedArg)
            .returns(args.returnValue);
    }

    describe('compileAll', function() {
        function test(helperArgs, sassArgs) {
            var helperStub = {
                    getInFilePaths: sinon.stub(),
                    getOutFilePath: sinon.stub()
                },
                sassStub = {
                    renderSync: sinon.stub()
                },
                fsSpy = {
                    write: sinon.spy()
                },
                loggerSpy = {
                    log: sinon.spy()
                };

            helperStub.getInFilePaths.returns(helperArgs.getInFilePaths.returnValue);
            helperArgs.getOutFilePath.forEach(function(args) {
                setupSingleArgStub(helperStub.getOutFilePath, args);
            });

            sassArgs.renderSync.forEach(function(args) {
                setupSingleArgStub(sassStub.renderSync, args);
            });

            var Scss = proxyquire('../../lib/scss/main', {
                'node-sass': sassStub
            });
            var scss = new Scss(helperStub, fsSpy, loggerSpy);
            scss.compileAll();

            return fsSpy.write;
        }

        function verify(fsWriteSpy, fsWriteExpectedArgs) {
            should.strictEqual(fsWriteSpy.callCount, fsWriteExpectedArgs.length,
                'fs.write was called ' + fsWriteExpectedArgs.length + ' time(s)');
            fsWriteExpectedArgs.forEach(function(args) {
                should.strictEqual(fsWriteSpy.withArgs(args.expectedArg1, args.expectedArg2)
                    .calledOnce, true,
                    'fs.write(' + args.expectedArg1 + ', ' + args.expectedArg2 + ') called once');
            });
        }

        it('getInFilePaths return empty array', function() {
            var helperArgs = {
                getInFilePaths: {
                    returnValue: []
                },
                getOutFilePath: []
            };
            var sassArgs = {
                renderSync: []
            };
            var fsWriteSpy = test(helperArgs, sassArgs);
            should.strictEqual(fsWriteSpy.called, false);
        });

        it('getInFilePaths return array with one path', function() {
            var helperArgs = {
                getInFilePaths: {
                    returnValue: ['foo/bar/baz.scss']
                },
                getOutFilePath: [
                    {
                        expectedArg: 'foo/bar/baz.scss',
                        returnValue: 'foo/bar/baz.css'
                    }
                ]
            };
            var sassArgs = {
                renderSync: [
                    {
                        expectedArg: {
                            file: 'foo/bar/baz.scss'
                        },
                        returnValue: {
                            css: '.styles { for: baz }'
                        }
                    }
                ]
            };
            var fsWriteSpy = test(helperArgs, sassArgs);

            var fsWriteExpectedArgs = [
                {
                    expectedArg1: 'foo/bar/baz.css',
                    expectedArg2: '.styles { for: baz }'
                }
            ];
            verify(fsWriteSpy, fsWriteExpectedArgs);
        });

        it('getInFilePaths return array with multiple paths', function() {
            var helperArgs = {
                getInFilePaths: {
                    returnValue: [
                        'foo/bar/baz.scss',
                        'foo/bar/blah.scss',
                        'foo/boo.scss'
                    ]
                },
                getOutFilePath: [
                    {
                        expectedArg: 'foo/bar/baz.scss',
                        returnValue: 'foo/bar/baz.css'
                    },{
                        expectedArg: 'foo/bar/blah.scss',
                        returnValue: 'foo/bar/blah.css'
                    },{
                        expectedArg: 'foo/boo.scss',
                        returnValue: 'foo/boo.css'
                    }
                ]
            };
            var sassArgs = {
                renderSync: [
                    {
                        expectedArg: {
                            file: 'foo/bar/baz.scss'
                        },
                        returnValue: {
                            css: '.styles { for: baz }'
                        }
                    },{
                        expectedArg: {
                            file: 'foo/bar/blah.scss'
                        },
                        returnValue: {
                            css: '.more .styles { for: blah }'
                        }
                    },{
                        expectedArg: {
                            file: 'foo/boo.scss'
                        },
                        returnValue: {
                            css: '/* no styles here */'
                        }
                    }
                ]
            };
            var fsWriteSpy = test(helperArgs, sassArgs);

            var fsWriteExpectedArgs = [
                {
                    expectedArg1: 'foo/bar/baz.css',
                    expectedArg2: '.styles { for: baz }'
                },{
                    expectedArg1: 'foo/bar/blah.css',
                    expectedArg2: '.more .styles { for: blah }'
                },{
                    expectedArg1: 'foo/boo.css',
                    expectedArg2: '/* no styles here */'
                }
            ];
            verify(fsWriteSpy, fsWriteExpectedArgs);
        });
    });

    describe('compile', function() {
        function test(inFilePath, helperArgs, sassArgs) {
            var helperStub = {
                    getOutFilePath: sinon.stub()
                },
                sassStub = {
                    renderSync: sinon.stub()
                },
                fsSpy = {
                    write: sinon.spy()
                },
                loggerSpy = {
                    log: sinon.spy()
                };

            setupSingleArgStub(helperStub.getOutFilePath, helperArgs.getOutFilePath);
            setupSingleArgStub(sassStub.renderSync, sassArgs.renderSync);

            var Scss = proxyquire('../../lib/scss/main', {
                'node-sass': sassStub
            });
            var scss = new Scss(helperStub, fsSpy, loggerSpy);
            scss.compile(inFilePath);

            return fsSpy.write;
        }

        it('writes the sass output to file', function() {
            var helperArgs = {
                getOutFilePath: {
                    expectedArg: 'foo/bar/baz.scss',
                    returnValue: 'foo/bar/baz.css'
                }
            };
            var sassArgs = {
                renderSync: {
                    expectedArg: {
                        file: 'foo/bar/baz.scss'
                    },
                    returnValue: {
                        css: '.styles { for: baz }'
                    }
                }
            };
            var fsWriteSpy = test('foo/bar/baz.scss', helperArgs, sassArgs);

            should.strictEqual(fsWriteSpy.calledOnce, true, 'fs.write was called once');
            should.strictEqual(fsWriteSpy.calledWithExactly(
                    'foo/bar/baz.css', '.styles { for: baz }'
                ),
                true, 'fs.write was called with the expected arguments');
        });
    });

});