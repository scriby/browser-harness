var tu = require('../test_util.js');
var assert = require('assert');

exports.setup = function(args){
    describe('When viewing simple.html', function(){
        tu.it('contains a message div', function(){
            args.driver.setUrl(args.baseUrl + '/simple.html');

            var message = args.driver.findElement('#message');
            var contents = message.html();

            assert.equal(contents, 'This is just a simple test page!');
        });
    });
};