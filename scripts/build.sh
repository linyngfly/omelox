#!/bin/bash

set -e

cp ./README.md ./packages/omelox/README.md
# npm run authors

lerna run build

