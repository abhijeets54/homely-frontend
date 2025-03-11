const fs = require('fs');
const path = require('path');

// Define the directories to create
const directories = [
  'public/images',
  'public/images/food',
  'public/images/sellers',
  'public/images/banners',
];

// Create each directory if it doesn't exist
directories.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${fullPath}`);
  } else {
    console.log(`Directory already exists: ${fullPath}`);
  }
});

// Create a placeholder image for food items
const placeholderImagePath = path.join(__dirname, 'public/images/default.jpg');
if (!fs.existsSync(placeholderImagePath)) {
  // Create a simple placeholder image (1x1 pixel transparent PNG)
  const placeholderContent = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    'base64'
  );
  fs.writeFileSync(placeholderImagePath, placeholderContent);
  console.log(`Created placeholder image: ${placeholderImagePath}`);
} else {
  console.log(`Placeholder image already exists: ${placeholderImagePath}`);
}

// Create a 404 image
const notFoundImagePath = path.join(__dirname, 'public/images/404-plate.svg');
if (!fs.existsSync(notFoundImagePath)) {
  // Simple SVG for 404 page
  const notFoundSvg = `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="95" fill="#F9FAFB" stroke="#E5E7EB" stroke-width="2"/>
  <path d="M100 50C72.3858 50 50 72.3858 50 100C50 127.614 72.3858 150 100 150C127.614 150 150 127.614 150 100C150 72.3858 127.614 50 100 50ZM100 140C77.9086 140 60 122.091 60 100C60 77.9086 77.9086 60 100 60C122.091 60 140 77.9086 140 100C140 122.091 122.091 140 100 140Z" fill="#D1D5DB"/>
  <path d="M85 85L115 115M115 85L85 115" stroke="#9CA3AF" stroke-width="6" stroke-linecap="round"/>
  <path d="M70 130C70 130 80 140 100 140C120 140 130 130 130 130" stroke="#9CA3AF" stroke-width="6" stroke-linecap="round"/>
</svg>`;
  fs.writeFileSync(notFoundImagePath, notFoundSvg);
  console.log(`Created 404 image: ${notFoundImagePath}`);
} else {
  console.log(`404 image already exists: ${notFoundImagePath}`);
}

console.log('Image setup complete!'); 