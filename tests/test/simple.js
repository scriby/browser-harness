var asyncblock = require('asyncblock');
if( asyncblock.enableTransform(module)) { return; }

var assert = require('assert');

exports.setup = function(args){
    describe('When viewing simple.html', function(){
        it('contains a message div', function(done){
            asyncblock(function(flow){
                args.driver.setUrl('http://localhost:4501/simple.html');

                var message = args.driver.findElement('#message');
                var contents = message.html();

                assert.equal(contents, 'This is just a simple test page!');
            }, done);
        });
    });
};