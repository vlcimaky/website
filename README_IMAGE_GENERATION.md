# Image Generation Scripts - Quick Start

## 🚀 Option 1: Node.js Script (Recommended)

### Setup:
```bash
# Install dependencies
npm install

# Run the script
npm run generate-images
# OR
node generate-images.js
```

### What it does:
- ✅ Generates WebP and JPG versions of all images
- ✅ Creates multiple sizes for each image
- ✅ Maintains aspect ratio with smart cropping
- ✅ Shows progress and statistics
- ✅ Skips missing files gracefully

### Output:
All images will be generated in the same directory as the source:
- `marketa-800w.webp`, `marketa-800w.jpg`
- `marketa-600w.webp`, `marketa-600w.jpg`
- `marketa-400w.webp`, `marketa-400w.jpg`
- etc.

---

## 🐧 Option 2: Bash Script (ImageMagick)

### Setup:
```bash
# Make script executable
chmod +x generate-images.sh

# Install dependencies (if needed)
# Ubuntu/Debian:
sudo apt-get install imagemagick webp

# macOS (with Homebrew):
brew install imagemagick webp

# Run the script
./generate-images.sh
```

### What it does:
- ✅ Same functionality as Node.js version
- ✅ Uses ImageMagick (convert command)
- ✅ Requires cwebp for WebP encoding

---

## 📋 What Gets Generated

### Hero Images (4 sizes each):
- `bg-masthead-1920w.webp/jpg`
- `bg-masthead-1200w.webp/jpg`
- `bg-masthead-768w.webp/jpg`
- `bg-masthead-480w.webp/jpg`

### Content Images (3 sizes each):
- `marketa-800w.webp/jpg`
- `marketa-600w.webp/jpg`
- `marketa-400w.webp/jpg`

### Gallery Images (4 sizes each):
- `mostovani-1200w.webp/jpg`
- `mostovani-800w.webp/jpg`
- `mostovani-600w.webp/jpg`
- `mostovani-400w.webp/jpg`

### Portfolio Images (3 sizes each):
- `portfolio-1-1200w.webp/jpg`
- `portfolio-1-800w.webp/jpg`
- `portfolio-1-600w.webp/jpg`

### Map Image (3 sizes):
- `mapa-google-1200w.webp/jpg`
- `mapa-google-800w.webp/jpg`
- `mapa-google-600w.webp/jpg`

---

## ⚙️ Customization

### To add/modify images:

**Node.js script (`generate-images.js`):**
Edit the `IMAGE_CONFIG` object at the top of the file:

```javascript
content: {
  sizes: [
    { width: 800, height: 600, suffix: '800w' },
    // Add more sizes here
  ],
  images: [
    { source: 'assets/img/your-image.jpg', name: 'your-image' },
    // Add more images here
  ]
}
```

**Bash script (`generate-images.sh`):**
Add images to the appropriate category section:
```bash
for img in "assets/img/your-image.jpg:your-image"; do
  # ... processing code
done
```

---

## 📊 Expected Results

After running, you should see:
- **~200+ image files** generated (WebP + JPG for each size)
- **60-80% file size reduction** compared to originals
- **All images ready** for responsive `<picture>` implementation

---

## 🐛 Troubleshooting

### Node.js script:
- **Error: Cannot find module 'sharp'**
  - Run: `npm install`

### Bash script:
- **Error: convert: command not found**
  - Install ImageMagick: `sudo apt-get install imagemagick`
- **Error: cwebp: command not found**
  - Install WebP tools: `sudo apt-get install webp`

---

## ✅ Next Steps

After generating images:
1. ✅ Verify all images were created
2. ✅ Check file sizes (should be much smaller)
3. ✅ I can help update HTML with `<picture>` elements
4. ✅ Test on different devices

---

## 📝 Notes

- Original images are **not modified** - only new files are created
- Scripts **skip missing files** gracefully
- All images maintain **aspect ratio** with smart center cropping
- WebP quality: **85%**, JPG quality: **80%** (optimized for web)

