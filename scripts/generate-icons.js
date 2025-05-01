const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ICON_SIZES = {
  windows: [16, 32, 48, 64, 128, 256],
  mac: [16, 32, 64, 128, 256, 512, 1024],
  linux: [16, 32, 48, 64, 128, 256, 512]
};

async function generateIcons() {
  const publicDir = path.join(__dirname, '../renderer/public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Create a simple blue square icon as a placeholder
  const svgIcon = `
    <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="1024" fill="#1a1a1a"/>
      <circle cx="512" cy="512" r="400" fill="#00f3ff" opacity="0.8"/>
      <text x="512" y="600" font-family="Arial" font-size="300" fill="white" text-anchor="middle">DG</text>
    </svg>
  `;

  // Generate Windows icon
  const windowsIcon = sharp(Buffer.from(svgIcon))
    .resize(256, 256)
    .toFormat('png');
  
  await windowsIcon.toFile(path.join(publicDir, 'icon.ico'));

  // Generate macOS icon
  const macIcon = sharp(Buffer.from(svgIcon))
    .resize(1024, 1024)
    .toFormat('png');
  
  await macIcon.toFile(path.join(publicDir, 'icon.icns'));

  // Generate Linux icon
  const linuxIcon = sharp(Buffer.from(svgIcon))
    .resize(512, 512)
    .toFormat('png');
  
  await linuxIcon.toFile(path.join(publicDir, 'icon.png'));

  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error); 