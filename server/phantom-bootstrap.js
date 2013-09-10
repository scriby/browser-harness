var page = require('webpage').create();

page.open(phantom.args[0], function (status) {
/*  setInterval(function(){
        page.render('screenshot.png');
    }, 1000);

    page.onPageCreated = function(newPage) {
        setInterval(function(){
            newPage.render('popup.png');
        }, 1000);
    };
*/
});