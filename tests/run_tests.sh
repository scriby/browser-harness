#!/bin/bash

runMode="spec"
timeout="10000"
browser="phantomjs"
args=""

# read command line params
while(($#)); do
    case $1 in
    -R)
        runMode=$2
        shift 2
        ;;
    -t)
        timeout=$2
        shift 2
        ;;
    -b)
        browser=$2
        shift 2
        ;;
    *)
        args="$args $1"
        shift
        ;;
    esac
done

if [ "$browser" == "phantomjs" ] || [ "$browser" == "chrome" ] || [ "$browser" == "firefox" ] || [ "$browser" == "safari" ]; then
    BROWSER=$browser ./node_modules/mocha/bin/mocha all_tests.js -R $runMode -t $timeout $args
else
    echo "Invalid browser: $browser"
    exit 1
fi
