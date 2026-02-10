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
const IMAGE_CONFIG = {
  // Hero images (full-width backgrounds)
  hero: {
    sizes: [
      { width: 1920, height: 1080, suffix: '1920w' },
      { width: 1200, height: 675, suffix: '1200w' },
      { width: 768, height: 432, suffix: '768w' },
      { width: 480, height: 270, suffix: '480w' }
    ],
    quality: { webp: 85, jpg: 80 },
    images: [
      { source: 'assets/img/bg-masthead.jpeg', name: 'bg-masthead' },
      { source: 'assets/img/bg-masthead_1.jpeg', name: 'bg-masthead_1' },
      { source: 'assets/img/14.jpg', name: '14' }
    ]
  },

  // Content images (50/50 split, max 75% width)
  content: {
    sizes: [
      { width: 800, height: 600, suffix: '800w' },
      { width: 600, height: 450, suffix: '600w' },
      { width: 400, height: 300, suffix: '400w' }
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

  // Gallery images (3-column grid)
  gallery: {
    sizes: [
      { width: 1200, height: 800, suffix: '1200w' },
      { width: 800, height: 533, suffix: '800w' },
      { width: 600, height: 400, suffix: '600w' },
      { width: 400, height: 267, suffix: '400w' }
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

  // Portfolio carousel images
  portfolio: {
    sizes: [
      { width: 1200, height: 800, suffix: '1200w' },
      { width: 800, height: 533, suffix: '800w' },
      { width: 600, height: 400, suffix: '600w' }
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

  // Map image
  map: {
    sizes: [
      { width: 1200, height: 600, suffix: '1200w' },
      { width: 800, height: 400, suffix: '800w' },
      { width: 600, height: 300, suffix: '600w' }
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
  stats.total += categoryConfig.sizes.length * 2; // WebP + JPG for each size

  // Process each size
  for (const size of categoryConfig.sizes) {
    const { width, height, suffix } = size;
    const outputName = `${baseName}-${suffix}`;

    try {
      // Generate WebP
      const webpPath = path.join(process.cwd(), outputBaseDir, `${outputName}.webp`);
      await sharp(sourcePath)
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: categoryConfig.quality.webp })
        .toFile(webpPath);
      console.log(`  ✅ Generated: ${outputName}.webp (${width}×${height})`);
      stats.processed++;

      // Generate JPG fallback
      const jpgPath = path.join(process.cwd(), outputBaseDir, `${outputName}.jpg`);
      await sharp(sourcePath)
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: categoryConfig.quality.jpg, progressive: true })
        .toFile(jpgPath);
      console.log(`  ✅ Generated: ${outputName}.jpg (${width}×${height})`);
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

