#!/bin/bash

npx gatsby clean
ln -s ../../nipafx.dev-site/ public
npx gatsby build
cd public
git add --all
git commit -m "Release"
git push
cd ..
npx gatsby clean
