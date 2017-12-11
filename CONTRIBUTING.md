# Contributing guidelines

## Pull requests & Github issues

* All pull requests should be sent to the `develop` branch, as the `master`
branch should always reflect the most recent release.
* Any merged changes will remain in the `develop` branch until the next
scheduled release.
* The only exception to this rule is for emergency hot fixes, in which case the
pull request can be sent to the `master` branch.
* A Github issue should also be created for any bug fix or feature, this helps
when generating the CHANGELOG.md file.

## Tests

Any change (be it an improvement, a new feature or a bug fix) needs to include
a test, and all tests from the repo need to be passing. To run the tests you
can use our npm script:

```
npm test
```

## Formatting

Run the format script to automatically format any changes:

```
npm run format
```

Once it's done formatting, run the lint script:

```
npm run lint
```

If there are any linting errors at this point, they must be addressed manually.

If you would like to see a list of our formatting standards check
out [our docs](https://hosting-liferayfrontendguidelines.wedeploy.io/).

## JS Docs

All methods should be documented, following [google's format](https://github.com/google/closure-compiler/wiki/Annotating-JavaScript-for-the-Closure-Compiler).

# Releasing

Collaborators with publish permissions should follow these steps.

There are two different workflows for publishing this project, one for scheduled
releases, and one for emergency hot fixes.

## Scheduled release

1. Create a release branch from the updated `develop` branch

```
git checkout develop
git pull upstream develop
git checkout -b release/vX.X.X
```

2. Send release PR to `master`

3. Wait to see that all tests pass and then merge with merge commit

4. Checkout and pull `master` locally

```
git checkout master && git pull upstream master
```

5. Bump package version number, publish to npm, and push git tags

```
npm version (major/minor/patch accordingly)
npm publish
git push && git push --tags
```

6. Generate changelog

github_changelog_generator (https://github.com/skywinder/github-changelog-generator)

7. Commit changelog and push to `master`

```
git add CHANGELOG.md
git commit -m "Updates CHANGELOG for vX.X.X"
git push
```

8. Sync `develop` with `master`

```
git checkout develop
git merge master
```

9. Do GitHub release using the pushed vX.X.X tag and the appropriate portion of
CHANGELOG.md

## Hot fix

1. Create a feature branch from `master` (assuming hot fix has already been
merged)

```
git checkout master
git pull upstream master
git checkout -b feature/fix_foo
```

2. Send a fix PR to `master`

3. Follow steps 3-9 of a scheduled release
