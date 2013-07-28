var asyncblock = require('asyncblock');


exports.it = function(name, func){
    it(name, function(done){
        asyncblock(function(){
            func();
            done();
        });
    });
};

exports.beforeEach = function(func){
    beforeEach(function(done){
        asyncblock(function(){
            func();
            done();
        });
    });
};