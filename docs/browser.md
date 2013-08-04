# Browser

Documentation for [browser.js](https://github.com/scriby/browser-harness/blob/master/server/browser.js)

This class provides some helpers around spawning browser instances on the current machine, which can be used to
run your tests. You don't have to use this class to open the browser, and the browser can be opened from any location.
For instance, you can start the harness server on a mac or linux machine, then connect a browser running from a windows
machine or iPhone.

### constructor

`new harness.Browser({ type: 'chrome' | 'firefox' | 'safari' | 'phantomjs' | 'other', location?: string, args?: [] })`

If the browsers are installed at their default location, and you're not using any special configuration, location and
args do not need to be passed.

### open

`void open(harnessUrl: string, [serverUrl: string])`

Opens the browser to the specified harnessUrl. The URL should point to the location of the harness.html hosted within
your site or application. The serverUrl is optional, and should be specified if the browser harness server is not hosted
at localhost:4500.

### close

`void close()`

Closes the browser. If not called, then the browser process will remain open after tests run (which can be helpful
when debugging test failures).