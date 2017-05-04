import path from 'path';
import log from 'loglevel';
import helpers from './../helpers/helpers';
import iconShellHelpers from './../helpers/iconShellHelpers';

const { isOSX } = helpers;
const { convertToPng, convertToIco, convertToIcns } = iconShellHelpers;

function iconIsIco(iconPath) {
  return path.extname(iconPath) === '.ico';
}

function iconIsPng(iconPath) {
  return path.extname(iconPath) === '.png';
}

function iconIsIcns(iconPath) {
  return path.extname(iconPath) === '.icns';
}

/**
 * @callback augmentIconsCallback
 * @param error
 * @param options
 */

/**
 * Will check and convert a `.png` to `.icns` if necessary and augment
 * options.icon with the result
 *
 * @param inpOptions will need options.platform and options.icon
 * @param {augmentIconsCallback} callback
 */
function iconBuild(inpOptions, callback) {
  const options = Object.assign({}, inpOptions);
  const returnCallback = () => {
    callback(null, options);
  };

  if (!options.icon) {
    returnCallback();
    return;
  }

  if (options.platform === 'win32') {
    if (iconIsIco(options.icon)) {
      returnCallback();
      return;
    }

    convertToIco(options.icon)
      .then((outPath) => {
        options.icon = outPath;
        returnCallback();
      })
      .catch((error) => {
        log.warn('Skipping icon conversion to .ico', error);
        returnCallback();
      });
    return;
  }

  if (options.platform === 'linux') {
    if (iconIsPng(options.icon)) {
      returnCallback();
      return;
    }

    convertToPng(options.icon)
      .then((outPath) => {
        options.icon = outPath;
        returnCallback();
      })
      .catch((error) => {
        log.warn('Skipping icon conversion to .png', error);
        returnCallback();
      });
    return;
  }

  if (iconIsIcns(options.icon)) {
    returnCallback();
    return;
  }

  if (!isOSX()) {
    log.warn('Skipping icon conversion to .icns, conversion is only supported on OSX');
    returnCallback();
    return;
  }

  convertToIcns(options.icon)
    .then((outPath) => {
      options.icon = outPath;
      returnCallback();
    })
    .catch((error) => {
      log.warn('Skipping icon conversion to .icns', error);
      returnCallback();
    });
}

export default iconBuild;
