#!/bin/bash
set -e

npx gatsby clean
npx gatsby build
npx netlify deploy --prod --dir=public
