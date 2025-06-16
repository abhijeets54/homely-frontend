const madge = require('madge');
const path = require('path');
const fs = require('fs');

// Function to prune the dependency tree
function pruneTree(subtree, tree) {
  if (!subtree || subtree.length === 0) return;
  for (let child of subtree) {
    const nextSubtree = tree[child];
    if (tree[child]) {
      delete tree[child];
    }
    pruneTree(nextSubtree, tree);
  }
}

// Main function to detect unused files
async function detectUnusedFiles() {
  try {
    console.log('Analyzing project for unused files...');

    const result = await madge(path.join(__dirname, '..'), {
      baseDir: path.join(__dirname, '..'),
      excludeRegExp: [
        /^\\.next[\\/]/, // Ignore built artifacts
        /^next\\.config\\.js/, // Ignore Next.js configuration
        /^scripts[\\/]/, // Ignore scripts (where this file lives)
        /^node_modules[\\/]/, // Ignore node_modules
        /^public[\\/]/, // Ignore public assets
        /^.history[\\/]/, // Ignore history files
        /^.git[\\/]/ // Ignore git files
      ]
    });

    const tree = result.obj();
    
    // Get all pages as entry points
    const entrypoints = Object.keys(tree).filter(
      e => e.startsWith('app/') || e.startsWith('app\\')
    );

    // Prune the tree starting from entry points
    pruneTree(entrypoints, tree);

    // Get the remaining files (unused)
    const unusedFiles = Object.keys(tree);

    if (unusedFiles.length) {
      console.log(
        `⚠️  Found ${unusedFiles.length} files that no one is depending on, consider removing:`
      );
      unusedFiles.forEach(file => {
        console.log("\x1b[33m%s\x1b[0m", file);
      });
      return unusedFiles;
    } else {
      console.log('🎉 No unused files!');
      return [];
    }
  } catch (error) {
    console.error('Error analyzing project:', error);
    return [];
  }
}

// Execute if this script is run directly
if (require.main === module) {
  detectUnusedFiles();
}

module.exports = detectUnusedFiles; 