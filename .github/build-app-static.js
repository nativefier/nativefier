#!/usr/bin/env node

const fs_extra = require('../node_modules/fs-extra/lib');

fs_extra.copySync("app/src/static/", "app/lib/static/");
fs_extra.copySync("app/dist/preload.js", "app/lib/preload.js");
fs_extra.copySync("app/dist/preload.js.map", "app/lib/preload.js.map");