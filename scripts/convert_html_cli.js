#!/usr/bin/env node
/**
 * convert_html_cli - Command line interface for HTML to PPTX conversion
 *
 * Usage:
 *   node convert_html_cli.js <input.html> <output.pptx>
 *   node convert_html_cli.js --multi <dir> <output.pptx>
 *
 * Author: aktsmm
 * License: CC BY-NC 4.0
 */

const {
  convertHtmlToPptx,
  convertMultipleHtmlToPptx,
} = require("./convert_html");
const fs = require("fs");
const path = require("path");

function printUsage() {
  console.log(`
convert_html_cli - Convert HTML slides to PowerPoint

Usage:
  node convert_html_cli.js <input.html> <output.pptx>
  node convert_html_cli.js --multi <directory> <output.pptx>
  node convert_html_cli.js --multi <file1.html> <file2.html> ... <output.pptx>

Options:
  --multi     Convert multiple HTML files to a single PPTX
  --width     Slide width in inches (default: 10)
  --height    Slide height in inches (default: 5.625)

Examples:
  node convert_html_cli.js slide.html presentation.pptx
  node convert_html_cli.js --multi ./slides/ output.pptx
  node convert_html_cli.js --multi slide1.html slide2.html slide3.html output.pptx
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2 || args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(args.includes("--help") || args.includes("-h") ? 0 : 1);
  }

  // Parse options
  const options = {
    width: 10,
    height: 5.625,
  };

  let multiMode = false;
  let positionalArgs = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--multi") {
      multiMode = true;
    } else if (args[i] === "--width" && args[i + 1]) {
      options.width = parseFloat(args[++i]);
    } else if (args[i] === "--height" && args[i + 1]) {
      options.height = parseFloat(args[++i]);
    } else if (!args[i].startsWith("--")) {
      positionalArgs.push(args[i]);
    }
  }

  try {
    if (multiMode) {
      if (positionalArgs.length < 2) {
        console.error(
          "Error: --multi requires at least one input and an output path"
        );
        process.exit(1);
      }

      const outputPath = positionalArgs[positionalArgs.length - 1];
      const inputs = positionalArgs.slice(0, -1);

      let htmlFiles = [];

      for (const input of inputs) {
        const stat = fs.statSync(input);

        if (stat.isDirectory()) {
          // Get all HTML files from directory, sorted
          const dirFiles = fs
            .readdirSync(input)
            .filter((f) => f.endsWith(".html"))
            .sort()
            .map((f) => path.join(input, f));
          htmlFiles.push(...dirFiles);
        } else if (stat.isFile() && input.endsWith(".html")) {
          htmlFiles.push(input);
        }
      }

      if (htmlFiles.length === 0) {
        console.error("Error: No HTML files found");
        process.exit(1);
      }

      console.log(`Converting ${htmlFiles.length} HTML files...`);
      await convertMultipleHtmlToPptx(htmlFiles, outputPath, options);
    } else {
      if (positionalArgs.length !== 2) {
        console.error(
          "Error: Requires exactly 2 arguments: <input.html> <output.pptx>"
        );
        process.exit(1);
      }

      const [inputPath, outputPath] = positionalArgs;

      if (!fs.existsSync(inputPath)) {
        console.error(`Error: Input file not found: ${inputPath}`);
        process.exit(1);
      }

      console.log(`Converting ${inputPath}...`);
      await convertHtmlToPptx(inputPath, outputPath, options);
    }
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
