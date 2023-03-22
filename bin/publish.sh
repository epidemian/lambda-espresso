#!/bin/bash
set -o errexit -o nounset -o pipefail

git diff-index --quiet HEAD || ( \
    echo 'Commit everything before publishing!'; exit 1 \
)
git checkout gh-pages
git merge main --no-edit
npm run build-prod
git add assets
git commit -m 'Update static assets'
git push origin gh-pages
git checkout main
