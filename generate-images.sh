#!/bin/bash

# Image Optimization Script for Vlčí máky Website (Bash/ImageMagick version)
# 
# Generates WebP and JPG versions of images in multiple sizes
# 
# Usage:
#   chmod +x generate-images.sh
#   ./generate-images.sh
# 
# Requirements:
#   - ImageMagick (convert command)
#   - cwebp (WebP encoder) - install: sudo apt-get install webp

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Statistics
PROCESSED=0
SKIPPED=0
ERRORS=0

# Check dependencies
command -v convert >/dev/null 2>&1 || { echo -e "${RED}Error: ImageMagick (convert) is required but not installed.${NC}" >&2; exit 1; }
command -v cwebp >/dev/null 2>&1 || { echo -e "${RED}Error: cwebp is required but not installed. Install: sudo apt-get install webp${NC}" >&2; exit 1; }

# Function to process a single image
process_image() {
    local source_file=$1
    local output_name=$2
    local output_dir=$3
    local width=$4
    local maintain_aspect=$5
    local suffix=$6
    local webp_quality=$7
    local jpg_quality=$8

    # Check if source exists
    if [ ! -f "$source_file" ]; then
        echo -e "${YELLOW}⚠️  Skipping: $source_file (file not found)${NC}"
        ((SKIPPED++))
        return
    fi

    local output_base="${output_dir}/${output_name}-${suffix}"
    
    # Get original dimensions
    local original_dims=$(identify -format "%wx%h" "$source_file" 2>/dev/null)
    if [ -z "$original_dims" ]; then
        echo -e "${RED}  ❌ Error reading image dimensions${NC}"
        ((ERRORS++))
        return
    fi
    
    local resize_cmd
    if [ "$maintain_aspect" = "true" ]; then
        # Maintain aspect ratio - only specify width
        resize_cmd="-resize ${width}x"
    else
        # For hero images, allow cropping to 16:9
        local height=$((width * 9 / 16))
        resize_cmd="-resize ${width}x${height}^ -gravity center -extent ${width}x${height}"
    fi
    
    # Generate JPG
    if convert "$source_file" $resize_cmd -quality "$jpg_quality" "${output_base}.jpg" 2>/dev/null; then
        local jpg_dims=$(identify -format "%wx%h" "${output_base}.jpg" 2>/dev/null)
        echo -e "${GREEN}  ✅ Generated: ${output_name}-${suffix}.jpg (${jpg_dims})${NC}"
        ((PROCESSED++))
    else
        echo -e "${RED}  ❌ Error generating ${output_name}-${suffix}.jpg${NC}"
        ((ERRORS++))
    fi

    # Generate WebP
    if convert "$source_file" $resize_cmd -quality "$webp_quality" "${output_base}.webp" 2>/dev/null; then
        local webp_dims=$(identify -format "%wx%h" "${output_base}.webp" 2>/dev/null)
        echo -e "${GREEN}  ✅ Generated: ${output_name}-${suffix}.webp (${webp_dims})${NC}"
        ((PROCESSED++))
    else
        # Fallback: use cwebp if convert doesn't support WebP
        convert "$source_file" $resize_cmd "${output_base}.png" 2>/dev/null
        if cwebp -q "$webp_quality" "${output_base}.png" -o "${output_base}.webp" 2>/dev/null; then
            rm -f "${output_base}.png"
            local webp_dims=$(identify -format "%wx%h" "${output_base}.webp" 2>/dev/null)
            echo -e "${GREEN}  ✅ Generated: ${output_name}-${suffix}.webp (${webp_dims})${NC}"
            ((PROCESSED++))
        else
            rm -f "${output_base}.png"
            echo -e "${RED}  ❌ Error generating ${output_name}-${suffix}.webp${NC}"
            ((ERRORS++))
        fi
    fi
}

# Process category
process_category() {
    local category_name=$1
    shift
    local sizes=("$@")
    
    echo -e "\n${BLUE}📁 Category: ${category_name^^}${NC}"
    echo "------------------------------------------------------------"
}

# Hero images (allow cropping to 16:9)
process_category "HERO" "1920:1920w" "1200:1200w" "768:768w" "480:480w"
for img in "assets/img/bg-masthead.jpeg:bg-masthead" "assets/img/bg-masthead_1.jpeg:bg-masthead_1" "assets/img/14.jpg:14"; do
    IFS=':' read -r source name <<< "$img"
    output_dir=$(dirname "$source")
    echo -e "\n${BLUE}📸 Processing: $source${NC}"
    for size in "1920:1920w" "1200:1200w" "768:768w" "480:480w"; do
        IFS=':' read -r w suffix <<< "$size"
        process_image "$source" "$name" "$output_dir" "$w" "false" "$suffix" 85 80
    done
done

# Content images (maintain aspect ratio)
process_category "CONTENT" "800:800w" "600:600w" "400:400w"
for img in "assets/img/marketa.jpg:marketa" "assets/img/julie.jpeg:julie" "assets/img/martin_0.jpg:martin_0" \
           "assets/img/janka.jpg:janka" "assets/img/12.jpg:12" "assets/img/5.jpg:5" \
           "assets/img/13.jpg:13" "assets/img/13(1).jpg:13(1)" "assets/img/13(2).jpg:13(2)"; do
    IFS=':' read -r source name <<< "$img"
    output_dir=$(dirname "$source")
    echo -e "\n${BLUE}📸 Processing: $source${NC}"
    for size in "800:800w" "600:600w" "400:400w"; do
        IFS=':' read -r w suffix <<< "$size"
        process_image "$source" "$name" "$output_dir" "$w" "true" "$suffix" 85 80
    done
done

# Gallery images (maintain aspect ratio)
process_category "GALLERY" "1200:1200w" "800:800w" "600:600w" "400:400w"
for img in "assets/img/mostovani.jpg:mostovani" "assets/img/komunita_2.jpeg:komunita_2" "assets/img/komunita_3.jpg:komunita_3" \
           "assets/img/tym_0.jpg:tym_0" "assets/img/tym_4.jpg:tym_4" "assets/img/tym_2.jpg:tym_2" \
           "assets/img/vzdelani_0.jpg:vzdelani_0" "assets/img/vzdelani_3.jpg:vzdelani_3" "assets/img/vzdelani_2.jpg:vzdelani_2" \
           "assets/img/vybaveni_2.jpg:vybaveni_2" "assets/img/vybaveni_0.jpg:vybaveni_0" "assets/img/vybaveni_1.jpg:vybaveni_1"; do
    IFS=':' read -r source name <<< "$img"
    output_dir=$(dirname "$source")
    echo -e "\n${BLUE}📸 Processing: $source${NC}"
    for size in "1200:1200w" "800:800w" "600:600w" "400:400w"; do
        IFS=':' read -r w suffix <<< "$size"
        process_image "$source" "$name" "$output_dir" "$w" "true" "$suffix" 85 80
    done
done

# Portfolio images (maintain aspect ratio)
process_category "PORTFOLIO" "1200:1200w" "800:800w" "600:600w"
for img in "assets/img/1.jpg:1" "assets/img/portfolio/fullsize/1.jpeg:portfolio-1:assets/img/portfolio" \
           "assets/img/portfolio/fullsize/2.jpeg:portfolio-2:assets/img/portfolio" \
           "assets/img/portfolio/fullsize/3.jpeg:portfolio-3:assets/img/portfolio" \
           "assets/img/portfolio/fullsize/4.jpeg:portfolio-4:assets/img/portfolio" \
           "assets/img/portfolio/fullsize/5.jpeg:portfolio-5:assets/img/portfolio" \
           "assets/img/portfolio/fullsize/6.jpeg:portfolio-6:assets/img/portfolio" \
           "assets/img/portfolio/fullsize/7.jpeg:portfolio-7:assets/img/portfolio" \
           "assets/img/portfolio/fullsize/8.jpeg:portfolio-8:assets/img/portfolio"; do
    IFS=':' read -r source name output_dir <<< "$img"
    if [ -z "$output_dir" ]; then
        output_dir=$(dirname "$source")
    fi
    echo -e "\n${BLUE}📸 Processing: $source${NC}"
    for size in "1200:1200w" "800:800w" "600:600w"; do
        IFS=':' read -r w suffix <<< "$size"
        process_image "$source" "$name" "$output_dir" "$w" "true" "$suffix" 85 80
    done
done

# Map image (maintain aspect ratio)
process_category "MAP" "1200:1200w" "800:800w" "600:600w"
source="assets/img/mapa-google.jpg"
name="mapa-google"
output_dir=$(dirname "$source")
echo -e "\n${BLUE}📸 Processing: $source${NC}"
for size in "1200:1200w" "800:800w" "600:600w"; do
    IFS=':' read -r w suffix <<< "$size"
    process_image "$source" "$name" "$output_dir" "$w" "true" "$suffix" 85 80
done

# Summary
echo -e "\n============================================================"
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "  ${GREEN}✅ Processed: $PROCESSED files${NC}"
echo -e "  ${YELLOW}⚠️  Skipped: $SKIPPED files${NC}"
echo -e "  ${RED}❌ Errors: $ERRORS files${NC}"
echo -e "\n${GREEN}✨ Done!${NC}"

