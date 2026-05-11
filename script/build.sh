#!/bin/bash

build() {
    echo 'Building Hackertab...'
    rm -rf dist
    npx vite build "$@"
}

build "$@"
