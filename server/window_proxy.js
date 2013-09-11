var WindowProxy = function(driver, id){
    this.driver = driver;
    this.id = id;
    this.isWindowProxy = true;
};

WindowProxy.prototype.getDriver = function(){
    return new this.driver.constructor(this.driver.now, this); //Avoid circular ref w/ .constructor call
};

WindowProxy.prototype.isOpen = function(callback){
    return this.driver.isWindowOpen(this, callback);
};

WindowProxy.prototype.toJSON = function(){
    return {
        isWindowProxy: true,
        id: this.id
    };
};

module.exports = WindowProxy;