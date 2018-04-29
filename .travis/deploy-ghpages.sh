#!/bin/bash
set -e # Exit with nonzero exit code if anything fails

SOURCE_BRANCH="master"
TARGET_BRANCH="gh-pages"

# Pull requests and commits to other branches shouldn't try to deploy, just build to verify
if [ "$TRAVIS_PULL_REQUEST" != "false" -o "$TRAVIS_BRANCH" != "$SOURCE_BRANCH" ]; then
    echo "Skipping deploy"
    exit 0
fi

# Save some useful information
REPO=`git config remote.origin.url`
SSH_REPO=${REPO/https:\/\/github.com\//git@github.com:}
SHA=`git rev-parse --verify HEAD`

# Clone the existing gh-pages for this repo into out/
# Create a new empty branch if gh-pages doesn't exist yet (should only happen on first deply)
git clone $REPO out
cd out
git checkout $TARGET_BRANCH || git checkout --orphan $TARGET_BRANCH && git rm -rf \*
cd ..


# Populate out folder
cp -R index.html dist/ static/ out/

# Now let's go have some fun with the cloned repo
cd out
git config user.name "Travis CI"
git config user.email "$COMMIT_AUTHOR_EMAIL"

# Add current files
git add -A .

# If there are no changes to the compiled out (e.g. this is a README update) then just bail.
if git diff --staged --quiet; then
    echo "No changes to the output on this push; exiting."
    exit 0
fi

# Commit the "changes", i.e. the new version.
# The delta will show diffs between new and old versions.
git commit -m "Deploy to GitHub Pages: ${SHA}"

# Get the deploy key by using Travis's stored variables to decrypt deploy_key.enc
#
# GordonF:
# Private key has been encrypted with travis CLI, then
#   cat travis.informo.client.enc | base64 -w0 > travis.informo.client.enc.base64
# and stored in travis variable ENCRYPTED_KEY_BASE64
KEYNAME=travis.informo.client
echo "$ENCRYPTED_KEY_BASE64" | base64 -d > ../$KEYNAME.enc
sha256sum ../$KEYNAME.enc

ENCRYPTED_KEY_VAR="encrypted_${ENCRYPTION_LABEL}_key"
ENCRYPTED_IV_VAR="encrypted_${ENCRYPTION_LABEL}_iv"
ENCRYPTED_KEY=${!ENCRYPTED_KEY_VAR}
ENCRYPTED_IV=${!ENCRYPTED_IV_VAR}
openssl aes-256-cbc -K $ENCRYPTED_KEY -iv $ENCRYPTED_IV -in ../$KEYNAME.enc -out ../$KEYNAME -d
chmod 600 ../$KEYNAME
eval `ssh-agent -s`
ssh-add ../$KEYNAME

# Now that we're all set up, we can push.
git push $SSH_REPO $TARGET_BRANCH