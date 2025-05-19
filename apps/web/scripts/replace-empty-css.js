import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to recursively find all JS files
function findJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findJsFiles(filePath, fileList);
    } else if (file.endsWith('.js') && !file.endsWith('.d.js')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Function to find all SCSS files in the same directory as a JS file
function findScssFiles(jsFilePath) {
  const dir = path.dirname(jsFilePath);
  const files = fs.readdirSync(dir);

  return files
    .filter(file => file.endsWith('.scss'))
    .map(file => path.join(dir, file))
    .map(file => path.relative(dir, file));
}

// Function to replace empty CSS comments with imports
function replaceEmptyCssComments(jsFilePath) {
  let content = fs.readFileSync(jsFilePath, 'utf8');
  const emptyCssPattern = /\/\*\s*empty css\s*\*\/\n/g;

  if (!emptyCssPattern.test(content)) {
    return false; // No empty CSS comments found
  }

  // Find all SCSS files in the same directory
  const scssFiles = findScssFiles(jsFilePath);

  if (scssFiles.length === 0) {
    console.log(`No SCSS files found for ${jsFilePath}`);
    return false;
  }

  // Generate import statements for each SCSS file
  const importStatements = scssFiles
    .map(file => `import "./${file}";`)
    .join('\n');

  // Count the number of empty CSS comments
  const matches = content.match(emptyCssPattern);
  const commentCount = matches ? matches.length : 0;

  // Replace all empty CSS comments with empty strings first
  content = content.replace(emptyCssPattern, '');

  // Insert the import statements after the last import statement
  const lastImportIndex = content.lastIndexOf('import ');
  if (lastImportIndex !== -1) {
    const endOfImportLine = content.indexOf('\n', lastImportIndex) + 1;
    content = content.slice(0, endOfImportLine) + importStatements + '\n' + content.slice(endOfImportLine);
  } else {
    // If no imports found, add at the beginning of the file
    content = importStatements + '\n' + content;
  }

  // Write the modified content back to the file
  fs.writeFileSync(jsFilePath, content);

  console.log(`Updated: ${jsFilePath} with imports for ${scssFiles.join(', ')} (replaced ${commentCount} comments)`);
  return true;
}

// Main function
function replaceEmptyCss() {
  const distDir = path.resolve(__dirname, '../dist');

  console.log(`Searching for JS files with empty CSS comments in ${distDir}...`);

  // Find all JS files in the dist directory
  const jsFiles = findJsFiles(distDir);

  console.log(`Found ${jsFiles.length} JS files.`);

  // Process each JS file
  let updatedCount = 0;
  jsFiles.forEach(file => {
    if (replaceEmptyCssComments(file)) {
      updatedCount++;
    }
  });

  console.log(`Successfully updated ${updatedCount} JS files.`);
}

// Execute the main function
replaceEmptyCss();
