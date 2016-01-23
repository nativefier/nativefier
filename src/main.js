import optionsFactory from './options';
import buildApp from './buildApp';
import async from 'async';

export default function main(program) {

    async.waterfall([
        callback => {
            optionsFactory(
                program.appName,
                program.targetUrl,
                program.platform,
                program.arch,
                program.electronVersion,
                program.outDir,
                program.overwrite,
                program.conceal,
                program.icon,
                program.counter,
                program.width,
                program.height,
                program.userAgent,
                program.honest,
                callback);
        },

        (options, callback) => {
            buildApp(options, callback);
        }
    ], (error, appPath) => {
        if (error) {
            console.error(error);
            return;
        }

        console.log(`App built to ${appPath}`);
    });
}
