import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to create directory if it doesn't exist
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

// Function to recursively find all SCSS files
function findScssFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findScssFiles(filePath, fileList);
    } else if (file.endsWith('.scss')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Function to copy a file preserving its relative path
function copyFile(srcFile, srcDir, destDir) {
  const relativePath = path.relative(srcDir, srcFile);
  const destFile = path.join(destDir, relativePath);
  const destFileDir = path.dirname(destFile);

  ensureDirectoryExists(destFileDir);
  fs.copyFileSync(srcFile, destFile);

  console.log(`Copied: ${srcFile} -> ${destFile}`);
}

// Main function
function copyScssFiles() {
  const srcDir = path.resolve(__dirname, '../src');
  const destDir = path.resolve(__dirname, '../dist');

  console.log(`Copying SCSS files from ${srcDir} to ${destDir}...`);

  // Find all SCSS files in the src directory
  const scssFiles = findScssFiles(srcDir);

  // Copy each SCSS file to the dist directory preserving folder structure
  scssFiles.forEach(file => {
    copyFile(file, srcDir, destDir);
  });

  console.log(`Successfully copied ${scssFiles.length} SCSS files.`);
}

// Execute the main function
copyScssFiles();
