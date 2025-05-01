const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const extract = require('extract-zip');

const MODEL_URL = 'https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip';
const MODEL_DIR = path.join(__dirname, '../models');

async function downloadModel() {
  if (!fs.existsSync(MODEL_DIR)) {
    fs.mkdirSync(MODEL_DIR, { recursive: true });
  }

  const modelPath = path.join(MODEL_DIR, 'model.zip');
  
  console.log('Downloading Vosk model...');
  const response = await fetch(MODEL_URL);
  const fileStream = fs.createWriteStream(modelPath);
  await new Promise((resolve, reject) => {
    response.body.pipe(fileStream);
    response.body.on('error', reject);
    fileStream.on('finish', resolve);
  });

  console.log('Extracting model...');
  await extract(modelPath, { dir: MODEL_DIR });
  
  // Clean up zip file
  fs.unlinkSync(modelPath);
  
  console.log('Model downloaded and extracted successfully!');
}

downloadModel().catch(console.error); 