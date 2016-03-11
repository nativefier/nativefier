import os from 'os';
import axios from 'axios';

function isOSX() {
    return os.platform() === 'darwin';
}

function isWindows() {
    return os.platform() === 'win32';
}

function downloadFile(fileUrl) {
    return axios.get(
        fileUrl, {
            responseType: 'arraybuffer'
        })
        .then(function(response) {
            return response.data;
        });
}

export default {
    isOSX,
    isWindows,
    downloadFile
};
