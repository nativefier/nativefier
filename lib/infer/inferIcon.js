'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pageIcon = require('page-icon');

var _pageIcon2 = _interopRequireDefault(_pageIcon);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _tmp = require('tmp');

var _tmp2 = _interopRequireDefault(_tmp);

var _gitcloud = require('gitcloud');

var _gitcloud2 = _interopRequireDefault(_gitcloud);

var _helpers = require('../helpers/helpers');

var _helpers2 = _interopRequireDefault(_helpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var downloadFile = _helpers2.default.downloadFile,
    allowedIconFormats = _helpers2.default.allowedIconFormats;

_tmp2.default.setGracefulCleanup();

var GITCLOUD_SPACE_DELIMITER = '-';

function getMaxMatchScore(iconWithScores) {
  return iconWithScores.reduce(function (maxScore, currentIcon) {
    var currentScore = currentIcon.score;
    if (currentScore > maxScore) {
      return currentScore;
    }
    return maxScore;
  }, 0);
}

/**
 * also maps ext to icon object
 */
function getMatchingIcons(iconsWithScores, maxScore) {
  return iconsWithScores.filter(function (item) {
    return item.score === maxScore;
  }).map(function (item) {
    return Object.assign({}, item, { ext: _path2.default.extname(item.url) });
  });
}

function mapIconWithMatchScore(fileIndex, targetUrl) {
  var normalisedTargetUrl = targetUrl.toLowerCase();
  return fileIndex.map(function (item) {
    var itemWords = item.name.split(GITCLOUD_SPACE_DELIMITER);
    var score = itemWords.reduce(function (currentScore, word) {
      if (normalisedTargetUrl.includes(word)) {
        return currentScore + 1;
      }
      return currentScore;
    }, 0);

    return Object.assign({}, item, { score });
  });
}

function inferIconFromStore(targetUrl, platform) {
  var allowedFormats = new Set(allowedIconFormats(platform));

  return (0, _gitcloud2.default)('https://jiahaog.github.io/nativefier-icons/').then(function (fileIndex) {
    var iconWithScores = mapIconWithMatchScore(fileIndex, targetUrl);
    var maxScore = getMaxMatchScore(iconWithScores);

    if (maxScore === 0) {
      return null;
    }

    var iconsMatchingScore = getMatchingIcons(iconWithScores, maxScore);
    var iconsMatchingExt = iconsMatchingScore.filter(function (icon) {
      return allowedFormats.has(icon.ext);
    });
    var matchingIcon = iconsMatchingExt[0];
    var iconUrl = matchingIcon && matchingIcon.url;

    if (!iconUrl) {
      return null;
    }
    return downloadFile(iconUrl);
  });
}

function writeFilePromise(outPath, data) {
  return new Promise(function (resolve, reject) {
    _fs2.default.writeFile(outPath, data, function (error) {
      if (error) {
        reject(error);
        return;
      }
      resolve(outPath);
    });
  });
}

function inferFromPage(targetUrl, platform, outDir) {
  var preferredExt = '.png';
  if (platform === 'win32') {
    preferredExt = '.ico';
  }

  // todo might want to pass list of preferences instead
  return (0, _pageIcon2.default)(targetUrl, { ext: preferredExt }).then(function (icon) {
    if (!icon) {
      return null;
    }

    var outfilePath = _path2.default.join(outDir, `/icon${icon.ext}`);
    return writeFilePromise(outfilePath, icon.data);
  });
}

/**
 *
 * @param {string} targetUrl
 * @param {string} platform
 * @param {string} outDir
 */
function inferIconFromUrlToPath(targetUrl, platform, outDir) {
  return inferIconFromStore(targetUrl, platform).then(function (icon) {
    if (!icon) {
      return inferFromPage(targetUrl, platform, outDir);
    }

    var outfilePath = _path2.default.join(outDir, `/icon${icon.ext}`);
    return writeFilePromise(outfilePath, icon.data);
  });
}

/**
 * @param {string} targetUrl
 * @param {string} platform
 */
function inferIcon(targetUrl, platform) {
  var tmpObj = _tmp2.default.dirSync({ unsafeCleanup: true });
  var tmpPath = tmpObj.name;
  return inferIconFromUrlToPath(targetUrl, platform, tmpPath);
}

exports.default = inferIcon;
//# sourceMappingURL=inferIcon.js.map
