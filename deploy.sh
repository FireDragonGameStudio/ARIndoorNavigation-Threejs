#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run build

# navigate into the build output directory
cd dist

# place .nojekyll to bypass Jekyll processing
echo > .nojekyll

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

# only the first time to init the repo
# git init
# git checkout -B main
# git add -A
# git commit -m 'deploy'

# if you are deploying to https://<USERNAME>.github.io
# git push -f https://github.com/FireDragonGameStudio/FireDragonGameStudio.github.io.git
# git push --set-upstream https://github.com/FireDragonGameStudio/FireDragonGameStudio.github.io.git main


# if you are deploying to https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git main:gh-pages

# only the first time, to init the repo
# git push --set-upstream https://github.com/FireDragonGameStudio/ARIndoorNavigation-Threejs.git main:gh-pages

# for any further committing
git add -A
git commit -m 'deploy'
git push origin gh-pages:gh-pages

cd -
