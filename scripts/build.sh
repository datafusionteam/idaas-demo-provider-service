#!/usr/bin/env bash

SERVICE=pinnacle-chiro-provider
VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

echo "Building image for $VERSION"

docker build -t $SERVICE:$VERSION --target=production .