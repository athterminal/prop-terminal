#!/bin/zsh
echo "🧩 Проверка целостности архивов: $(date)"
for file in ~/Desktop/prop-terminal-clean/backups/*.tar.gz; do
  if gzip -t "$file" 2>/dev/null; then
    echo "✅ OK — $(basename "$file")"
  else
    echo "❌ Поврежден — $(basename "$file")"
  fi
done

