import os from 'os';

function inferPlatform() {
  const platform = os.platform();
  if (platform === 'darwin' || platform === 'win32' || platform === 'linux') {
    return platform;
  }

  throw new Error(`Untested platform ${platform} detected`);
}

function inferArch() {
  const arch = os.arch();
  if (arch !== 'ia32' && arch !== 'x64' && arch !== 'arm') {
    throw new Error(`Incompatible architecture ${arch} detected`);
  }
  return arch;
}

export default {
  inferPlatform,
  inferArch,
};
