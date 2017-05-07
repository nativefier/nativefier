import fields from './fields';

function resultArrayToObject(fieldResults) {
  return fieldResults.reduce((accumulator, value) => Object.assign({}, accumulator, value), {});
}

function inferredOptions(oldOptions, fieldResults) {
  const newOptions = resultArrayToObject(fieldResults);
  return Object.assign({}, oldOptions, newOptions);
}

// Takes the options object and infers new values
// which may need async work
export default function (options) {
  const tasks = fields(options);
  return Promise.all(tasks)
    .then(fieldResults => inferredOptions(options, fieldResults));
}
