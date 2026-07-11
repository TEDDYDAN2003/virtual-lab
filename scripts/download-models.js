#!/usr/bin/env node
/**
 * Download 3D models for Celebra Virtual Lab
 * Run: node scripts/download-models.js
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const MODELS_DIR = path.join(__dirname, '..', 'public', 'models');

const models = [
  // NIH Cell Biology Models
  {
    name: 'animal-cell-nih.glb',
    url: 'https://raw.githubusercontent.com/cclank/cell-architecture-studio/main/public/models/animal-cell-nih.glb',
  },
  {
    name: 'neuron-nih.glb',
    url: 'https://raw.githubusercontent.com/cclank/cell-architecture-studio/main/public/models/neuron-nih.glb',
  },
  {
    name: 'bacteria-wall-nih.glb',
    url: 'https://raw.githubusercontent.com/cclank/cell-architecture-studio/main/public/models/bacteria-wall-nih.glb',
  },
  // Three.js Examples
  {
    name: 'horse.glb',
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Horse.glb',
  },
  {
    name: 'flamingo.glb',
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Flamingo.glb',
  },
  {
    name: 'parrot.glb',
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Parrot.glb',
  },
  {
    name: 'stork.glb',
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Stork.glb',
  },
  // Khronos glTF Sample Assets
  {
    name: 'fox.glb',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Fox/glTF-Binary/Fox.glb',
  },
  {
    name: 'barramundi-fish.glb',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BarramundiFish/glTF-Binary/BarramundiFish.glb',
  },
  {
    name: 'mosquito-in-amber.glb',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/MosquitoInAmber/glTF-Binary/MosquitoInAmber.glb',
  },
  {
    name: 'avocado.glb',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Avocado/glTF-Binary/Avocado.glb',
  },
  {
    name: 'glass-vase-flowers.glb',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/GlassVaseFlowers/glTF-Binary/GlassVaseFlowers.glb',
  },
  {
    name: 'diffuse-transmission-plant.glb',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DiffuseTransmissionPlant/glTF-Binary/DiffuseTransmissionPlant.glb',
  },
  {
    name: 'brain-stem.glb',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BrainStem/glTF-Binary/BrainStem.glb',
  },
];

if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const file = fs.createWriteStream(dest);
    client.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      const total = parseInt(response.headers['content-length'], 10) || 0;
      let downloaded = 0;
      response.on('data', (chunk) => {
        downloaded += chunk.length;
        if (total) {
          const pct = Math.round((downloaded / total) * 100);
          process.stdout.write(`\r  ${path.basename(dest)}: ${pct}%`);
        }
      });
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`  ✓ ${path.basename(dest)}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('Downloading 3D models for Celebra Virtual Lab...\n');
  for (const model of models) {
    const dest = path.join(MODELS_DIR, model.name);
    if (fs.existsSync(dest)) {
      console.log(`  ⏭  ${model.name} (already exists)`);
      continue;
    }
    try {
      await downloadFile(model.url, dest);
    } catch (err) {
      console.error(`  ✗ ${model.name}: ${err.message}`);
    }
  }
  console.log('\nDone! Models saved to public/models/');
}

main();
