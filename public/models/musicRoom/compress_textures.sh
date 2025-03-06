#!/bin/bash

# Set input & output folders
INPUT_DIR="./"
OUTPUT_DIR="./compressed_ktx2/"

# Create output directory if it does not exist
mkdir -p "$OUTPUT_DIR"

# Check if gltf-transform is installed
if ! npx gltf-transform --version &> /dev/null; then
    echo "❌ Error: 'gltf-transform' is not installed. Install it using 'npm install -g @gltf-transform/cli'."
    exit 1
fi

# Loop through all .glb files starting with "compressed_"
for file in "$INPUT_DIR"compressed_*.glb; do
    filename=$(basename "$file" .glb)
    echo "🔄 Compressing textures in: $filename.glb"

    # Optimize and compress textures directly inside the GLB
    npx gltf-transform optimize "$file" "$OUTPUT_DIR/${filename}_ktx2.glb" --texture-compress ktx2

    echo "✅ Compressed: $OUTPUT_DIR/${filename}_ktx2.glb"
done