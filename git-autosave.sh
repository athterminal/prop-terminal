#!/bin/bash

cd ~/prop-terminal || exit

# Текущие дата и время
timestamp=$(date +"%Y-%m-%d %H:%M:%S")

# Добавляем, коммитим и пушим всё
git add .
git commit -m "autosave: $timestamp"
git push origin main
