import os from 'os';
import path from 'path';

const TEMPLATE_APP_DIR = path.join(__dirname, '../', 'app');
const ELECTRON_VERSION = '0.36.4';


function optionsFactory(name = 'MyApp',
                        targetUrl = 'http://google.com',
                        platform = detectPlatform(),
                        architecture = detectArch(),
                        version = ELECTRON_VERSION,
                        outDir = os.homedir(),
                        overwrite = true,
                        conceal = true,
                        iconDir,
                        badge = false,
                        width = 1280,
                        height = 800) {
    return {
        dir: TEMPLATE_APP_DIR,

        name: name,
        targetUrl: targetUrl,

        platform: platform,
        arch: architecture,
        version: version,

        out: outDir,

        // optionals
        overwrite: overwrite,
        asar: conceal,
        icon: iconDir,

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
