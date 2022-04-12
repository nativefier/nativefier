import * as log from 'loglevel';

if (process.env.LOGLEVEL) {
  log.setLevel(process.env.LOGLEVEL as log.LogLevelDesc);
} else {
  log.disableAll();
}

process.traceDeprecation = true;
