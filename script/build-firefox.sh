echo 'building extension for Firefox...'

# Remove previous artifacts
rm -f firefox_extension.zip

# Build
yarn build:ext

# Zip the distribution folder
cd dist/ && zip -r ../firefox_extension.zip * -x "*.DS_Store" "web_manifest.json" "screenshots/*" "images/*" "robots.txt" && cd ..
