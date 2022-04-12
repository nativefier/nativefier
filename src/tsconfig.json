{
  "extends": "../tsconfig-base.json",
  "compilerOptions": {
    "outDir": "../lib",
    "rootDir": ".",
    // Bumping the minimum required Node version? You must bump:
    //   1. package.json -> engines.node
    //   2. package.json -> devDependencies.@types/node
    //   3. tsconfig.json -> {target, lib}
    //   4. .github/workflows/ci.yml -> node-version
    //
    // Here in tsconfig.json, we want to set the `target` and `lib` keys
    // to the "best" values for the minimum/required version of node.
    // TS doesn't offer any easy "preset" for this, so the best we have is to
    // believe people who know which {syntax, library} parts of current EcmaScript
    // are supported for our version of Node, and use what they recommend.
    // For the current Node version, I followed
    // https://stackoverflow.com/questions/59787574/typescript-tsconfig-settings-for-node-js-12
    "target": "es2019",
    // In `lib` we add `dom`, to tell tsc it's okay to use the URL object (which is in Node >= 7)
    "lib": [
      "es2020",
      "dom"
    ],
  },
  "references": [
    {
      "path": "../shared"
    }
  ]
}
