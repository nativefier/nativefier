import commander from 'commander';
import optionsFactory from './options';
import buildApp from './buildApp';

function main() {
    const options = optionsFactory();
    buildApp(options, (error, appPath) => {
        if (error) {
            console.trace(error);
            return;
        }

        console.log(`App built to ${appPath}`);
    });
}

main();
