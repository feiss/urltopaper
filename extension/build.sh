#!/bin/sh

if [[ $1 = "" ]]; then
  echo "Usage:\n\t./build.sh <chrome|fx>\n"
  exit -1
fi

mkdir -p build/chrome
mkdir -p build/fx

echo "Building extension for $1.."

if [[ $1 = "chrome" ]]; then
  cp manifest-chrome.json manifest.json
  cp urltopaper-chrome.js urltopaper.js
  zip build/chrome/urltopaper.zip *
fi

if [[ $1 = "fx" ]]; then
  cp manifest-fx.json manifest.json
  cp urltopaper-fx.js urltopaper.js
  web-ext build -o -a build/fx/
  rm manifest.json
fi


echo "Build done."
