exports.constructHarnessUrl = function(harnessUrl, serverUrl){
    if(harnessUrl == null){
        throw new Error('harnessUrl is required');
    }

    if(serverUrl){
        if(serverUrl.indexOf('://')){
            serverUrl = 'http://' + serverUrl;
        }

        harnessUrl += '?host=' + encodeURIComponent(serverUrl);
    }

    return harnessUrl;
};