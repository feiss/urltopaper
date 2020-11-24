#!/bin/sh

if [[ $1 = "" ]]; then
  echo "Usage:\n\t./build.sh <chrome|fx|clean>\n"
  exit -1
fi

mkdir -p build/chrome
mkdir -p build/fx


if [[ $1 = "chrome" ]]; then
  echo "Building extension for $1.."
  cp manifest-chrome.json manifest.json
  cp urltopaper-chrome.js urltopaper.js
  zip build/chrome/urltopaper.zip *
fi

if [[ $1 = "fx" ]]; then
  echo "Building extension for $1.."
  cp manifest-fx.json manifest.json
  cp urltopaper-fx.js urltopaper.js
  web-ext build -o -a build/fx/
fi

if [[ $1 = "clean" ]]; then
  echo "Cleaning.."
  rm -f urltopaper.js
  rm -f manifest.json
  rm -rf build
fi

echo "Done."
