#!/bin/zsh
timestamp=$(date "+%Y-%m-%d_%H-%M-%S")
tmpfile="/tmp/prop-terminal_autosave_$timestamp.tar.gz"
mkdir -p ~/Desktop/prop-terminal-clean/backups
tar --exclude="./backups" -czf "$tmpfile" -C ~/Desktop/prop-terminal-clean . && \
mv "$tmpfile" ~/Desktop/prop-terminal-clean/backups/ && \
git add . && \
git commit -m "autosave: $timestamp" && \
git push origin main && \
echo "✅ Autosave создан и отправлен: $timestamp"

