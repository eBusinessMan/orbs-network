#!/bin/bash -e

yarn link orbs-interfaces
yarn link orbs-core-library

yarn install

yarn test

yarn run build
