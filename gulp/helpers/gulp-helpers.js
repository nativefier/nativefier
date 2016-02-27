import shellJs from 'shelljs';

function shellExec(cmd, silent, callback) {
    shellJs.exec(cmd, {silent: silent}, (code, stdout, stderr) => {
        if (code) {
            callback(JSON.stringify({code, stdout, stderr}));
            return;
        }
        callback();
    });
}

export default {shellExec};
