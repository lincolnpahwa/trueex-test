#!/usr/bin/env bash
tar -czf exercise.tar.gz . --exclude='./api' --exclude='./build/ui-dist' --exclude='./node_modules'