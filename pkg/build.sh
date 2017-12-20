#!/bin/bash

set -e

BUILD_PATH=$PWD
OUT_PATH=${OUT_PATH:-$PWD/root}

install -D -m 755 $BUILD_PATH/src/informo \
	-t $OUT_PATH/usr/bin/
install -d -D $OUT_PATH/usr/lib/informo/app/
cp -R $BUILD_PATH/../{static/,dist/} \
	$OUT_PATH/usr/lib/informo/app/
rm $OUT_PATH/usr/lib/informo/app/dist/*.map || true # TODO dirty as ***
install -D -m 644 $BUILD_PATH/../{main.js,index.html} \
	-t $OUT_PATH/usr/lib/informo/app/

install -D -m 644 $BUILD_PATH/../static/img/logo-round-colored-256.png \
	$OUT_PATH/usr/share/icons/hicolor/256x256/informo.png
install -D -m 644 $BUILD_PATH/src/informo.desktop \
	$OUT_PATH/usr/share/applications/informo.desktop
