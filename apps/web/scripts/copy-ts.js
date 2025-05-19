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

// Function to recursively find all TypeScript files
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      // Skip test files
      if (!file.includes('.test.')) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

// Function to resolve @ imports to relative paths
function resolveImports(content, srcFilePath, srcDir) {
  // Regular expressions to match different types of imports with @ symbol
  const importPatterns = [
    // import ... from "@/..."
    /from\s+['"](@\/[^'"]+)['"]/g,
    // import "@/..."
    /import\s+['"](@\/[^'"]+)['"]/g,
    // require("@/...")
    /require\s*\(\s*['"](@\/[^'"]+)['"]\s*\)/g
  ];

  let modifiedContent = content;

  // Process each import pattern
  importPatterns.forEach(pattern => {
    modifiedContent = modifiedContent.replace(pattern, (match, importPath) => {
      // Remove the @ prefix
      const relativePath = importPath.replace('@/', '');

      // Calculate the relative path from the current file to the imported file
      const currentFileDir = path.dirname(srcFilePath);
      const targetFilePath = path.join(srcDir, relativePath);
      const targetFileDir = path.dirname(targetFilePath);

      // Calculate relative path from current file to target file
      let relPath = path.relative(currentFileDir, targetFileDir);

      // If we're in the same directory, use './'
      if (relPath === '') {
        relPath = '.';
      }

      // Get the filename part of the import
      const fileName = path.basename(importPath);

      // Keep the original extension for the import path
      // This ensures that imports like "@/components/button.tsx" remain as ".tsx"
      const newImportPath = `${relPath}/${fileName}`;

      // Return the appropriate replacement based on the pattern
      if (match.includes('from')) {
        return `from "${newImportPath}"`;
      } else if (match.includes('require')) {
        return `require("${newImportPath}")`;
      } else {
        return `import "${newImportPath}"`;
      }
    });
  });

  return modifiedContent;
}

// Function to copy a file preserving its relative path and resolving imports
function copyFile(srcFile, srcDir, destDir) {
  const relativePath = path.relative(srcDir, srcFile);
  const destFile = path.join(destDir, relativePath);
  const destFileDir = path.dirname(destFile);

  ensureDirectoryExists(destFileDir);

  // Read the file content
  let content = fs.readFileSync(srcFile, 'utf8');

  // Resolve @ imports to relative paths
  content = resolveImports(content, srcFile, srcDir);

  // Write the modified content to the destination file
  fs.writeFileSync(destFile, content);

  console.log(`Copied and processed: ${srcFile} -> ${destFile}`);
}

// Main function
function copyTsFiles() {
  const srcDir = path.resolve(__dirname, '../src');
  const destDir = path.resolve(__dirname, '../dist');

  console.log(`Copying TypeScript files from ${srcDir} to ${destDir}...`);

  // Find all TypeScript files in the src directory
  const tsFiles = findTsFiles(srcDir);

  // Copy each TypeScript file to the dist directory preserving folder structure
  tsFiles.forEach(file => {
    copyFile(file, srcDir, destDir);
  });

  console.log(`Successfully copied and processed ${tsFiles.length} TypeScript files.`);
}

// Execute the main function
copyTsFiles();
