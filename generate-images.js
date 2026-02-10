#!/usr/bin/env node

/**
 * Image Optimization Script for Vlčí máky Website
 * 
 * Generates WebP and JPG versions of images in multiple sizes
 * 
 * Usage:
 *   node generate-images.js
 * 
 * Requirements:
 *   npm install sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration: Image categories and their required sizes
// Note: Only width is specified - height will be calculated to maintain aspect ratio
const IMAGE_CONFIG = {
  // Hero images (full-width backgrounds) - these can be cropped to landscape
  hero: {
    sizes: [
      { width: 1920, suffix: '1920w', maintainAspect: false }, // Allow cropping for hero
      { width: 1200, suffix: '1200w', maintainAspect: false },
      { width: 768, suffix: '768w', maintainAspect: false },
      { width: 480, suffix: '480w', maintainAspect: false }
    ],
    quality: { webp: 85, jpg: 80 },
    images: [
      { source: 'assets/img/bg-masthead.jpeg', name: 'bg-masthead' },
      { source: 'assets/img/bg-masthead_1.jpeg', name: 'bg-masthead_1' },
      { source: 'assets/img/14.jpg', name: '14' }
    ]
  },

  // Content images (50/50 split, max 75% width) - preserve aspect ratio
  content: {
    sizes: [
      { width: 800, suffix: '800w', maintainAspect: true },
      { width: 600, suffix: '600w', maintainAspect: true },
      { width: 400, suffix: '400w', maintainAspect: true }
    ],
    quality: { webp: 85, jpg: 80 },
    images: [
      { source: 'assets/img/marketa.jpg', name: 'marketa' },
      { source: 'assets/img/julie.jpeg', name: 'julie' },
      { source: 'assets/img/martin_0.jpg', name: 'martin_0' },
      { source: 'assets/img/janka.jpg', name: 'janka' },
      { source: 'assets/img/12.jpg', name: '12' },
      { source: 'assets/img/5.jpg', name: '5' },
      { source: 'assets/img/13.jpg', name: '13' },
      { source: 'assets/img/13(1).jpg', name: '13(1)' },
      { source: 'assets/img/13(2).jpg', name: '13(2)' }
    ]
  },

  // Gallery images (3-column grid) - preserve aspect ratio
  gallery: {
    sizes: [
      { width: 1200, suffix: '1200w', maintainAspect: true },
      { width: 800, suffix: '800w', maintainAspect: true },
      { width: 600, suffix: '600w', maintainAspect: true },
      { width: 400, suffix: '400w', maintainAspect: true }
    ],
    quality: { webp: 85, jpg: 80 },
    images: [
      { source: 'assets/img/mostovani.jpg', name: 'mostovani' },
      { source: 'assets/img/komunita_2.jpeg', name: 'komunita_2' },
      { source: 'assets/img/komunita_3.jpg', name: 'komunita_3' },
      { source: 'assets/img/tym_0.jpg', name: 'tym_0' },
      { source: 'assets/img/tym_4.jpg', name: 'tym_4' },
      { source: 'assets/img/tym_2.jpg', name: 'tym_2' },
      { source: 'assets/img/vzdelani_0.jpg', name: 'vzdelani_0' },
      { source: 'assets/img/vzdelani_3.jpg', name: 'vzdelani_3' },
      { source: 'assets/img/vzdelani_2.jpg', name: 'vzdelani_2' },
      { source: 'assets/img/vybaveni_2.jpg', name: 'vybaveni_2' },
      { source: 'assets/img/vybaveni_0.jpg', name: 'vybaveni_0' },
      { source: 'assets/img/vybaveni_1.jpg', name: 'vybaveni_1' }
    ]
  },

  // Portfolio carousel images - preserve aspect ratio
  portfolio: {
    sizes: [
      { width: 1200, suffix: '1200w', maintainAspect: true },
      { width: 800, suffix: '800w', maintainAspect: true },
      { width: 600, suffix: '600w', maintainAspect: true }
    ],
    quality: { webp: 85, jpg: 80 },
    images: [
      { source: 'assets/img/1.jpg', name: '1' },
      { source: 'assets/img/portfolio/fullsize/1.jpeg', name: 'portfolio-1', outputDir: 'assets/img/portfolio' },
      { source: 'assets/img/portfolio/fullsize/2.jpeg', name: 'portfolio-2', outputDir: 'assets/img/portfolio' },
      { source: 'assets/img/portfolio/fullsize/3.jpeg', name: 'portfolio-3', outputDir: 'assets/img/portfolio' },
      { source: 'assets/img/portfolio/fullsize/4.jpeg', name: 'portfolio-4', outputDir: 'assets/img/portfolio' },
      { source: 'assets/img/portfolio/fullsize/5.jpeg', name: 'portfolio-5', outputDir: 'assets/img/portfolio' },
      { source: 'assets/img/portfolio/fullsize/6.jpeg', name: 'portfolio-6', outputDir: 'assets/img/portfolio' },
      { source: 'assets/img/portfolio/fullsize/7.jpeg', name: 'portfolio-7', outputDir: 'assets/img/portfolio' },
      { source: 'assets/img/portfolio/fullsize/8.jpeg', name: 'portfolio-8', outputDir: 'assets/img/portfolio' }
    ]
  },

  // Map image - preserve aspect ratio
  map: {
    sizes: [
      { width: 1200, suffix: '1200w', maintainAspect: true },
      { width: 800, suffix: '800w', maintainAspect: true },
      { width: 600, suffix: '600w', maintainAspect: true }
    ],
    quality: { webp: 85, jpg: 80 },
    images: [
      { source: 'assets/img/mapa-google.jpg', name: 'mapa-google' }
    ]
  }
};

// Statistics
let stats = {
  processed: 0,
  skipped: 0,
  errors: 0,
  total: 0
};

/**
 * Process a single image
 */
async function processImage(imageConfig, categoryConfig, categoryName) {
  const { source, name, outputDir } = imageConfig;
  const sourcePath = path.join(process.cwd(), source);
  const outputBaseDir = outputDir || path.dirname(source);
  const baseName = name;

  // Check if source file exists
  if (!fs.existsSync(sourcePath)) {
    console.log(`⚠️  Skipping: ${source} (file not found)`);
    stats.skipped++;
    return;
  }

  console.log(`\n📸 Processing: ${source}`);
  
  // Get original image metadata to determine aspect ratio
  let originalMetadata;
  try {
    originalMetadata = await sharp(sourcePath).metadata();
    const aspectRatio = originalMetadata.width / originalMetadata.height;
    const orientation = aspectRatio > 1 ? 'landscape' : aspectRatio < 1 ? 'portrait' : 'square';
    console.log(`  📐 Original: ${originalMetadata.width}×${originalMetadata.height} (${orientation}, ratio: ${aspectRatio.toFixed(2)})`);
  } catch (error) {
    console.error(`  ❌ Error reading metadata:`, error.message);
    stats.errors++;
    return;
  }

  stats.total += categoryConfig.sizes.length * 2; // WebP + JPG for each size

  // Process each size
  for (const size of categoryConfig.sizes) {
    const { width, suffix, maintainAspect = true } = size;
    const outputName = `${baseName}-${suffix}`;

    try {
      // Calculate height if maintaining aspect ratio
      let resizeOptions;
      if (maintainAspect) {
        // Maintain aspect ratio - only specify width, height will be calculated
        resizeOptions = {
          width: width,
          fit: 'inside', // Fit inside dimensions, maintain aspect ratio
          withoutEnlargement: true // Don't upscale if image is smaller
        };
      } else {
        // For hero images, allow cropping to exact dimensions
        const targetHeight = Math.round(width / (16/9)); // 16:9 aspect ratio for hero
        resizeOptions = {
          width: width,
          height: targetHeight,
          fit: 'cover',
          position: 'center'
        };
      }

      // Generate WebP
      const webpPath = path.join(process.cwd(), outputBaseDir, `${outputName}.webp`);
      const webpMetadata = await sharp(sourcePath)
        .resize(resizeOptions)
        .webp({ quality: categoryConfig.quality.webp })
        .toFile(webpPath);
      const webpInfo = await sharp(webpPath).metadata();
      console.log(`  ✅ Generated: ${outputName}.webp (${webpInfo.width}×${webpInfo.height})`);
      stats.processed++;

      // Generate JPG fallback
      const jpgPath = path.join(process.cwd(), outputBaseDir, `${outputName}.jpg`);
      const jpgMetadata = await sharp(sourcePath)
        .resize(resizeOptions)
        .jpeg({ quality: categoryConfig.quality.jpg, progressive: true })
        .toFile(jpgPath);
      const jpgInfo = await sharp(jpgPath).metadata();
      console.log(`  ✅ Generated: ${outputName}.jpg (${jpgInfo.width}×${jpgInfo.height})`);
      stats.processed++;

    } catch (error) {
      console.error(`  ❌ Error processing ${outputName}:`, error.message);
      stats.errors++;
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting image optimization...\n');
  console.log('='.repeat(60));

  // Process each category
  for (const [categoryName, categoryConfig] of Object.entries(IMAGE_CONFIG)) {
    console.log(`\n📁 Category: ${categoryName.toUpperCase()}`);
    console.log('-'.repeat(60));

    for (const imageConfig of categoryConfig.images) {
      await processImage(imageConfig, categoryConfig, categoryName);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`  ✅ Processed: ${stats.processed} files`);
  console.log(`  ⚠️  Skipped: ${stats.skipped} files`);
  console.log(`  ❌ Errors: ${stats.errors} files`);
  console.log(`  📦 Total: ${stats.total} files expected`);
  console.log('\n✨ Done!');
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

