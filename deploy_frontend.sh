#!/bin/bash

SOURCE_DIR="frontend/dist"
TARGET_DIR="web"

rm -rf "$TARGET_DIR"/*
cp -r "$SOURCE_DIR"/* "$TARGET_DIR"

echo "✅ successfully replaced"