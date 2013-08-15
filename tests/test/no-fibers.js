var async = require('async');
var assert = require('assert');

exports.setup = function(args){
    describe('When viewing no-fibers.html', function(){
        var driver;

        it('loads the URL', function(done){
            driver = args.driver;
            driver.setUrl(args.baseUrl + '/no-fibers.html', done);
        });

        it('selecting a test-div works', function(done){
            async.waterfall([
                function(callback){
                    driver.findElement('.test-div:first', callback);
                },

                function(testDiv, callback){
                    assert(testDiv);
                    assert.equal(testDiv.length, 1);

                    testDiv.html(callback);
                }
            ], function(err, result){
                assert.ifError(err);
                assert.equal(result, 'contents 1');

                done(err);
            });
        });

        it('selecting multiple test-divs works', function(done){
            async.waterfall([
                function(callback){
                    driver.findElements('.test-div', callback);
                },

                function(testDivs, callback){
                    assert(testDivs);
                    assert.equal(testDivs.length, 2);

                    testDivs.filter(':last', callback);
                },

                function(lastDiv, callback){
                    lastDiv.html(callback);
                }
            ], function(err, result){
                assert.ifError(err);
                assert.equal(result, 'contents 2');

                done(err);
            });
        });

        it('selecting visible test-div works', function(done){
            async.waterfall([
                function(callback){
                    driver.findVisible('.test-div:first', callback);
                },

                function(testDiv, callback){
                    assert(testDiv);
                    assert.equal(testDiv.length, 1);

                    testDiv.html(callback);
                }
            ], function(err, result){
                assert.ifError(err);
                assert.equal(result, 'contents 1');

                done(err);
            });
        });

        it('selecting multiple visible test-divs works', function(done){
            async.waterfall([
                function(callback){
                    driver.findVisibles('.test-div', callback);
                },

                function(testDivs, callback){
                    assert(testDivs);
                    assert.equal(testDivs.length, 2);

                    testDivs.filter(':last', callback);
                },

                function(lastDiv, callback){
                    lastDiv.html(callback);
                }
            ], function(err, result){
                assert.ifError(err);
                assert.equal(result, 'contents 2');

                done(err);
            });
        });

        it('watifor waits for a div to appear', function(done){
            async.waterfall([
                function(callback){
                    driver.waitFor({
                        condition: function(callback) {
                            driver.findVisible('div.waitfor-test-div', function(err, element){
                                return callback(err, element.length === 1);
                            });
                        },

                        exec: function(){
                            driver.findVisible('body', function(err, body){
                                if(err){ throw err }

                                body.append('<div class="waitfor-test-div">test</div>');
                            });
                        },

                        timeoutMS: 2000
                    }, callback);
                },

                function(callback){
                    driver.findVisible('div.waitfor-test-div', callback);
                }
            ], function(err, result){
                assert.ifError(err);

                assert(result);
                assert(result.length, 1);

                done();
            });
        });

        it('waitfor times out if the condition is not met', function(done){
            driver.waitFor(function(){
                return false;
            }, function(err){
                assert(err instanceof Error);
                assert.equal(err.message.indexOf('waitFor condition timed out'), 0);

                done();
            });
        });

        it('calling exec directly works', function(done){
            driver.exec(function(){
                return $('.test-div:first').html();
            }, function(err, result){
                assert.ifError(err);

                assert.equal(result, 'contents 1');
                done();
            });
        });
    });
};