import os from 'os';
import path from 'path';

import validator from 'validator';

const TEMPLATE_APP_DIR = path.join(__dirname, '../', 'app');
const ELECTRON_VERSION = '0.36.4';

function optionsFactory(name = 'MyApp',
                        targetUrl = 'http://google.com',
                        platform = detectPlatform(),
                        arch = detectArch(),
                        version = ELECTRON_VERSION,
                        outDir = process.cwd(),
                        overwrite = true,
                        conceal = false,
                        icon,
                        badge = false,
                        width = 1280,
                        height = 800) {

    if (!validator.isURL(targetUrl, {require_protocol: true})) {
        throw 'Your Url is invalid!, did you remember to include \'http://\'?';
    }

    return {
        dir: TEMPLATE_APP_DIR,

        name: name,
        targetUrl: targetUrl,

        platform: platform,
        arch: arch,
        version: version,

        out: outDir,

        // optionals
        overwrite: overwrite,
        asar: conceal,
        icon: icon,

        // app configuration
        badge: badge,
        width: width,
        height: height
    }
}

function detectPlatform() {
    const platform = os.platform();
    if (platform === 'darwin' || platform === 'win32' || platform === 'linux') {
        return platform;
    }

    console.warn(`Warning: Untested platform ${platform} detected, assuming linux`);
    return 'linux';
}

function detectArch() {
    const arch = os.arch();
    if (arch !== 'ia32' && arch !== 'x64') {
        throw `Incompatible architecture ${arch} detected`;
    }
    return os.arch();
}

export default optionsFactory;
