# Development Guide

Welcome, soon-to-be contributor 🙂! This document sums up
what you need to know to get started hacking on Nativefier.

## Guidelines

1. **Before starting work on a huge change, gauge the interest**
   of community & maintainers through a GitHub issue. For big changes,
   create a **[RFC](https://en.wikipedia.org/wiki/Request_for_Comments)**
   issue to enable a good peer review.

2. Do your best to **avoid adding new Nativefier command-line options**.
   If a new option is inevitable for what you want to do, sure,
   but as much as possible try to see if you change works without.
   Nativefier already has a ton of them, making it hard to use.

3. Do your best to **limit breaking changes**.
   Only introduce breaking changes when necessary, when required by deps, or when
   not breaking would be unreasonable. When you can, support the old thing forever.
   For example, keep maintaining old flags; to "replace" an flag you want to replace
   with a better version, you should keep honoring the old flag, and massage it
   to pass parameters to the new flag, maybe using a wrapper/adapter.
   Yes, our code will get a tiny bit uglier than it could have been with a hard
   breaking change, but that would be to ignore our users.
   Introducing breaking changes willy nilly is a comfort to us developers, but is
   disrespectful to end users who must constantly bend to the flow of breaking changes
   pushed by _all their software_ who think it's "just one breaking change".
   See [Rich Hickey - Spec-ulation](https://www.youtube.com/watch?v=oyLBGkS5ICk).

4. **Avoid adding npm dependencies**. Each new dep is a complexity & security liability.
   You might be thinking your extra dep is _"just a little extra dep"_, and maybe
   you found one that is high-quality & dependency-less. Still, it's an extra dep,
   and over the life of Nativefier we requested changes to _dozens_ of PRs to avoid
   "just a little extra dep". Without this constant attention, Nativefier would be
   more bloated, less stable for users, more annoying to maintainers. Now, don't go
   rewriting zlib if you need a zlib dep, for sure use a dep. But if you can write a
   little helper function saving us a dep for a mundane task, go for the helper :) .
   Also, an in-tree helper will always be less complex than a dep, as inherently
   more tailored to our use case, and less complexity is good.

5. Use **types**, avoid `any`, write **tests**.

6. **Document for users** in `API.md`

7. **Document for other devs** in comments, jsdoc, commits, PRs.
   Say _why_ more than _what_, the _what_ is your code!

## Setup

First, clone the project:

```bash
git clone https://github.com/nativefier/nativefier.git
cd nativefier
```

Install dependencies (for both the CLI and the Electron app):

```bash
npm ci
```

The above `npm ci` will build automatically (through the `prepare` hook).
When you need to re-build Nativefier,

```bash
npm run build
```

Set up a symbolic link so that running `nativefier` calls your dev version with your changes:

```bash
npm link
which nativefier
# -> Should return a path, e.g. /home/youruser/.node_modules/lib/node_modules/nativefier
# If not, be sure your `npm_config_prefix` env var is set and in your `PATH`
```

After doing so, you can run Nativefier with your test parameters:

```bash
nativefier --your-awesome-new-flag 'https://your-test-site.com'
```

Then run your nativefier app _through the command line too_ (to see logs & errors):

```bash
# Under Linux
./your-test-site-linux-x64/your-test-site

# Under Windows
your-test-site-win32-x64/your-test-site.exe

# Under macOS
./YourTestSite-darwin-x64/YourTestSite.app/Contents/MacOS/YourTestSite --verbose
```

## Linting & formatting

Nativefier uses [Prettier](https://prettier.io/), which will shout at you for
not formatting code exactly like it expects. This guarantees a homogenous style,
but is painful to do manually. Do yourself a favor and install a
[Prettier plugin for your editor](https://prettier.io/docs/en/editors.html).

## Tests

- To run all tests, `npm t`
- To run only unit tests, `npm run test:unit`
- To run only integration tests, `npm run test:integration`
- Logging is suppressed by default in tests, to avoid polluting Jest output.
  To get debug logs, `npm run test:withlog` or set the `LOGLEVEL` env. var.
- For a good live experience, open two terminal panes/tabs running code/tests watchers:
  1. Run a TSC watcher: `npm run build:watch`
  2. Run a Jest unit tests watcher: `npm run test:watch`
  3. Here is [a screencast of how the live-reload experience should look like](https://user-images.githubusercontent.com/522085/120407694-abdf3f00-c31b-11eb-9ab5-a531a929adb9.mp4)
- Alternatively, you can run both test processes in the same terminal by running: `npm run watch`

## Maintainers corner

### Deps: major-upgrading Electron

When a new major [Electron release](https://github.com/electron/electron/releases) occurs,

1. Wait a few weeks to let it stabilize. Never upgrade Nativefier to a `.0.0`.
2. Thoroughly digest the new version's [breaking changes](https://www.electronjs.org/docs/breaking-changes)
   (also via the [Releases page](https://github.com/electron/electron/releases) and [the blog](https://www.electronjs.org/blog/), the content is different),
   grepping our codebase for every changed API.
   - If called for by the breaking changes, perform the necessary API changes
3. Bump
   - `src/constants.ts` / `DEFAULT_ELECTRON_VERSION` & `DEFAULT_CHROME_VERSION`
   - `package.json / devDeps / electron`
   - `app / package.json / devDeps / electron`
4. On Windows, macOS, Linux, test for regression and crashes:
   1. With `npm test` and `npm run test:manual`
   2. With extra manual testing
5. When confident enough, release it in a regression-spelunking-friendly way:
   1. If `master` has unreleased commits, make a patch/minor release with them, but without the major Electron bump.
   2. Commit your Electron major bump and release it as a major new Nativefier version. Help users identify the breaking change by using a bold **[BREAKING]** marker in `CHANGELOG.md` and in the GitHub release.

### Deps updates

It is important to stay afloat of dependencies upgrades.
In packages ecosystems like npm, there's only one way: forward.
The best time to do package upgrades is now / progressively, because:

1. Slacking on doing these upgrades means you stay behind, and it becomes
   risky to do them. Upgrading a woefully out-of-date dep from 3.x to 9.x is
   scarier than 3.x to 4.x, release, then 4.x to 5.x, release, etc... to 9.x.

2. Also, dependencies applying security patches to old major versions are rare
   in npm. So, by slacking on upgrades, it becomes more and more probable that
   we get impacted by a vulnerability. And when this happens, it then becomes
   urgent & stressful to A. fix the vulnerability, B. do the required major upgrades.

So: do upgrade CLI & App deps regularly! Our release script will remind you about it.

### Deps lockfile / shrinkwrap

We do use lockfiles (`npm-shrinkwrap.json` & `app/npm-shrinkwrap.json`), for:

1. Security (avoiding supply chain attacks)
2. Reproducibility
3. Performance

It means you might have to update these lockfiles when adding a dependency.
`npm run relock` will help you with that.

Note: we do use `npm-shrinkwrap.json` rather than `package-lock.json` because
the latter is tailored to libraries, and is not publishable.
As [documented](https://docs.npmjs.com/cli/v6/configuring-npm/shrinkwrap-json),
CLI tools like Nativefier should use shrinkwrap.

### Release

While on `master`, with no uncommitted changes, run:

```bash
npm run changelog -- $VERSION
# With no 'v'. For example: npm run changelog -- '42.5.0'
```

Do follow semantic versioning, and give visibility to breaking changes
in release notes by prefixing their line with **[BREAKING]**.

### Triage

These are the guidelines we (try to) follow when triaging [issues](https://github.com/nativefier/nativefier/issues):

1. Do your best to conciliate **empathy & efficiency, and keep your cool**.
   It’s not always easy 😄😬😭🤬. Get away from triaging if you feel grouchy.

2. **Rename** issues. Most issues are badly named, with titles ranging from
   unclear to flat out wrong. A good backlog is a backlog of issues with clear
   concise titles, understandable with only the title after you read them once.
   Rename and clarify.

3. **Ask for clarification & details** when needed, and add a `need-info` label.

   1. In particular, if the issue isn’t reproducible (e.g. a non-trivial bug
      happening on an internal site), express that we can’t work without a
      repro scenario, and flag as `need-info`.

4. **Label** issues with _category/sorting_ labels (e.g. `mac` / `linux` / `windows`,
   `bug` / `feature-request` ...) and _status_ labels (e.g. `upstream`, `wontfix`,
   `need-info`, `cannot-reproduce`).

5. **Close if needed, but not too much**. We _do_ want to close what deserves it,
   but closing _too_ ruthlessly frustrates and disappoints users, and does us a
   disservice of not having a clear honest backlog available to us & users. So,

   1. When in doubt, leave issues open and triaged as `bug` / `feature-request`.
      It’s okay, reaching 0 open issues is _not_ an objective. Or if it is,
      it deserves to be a development objective, not a triage one.
   2. That being said, do close what’s `upstream`, with a kind message.
   3. Also do close bugs that have been `need-info` or `cannot-reproduce` for
      too long (weeks / months), with a kind message explaining we’re okay to
      re-open if the requested info / scenario is provided.
   4. Finally, carefully close issues we do not want to address, e.g. requests
      going against project goals, or bugs & feature requests that are so niche
      or far-fetched that there’s zero chance of ever seeing them addressed.
      But if in doubt, remain at point 1. above: leave open, renamed, labelled.

6. **Close duplicates issues** and link to the original issue.

   1. To be able to notice dups implies you must know the backlog (one more
      reason to keep it tidy and palatable). Once in a blue moon, do a
      "full pass" of the whole backlog from beginning to end, you’ll often
      find lots of now-irrelevant bugs, and duplicates.

7. **Use [GitHub saved replies](https://github.com/settings/replies)** to
   automate asking for info and being nice on closing as noanswer / stale-needinfo.

8. **Transform findings stemming from issues discussion** into documentation
   (chiefly, [CATALOG.md](CATALOG.md) & [API.md](API.md)), or into code comments.

9. **Don’t scold authors of lame "+1" comments**, this only adds to the noise
   you’re trying to avoid. Instead, hide useless comments as `Off-topic`.
   From personal experience, users do understand this signal, and such hidden
   comments do avoid an avalanche of extra "+1" comments.

   1. There are shades of lame. A literal `"+1"` comment is frankly useless and
      is worth hiding. But a comment like `"same for me on Windows"` at least
      brings an extra bit of information, so can remain visible.

   2. In a perfect world, GitHub would let us add a note when hiding comments to
      express _"Please use a 👍 reaction on the issue to vote for it instead of_
      _posting a +1 comment"_. In a perfecter world, GitHub would use their AI
      skillz to automatically detect such comments, discourage them and nudge
      towards a 👍 reaction. We’re not there yet, so “hidden as off-topic” will do.

10. **Don’t let yourself be abused** by abrasive / entitled users. There are
    plenty of articles documenting open-source burnout and trolls-induced misery.
    Find an article that speaks to you, and point problematic users to it.
    I like [Brett Cannon - The social contract of open source](https://snarky.ca/the-social-contract-of-open-source/).
