#!/bin/bash

# Disable Python-related environment variables
export PYTHON_VERSION=false
export USE_PYTHON=false
export PYTHON_RUNTIME=false

# Run the build
npm run build 