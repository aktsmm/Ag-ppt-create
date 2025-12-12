#!/usr/bin/env node
/**
 * convert_html_multi - Convert multiple HTML files to a single PPTX
 *
 * Usage:
 *   node convert_html_multi.js <directory> <output.pptx>
 *   node convert_html_multi.js <file1.html> <file2.html> ... <output.pptx>
 *
 * Author: aktsmm
 * License: CC BY-NC 4.0
 */

const { convertMultipleHtmlToPptx } = require("./convert_html");
const fs = require("fs");
const path = require("path");

function printUsage() {
  console.log(`
convert_html_multi - Convert multiple HTML slides to PowerPoint

Usage:
  node convert_html_multi.js <directory> <output.pptx>
  node convert_html_multi.js <file1.html> <file2.html> ... <output.pptx>

Description:
  Converts multiple HTML files into a single PowerPoint presentation.
  Each HTML file becomes one slide in the output.

  When a directory is provided, all .html files are sorted alphabetically
  and processed in order.

Examples:
  node convert_html_multi.js ./slides/ presentation.pptx
  node convert_html_multi.js slide-01.html slide-02.html slide-03.html output.pptx
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2 || args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(args.includes("--help") || args.includes("-h") ? 0 : 1);
  }

  const outputPath = args[args.length - 1];
  const inputs = args.slice(0, -1);

  try {
    let htmlFiles = [];

    for (const input of inputs) {
      if (!fs.existsSync(input)) {
        console.error(`Error: Path not found: ${input}`);
        process.exit(1);
      }

      const stat = fs.statSync(input);

      if (stat.isDirectory()) {
        // Get all HTML files from directory, sorted
        const dirFiles = fs
          .readdirSync(input)
          .filter((f) => f.endsWith(".html"))
          .sort()
          .map((f) => path.join(input, f));

        if (dirFiles.length === 0) {
          console.warn(`Warning: No HTML files found in ${input}`);
        }

        htmlFiles.push(...dirFiles);
      } else if (stat.isFile()) {
        if (!input.endsWith(".html")) {
          console.warn(`Warning: Skipping non-HTML file: ${input}`);
          continue;
        }
        htmlFiles.push(input);
      }
    }

    if (htmlFiles.length === 0) {
      console.error("Error: No HTML files found to process");
      process.exit(1);
    }

    console.log(`Processing ${htmlFiles.length} HTML file(s)...`);
    htmlFiles.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
    console.log(`Output: ${outputPath}`);
    console.log("");

    await convertMultipleHtmlToPptx(htmlFiles, outputPath);

    console.log(
      `\nSuccessfully created ${outputPath} with ${htmlFiles.length} slide(s)`
    );
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
