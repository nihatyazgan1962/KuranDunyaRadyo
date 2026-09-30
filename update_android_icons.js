const fs = require('fs');
const path = require('path');

const iconPath = path.join(__dirname, 'app_icon.jpg');
const iconData = fs.readFileSync(iconPath);

const resDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');
const mipmapDirs = [
  'mipmap-hdpi',
  'mipmap-mdpi',
  'mipmap-xhdpi',
  'mipmap-xxhdpi',
  'mipmap-xxxhdpi'
];

mipmapDirs.forEach(dir => {
  const targetDir = path.join(resDir, dir);
  if (fs.existsSync(targetDir)) {
    fs.writeFileSync(path.join(targetDir, 'ic_launcher.png'), iconData);
    fs.writeFileSync(path.join(targetDir, 'ic_launcher_round.png'), iconData);
    fs.writeFileSync(path.join(targetDir, 'ic_launcher_foreground.png'), iconData);
  }
});

console.log('App launcher icons replaced successfully with Dunya Kuran visual.');
