/**
 * convert_html - Convert HTML slides to PowerPoint presentation
 *
 * This module converts HTML files with CSS styling into PowerPoint slides
 * using pptxgenjs library and Playwright for HTML rendering.
 *
 * Usage:
 *   node convert_html.js input.html output.pptx
 *
 * Features:
 *   - Converts HTML to PowerPoint with accurate positioning
 *   - Supports text, images, shapes, and bullet lists
 *   - Handles CSS backgrounds, borders, and basic styling
 *   - Validates content overflow before conversion
 *
 * Author: aktsmm
 * License: CC BY-NC 4.0
 */

const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const pptxgen = require("pptxgenjs");

// Constants for unit conversion
const PT_PER_PX = 0.75;
const PX_PER_IN = 96;
const EMU_PER_IN = 914400;

/**
 * Main function to convert HTML to PPTX
 * @param {string} htmlPath - Path to HTML file
 * @param {string} outputPath - Path for output PPTX
 * @param {Object} options - Conversion options
 */
async function convertHtmlToPptx(htmlPath, outputPath, options = {}) {
  const {
    width = 10, // Default width in inches (16:9 aspect)
    height = 5.625, // Default height in inches
  } = options;

  // Validate input file
  if (!fs.existsSync(htmlPath)) {
    throw new Error(`Input file not found: ${htmlPath}`);
  }

  // Launch browser
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
  });

  try {
    // Load HTML file
    const htmlUrl = `file://${path.resolve(htmlPath)}`;
    await page.goto(htmlUrl, { waitUntil: "networkidle" });

    // Get body dimensions and validate
    const bodyInfo = await getBodyDimensions(page);

    if (bodyInfo.errors.length > 0) {
      console.warn("Warnings:");
      bodyInfo.errors.forEach((err) => console.warn(`  - ${err}`));
    }

    // Extract slide content
    const slideData = await extractSlideContent(page);

    // Create presentation
    const pptx = new pptxgen();
    pptx.defineLayout({ name: "CUSTOM", width, height });
    pptx.layout = "CUSTOM";

    // Add slide
    const slide = pptx.addSlide();

    // Apply background
    if (slideData.background) {
      applyBackground(slide, slideData.background);
    }

    // Add elements
    for (const element of slideData.elements) {
      addElement(slide, element, pptx);
    }

    // Save presentation
    await pptx.writeFile({ fileName: outputPath });
    console.log(`Created: ${outputPath}`);
  } finally {
    await browser.close();
  }
}

/**
 * Get body dimensions and check for overflow
 * @param {Page} page - Playwright page object
 * @returns {Object} Body dimensions and any errors
 */
async function getBodyDimensions(page) {
  const dims = await page.evaluate(() => {
    const body = document.body;
    const style = window.getComputedStyle(body);
    return {
      width: parseFloat(style.width),
      height: parseFloat(style.height),
      scrollWidth: body.scrollWidth,
      scrollHeight: body.scrollHeight,
    };
  });

  const errors = [];
  const widthOverflow = Math.max(0, dims.scrollWidth - dims.width - 1);
  const heightOverflow = Math.max(0, dims.scrollHeight - dims.height - 1);

  if (widthOverflow > 0) {
    errors.push(
      `Content overflows horizontally by ${(widthOverflow * PT_PER_PX).toFixed(
        1
      )}pt`
    );
  }
  if (heightOverflow > 0) {
    errors.push(
      `Content overflows vertically by ${(heightOverflow * PT_PER_PX).toFixed(
        1
      )}pt`
    );
  }

  return { ...dims, errors };
}

/**
 * Extract content from HTML page
 * @param {Page} page - Playwright page object
 * @returns {Object} Slide data with background and elements
 */
async function extractSlideContent(page) {
  return await page.evaluate(() => {
    const body = document.body;
    const bodyStyle = window.getComputedStyle(body);
    const PX_PER_IN = 96;

    // Helper to convert px to inches
    const pxToInches = (px) => px / PX_PER_IN;

    // Helper to parse color
    const parseColor = (color) => {
      if (!color || color === "transparent" || color === "rgba(0, 0, 0, 0)") {
        return null;
      }
      // Convert rgb/rgba to hex
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const r = parseInt(match[1]).toString(16).padStart(2, "0");
        const g = parseInt(match[2]).toString(16).padStart(2, "0");
        const b = parseInt(match[3]).toString(16).padStart(2, "0");
        return `${r}${g}${b}`.toUpperCase();
      }
      return color.replace("#", "").toUpperCase();
    };

    // Helper to extract color from gradient
    const extractGradientColor = (gradient) => {
      if (!gradient || gradient === "none") return null;
      // Match hex color in gradient
      const hexMatch = gradient.match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})/);
      if (hexMatch) {
        const hex = hexMatch[1];
        return hex.length === 3
          ? hex
              .split("")
              .map((c) => c + c)
              .join("")
              .toUpperCase()
          : hex.toUpperCase();
      }
      // Match rgb/rgba in gradient
      const rgbMatch = gradient.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1]).toString(16).padStart(2, "0");
        const g = parseInt(rgbMatch[2]).toString(16).padStart(2, "0");
        const b = parseInt(rgbMatch[3]).toString(16).padStart(2, "0");
        return `${r}${g}${b}`.toUpperCase();
      }
      return null;
    };

    // Extract background - check backgroundColor first, then backgroundImage for gradients
    let bgColor = parseColor(bodyStyle.backgroundColor);
    if (!bgColor) {
      // Check for gradient in backgroundImage
      bgColor = extractGradientColor(bodyStyle.backgroundImage);
    }
    // Also check the shorthand 'background' property via computed style
    if (!bgColor && bodyStyle.background) {
      bgColor = extractGradientColor(bodyStyle.background);
    }

    const background = {
      type: "color",
      value: bgColor || "FFFFFF",
    };

    // Extract elements
    const elements = [];
    const processedElements = new Set();

    function processElement(el) {
      if (processedElements.has(el) || el === body) return;
      processedElements.add(el);

      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();

      // Skip invisible elements
      if (style.display === "none" || style.visibility === "hidden") {
        return;
      }

      const position = {
        x: pxToInches(rect.left),
        y: pxToInches(rect.top),
        w: pxToInches(rect.width),
        h: pxToInches(rect.height),
      };

      const tagName = el.tagName.toLowerCase();

      // Handle images
      if (tagName === "img") {
        elements.push({
          type: "image",
          src: el.src,
          position,
        });
        return;
      }

      // Handle lists
      if (tagName === "ul" || tagName === "ol") {
        const items = [];
        el.querySelectorAll("li").forEach((li) => {
          const liStyle = window.getComputedStyle(li);
          items.push({
            text: li.textContent.trim(),
            options: {
              bullet: tagName === "ul",
              fontSize: parseFloat(liStyle.fontSize) * 0.75,
            },
          });
        });

        if (items.length > 0) {
          elements.push({
            type: "list",
            items,
            position,
            style: {
              fontSize: parseFloat(style.fontSize) * 0.75,
              color: parseColor(style.color) || "000000",
              fontFace: style.fontFamily
                .split(",")[0]
                .replace(/['"]/g, "")
                .trim(),
            },
          });
        }
        return;
      }

      // Handle text elements
      if (
        ["p", "h1", "h2", "h3", "h4", "h5", "h6", "span", "div"].includes(
          tagName
        )
      ) {
        const text = el.textContent.trim();
        if (!text) return;

        // Check if this is a container with child elements
        const hasBlockChildren = Array.from(el.children).some((child) => {
          const childStyle = window.getComputedStyle(child);
          return childStyle.display === "block";
        });

        if (hasBlockChildren) {
          // Process children instead
          Array.from(el.children).forEach(processElement);
          return;
        }

        // Determine alignment
        let align = "left";
        if (style.textAlign === "center") align = "center";
        else if (style.textAlign === "right") align = "right";

        elements.push({
          type: tagName,
          text,
          position,
          style: {
            fontSize: parseFloat(style.fontSize) * 0.75,
            color: parseColor(style.color) || "000000",
            fontFace: style.fontFamily
              .split(",")[0]
              .replace(/['"]/g, "")
              .trim(),
            bold:
              style.fontWeight === "bold" || parseInt(style.fontWeight) >= 700,
            italic: style.fontStyle === "italic",
            align,
          },
        });
      }
    }

    // Process all elements
    Array.from(body.querySelectorAll("*")).forEach(processElement);

    return { background, elements };
  });
}

/**
 * Apply background to slide
 * @param {Slide} slide - pptxgenjs slide object
 * @param {Object} background - Background data
 */
function applyBackground(slide, background) {
  if (background.type === "color" && background.value) {
    slide.background = { color: background.value };
  } else if (background.type === "image" && background.path) {
    slide.background = { path: background.path };
  }
}

/**
 * Add element to slide
 * @param {Slide} slide - pptxgenjs slide object
 * @param {Object} element - Element data
 * @param {pptxgen} pptx - pptxgenjs instance
 */
function addElement(slide, element, pptx) {
  const { type, position } = element;

  switch (type) {
    case "image":
      slide.addImage({
        path: element.src,
        x: position.x,
        y: position.y,
        w: position.w,
        h: position.h,
      });
      break;

    case "list":
      slide.addText(element.items, {
        x: position.x,
        y: position.y,
        w: position.w,
        h: position.h,
        fontSize: element.style.fontSize,
        fontFace: element.style.fontFace,
        color: element.style.color,
        valign: "top",
      });
      break;

    case "shape":
      const shapeOpts = {
        x: position.x,
        y: position.y,
        w: position.w,
        h: position.h,
      };
      if (element.fill) {
        shapeOpts.fill = { color: element.fill };
      }
      if (element.line) {
        shapeOpts.line = element.line;
      }
      slide.addShape(pptx.ShapeType.rect, shapeOpts);
      break;

    default:
      // Text elements (p, h1, h2, etc.)
      if (element.text) {
        slide.addText(element.text, {
          x: position.x,
          y: position.y,
          w: position.w,
          h: position.h,
          fontSize: element.style?.fontSize || 12,
          fontFace: element.style?.fontFace || "Arial",
          color: element.style?.color || "000000",
          bold: element.style?.bold || false,
          italic: element.style?.italic || false,
          align: element.style?.align || "left",
          valign: "top",
        });
      }
  }
}

/**
 * Convert multiple HTML files to a single PPTX
 * @param {string[]} htmlPaths - Array of HTML file paths
 * @param {string} outputPath - Path for output PPTX
 * @param {Object} options - Conversion options
 */
async function convertMultipleHtmlToPptx(htmlPaths, outputPath, options = {}) {
  const { width = 10, height = 5.625 } = options;

  const browser = await chromium.launch({ headless: true });

  try {
    const pptx = new pptxgen();
    pptx.defineLayout({ name: "CUSTOM", width, height });
    pptx.layout = "CUSTOM";

    for (const htmlPath of htmlPaths) {
      if (!fs.existsSync(htmlPath)) {
        console.warn(`Skipping missing file: ${htmlPath}`);
        continue;
      }

      const page = await browser.newPage({
        viewport: { width: 1280, height: 720 },
      });
      const htmlUrl = `file://${path.resolve(htmlPath)}`;
      await page.goto(htmlUrl, { waitUntil: "networkidle" });

      const slideData = await extractSlideContent(page);
      const slide = pptx.addSlide();

      if (slideData.background) {
        applyBackground(slide, slideData.background);
      }

      for (const element of slideData.elements) {
        addElement(slide, element, pptx);
      }

      await page.close();
      console.log(`Processed: ${htmlPath}`);
    }

    await pptx.writeFile({ fileName: outputPath });
    console.log(`Created: ${outputPath}`);
  } finally {
    await browser.close();
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log("Usage: node convert_html.js <input.html> <output.pptx>");
    console.log(
      "       node convert_html.js --multi <html1.html> <html2.html> ... <output.pptx>"
    );
    process.exit(1);
  }

  if (args[0] === "--multi") {
    const outputPath = args[args.length - 1];
    const htmlPaths = args.slice(1, -1);

    convertMultipleHtmlToPptx(htmlPaths, outputPath).catch((err) => {
      console.error("Error:", err.message);
      process.exit(1);
    });
  } else {
    const [inputPath, outputPath] = args;

    convertHtmlToPptx(inputPath, outputPath).catch((err) => {
      console.error("Error:", err.message);
      process.exit(1);
    });
  }
}

module.exports = {
  convertHtmlToPptx,
  convertMultipleHtmlToPptx,
  extractSlideContent,
};
