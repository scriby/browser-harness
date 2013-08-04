# Config

Documentation for [driver.js](https://github.com/scriby/browser-harness/blob/master/server/config.js).

### timeoutMS

The amount of time in milliseconds to wait by default on operations such as finding elements or waitFor conditions.

### retryMS

The amount of time in milliseconds to wait between retry attempts for operations such as finding elements or waitFor conditions.



To update the config:

```javascript
var harness = require('browser-harness');
harness.config.timeoutMS = 1000;
harness.config.retryMS = 50;
```