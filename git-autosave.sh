#!/bin/bash
cd ~/Desktop/prop-terminal-clean || exit
timestamp=$(date +"%Y-%m-%d %H:%M:%S")
git pull --rebase origin main
git add .
git commit -m "autosave: $timestamp"
git push origin main
