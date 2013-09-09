var WindowProxy = function(driver){
    this.driver = driver;
};

WindowProxy.prototype.getDriver = function(){
    return new this.driver.constructor(this.driver.now, this); //Avoid circular ref w/ .constructor call
};

module.exports = WindowProxy;