#!/usr/bin/env bash

# USAGE

# ./convertToPng <input png or ico> <outfilename>.png
# Example
# ./convertToPng ~/sample.ico ~/Desktop/converted.png

set -e

HAVE_IMAGEMAGICK=
HAVE_GRAPHICSMAGICK=

type convert &>/dev/null && type identify &>/dev/null && HAVE_IMAGEMAGICK=true
type gm &>/dev/null && gm version | grep GraphicsMagick &>/dev/null && HAVE_GRAPHICSMAGICK=true

if [[ -z "$HAVE_IMAGEMAGICK" && -z "$HAVE_GRAPHICSMAGICK" ]]; then
	type convert >/dev/null 2>&1 || echo >&2 "Cannot find required ImageMagick 'convert' executable"
	type identify >/dev/null 2>&1 || echo >&2 "Cannot find required ImageMagick 'identify' executable"
	type gm &>/dev/null && gm version | grep GraphicsMagick &>/dev/null && echo >&2 "Cannot find GraphicsMagick"
	echo >&2 "ImageMagic or GraphicsMagic is required, please ensure they are in your PATH"
	exit 1
fi

CONVERT="convert"
IDENTIFY="identify"
if [[ -z "$HAVE_IMAGEMAGICK" ]]; then
	# we must have GraphicsMagick then
	CONVERT="gm convert"
	IDENTIFY="gm identify"
fi

# Parameters
SOURCE="$1"
DEST="$2"

# Check source and destination arguments
if [ -z "${SOURCE}" ]; then
	echo "No source image specified"
	exit 1
fi

if [ -z "${DEST}" ]; then
	echo "No destination specified"
	exit 1
fi

# File Infrastructure
NAME=$(basename "${SOURCE}")
BASE="${NAME%.*}"
TEMP_DIR="convert_temp"

function cleanUp() {
    rm -rf "${TEMP_DIR}"
}

trap cleanUp EXIT

mkdir -p "${TEMP_DIR}"

# check if .ico is a sequence
# pipe into cat so no exit code is given for grep if no matches are found
IS_ICO_SET="$($IDENTIFY "${SOURCE}" | grep -e "\w\.ico\[0" | cat )"

$CONVERT "${SOURCE}" "${TEMP_DIR}/${BASE}.png"
if [ "${IS_ICO_SET}" ]; then
	# extract the largest(?) image from the set
    cp "${TEMP_DIR}/${BASE}-0.png" "${DEST}"
else
    cp "${TEMP_DIR}/${BASE}.png" "${DEST}"
fi

rm -rf "${TEMP_DIR}"

trap - EXIT
cleanUp
