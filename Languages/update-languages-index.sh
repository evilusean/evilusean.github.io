#!/bin/bash

echo "🌐 Updating Languages directory indexes..."

# Update Japanese index if it exists
if [ -d "Japanese" ] && [ -f "Japanese/update-japanese-index.sh" ]; then
    echo "🇯🇵 Updating Japanese index..."
    (cd Japanese && ./update-japanese-index.sh)
fi

# Update Slovak index if it exists
if [ -d "Slovak" ] && [ -f "Slovak/update-slovak-index.sh" ]; then
    echo "🇸🇰 Updating Slovak index..."
    (cd Slovak && ./update-slovak-index.sh)
fi

echo "✅ All language indexes updated successfully!"