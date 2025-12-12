/**
 * create_pptx.js - Create PowerPoint from JSON content using pptxgenjs
 *
 * Usage:
 *   node scripts/create_pptx.js <content.json> <output.pptx>
 *
 * Features:
 *   - Creates clean, professional slides from JSON
 *   - Supports images (local path or URL)
 *   - Image positions: right, bottom, full
 *   - Great for code-heavy presentations
 *
 * Author: aktsmm
 * License: CC BY-NC 4.0
 */

const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

// Design constants
const COLORS = {
  purple: "5B5FC7", // Microsoft Purple
  darkGray: "333333",
  white: "FFFFFF",
  lightGray: "F5F5F5",
};

const FONTS = {
  title: "Yu Gothic UI",
  body: "Yu Gothic UI",
};

/**
 * Download image from URL and return as base64
 * @param {string} url - Image URL
 * @returns {Promise<string>} Base64 encoded image data
 */
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    console.log(`  📥 Downloading: ${url.substring(0, 50)}...`);

    protocol
      .get(url, (response) => {
        // Handle redirects
        if (
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          return downloadImage(response.headers.location)
            .then(resolve)
            .catch(reject);
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }

        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const buffer = Buffer.concat(chunks);
          const base64 = buffer.toString("base64");
          const contentType = response.headers["content-type"] || "image/png";
          resolve(`data:${contentType};base64,${base64}`);
        });
        response.on("error", reject);
      })
      .on("error", reject);
  });
}

/**
 * Resolve image path - local file or URL
 * @param {Object} imageConfig - Image configuration
 * @param {string} basePath - Base path for relative paths
 * @returns {Promise<string|null>} Image path or data URI
 */
async function resolveImage(imageConfig, basePath) {
  if (imageConfig.url) {
    try {
      return await downloadImage(imageConfig.url);
    } catch (err) {
      console.warn(`  ⚠️  Failed to download image: ${err.message}`);
      return null;
    }
  }

  if (imageConfig.path) {
    const candidates = [
      path.resolve(basePath, "..", imageConfig.path),
      path.resolve(imageConfig.path),
      path.resolve(basePath, imageConfig.path),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
    console.warn(`  ⚠️  Image not found: ${imageConfig.path}`);
  }

  return null;
}

/**
 * Add title slide
 * @param {pptxgen} pptx - Presentation object
 * @param {Object} slideData - Slide data
 */
function addTitleSlide(pptx, slideData) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.purple };

  // Title
  slide.addText(slideData.title || "", {
    x: 0.5,
    y: 2.2,
    w: "92%",
    h: 1.5,
    fontSize: 44,
    fontFace: FONTS.title,
    color: COLORS.white,
    bold: true,
    align: "center",
    valign: "middle",
  });

  // Subtitle
  if (slideData.subtitle) {
    slide.addText(slideData.subtitle, {
      x: 0.5,
      y: 3.8,
      w: "92%",
      h: 0.8,
      fontSize: 24,
      fontFace: FONTS.body,
      color: COLORS.white,
      align: "center",
    });
  }

  return slide;
}

/**
 * Add content slide with optional image
 * @param {pptxgen} pptx - Presentation object
 * @param {Object} slideData - Slide data
 * @param {string} basePath - Base path for images
 */
async function addContentSlide(pptx, slideData, basePath) {
  const slide = pptx.addSlide();

  // Title bar
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: "100%",
    h: 1.0,
    fill: { color: COLORS.purple },
  });

  // Title text
  slide.addText(slideData.title || "", {
    x: 0.5,
    y: 0.2,
    w: "92%",
    h: 0.7,
    fontSize: 28,
    fontFace: FONTS.title,
    color: COLORS.white,
    bold: true,
  });

  // Default content area
  let contentArea = { x: 0.5, y: 1.3, w: 12.3, h: 5.0 };

  // Handle image if present
  if (slideData.image) {
    const imagePath = await resolveImage(slideData.image, basePath);
    if (imagePath) {
      const position = slideData.image.position || "right";
      const widthPct = slideData.image.width_percent || 45;
      const heightPct = slideData.image.height_percent || 50;

      try {
        // Check if imagePath is a data URI (from URL download)
        const isDataUri = imagePath.startsWith("data:");
        const imageOpts = isDataUri ? { data: imagePath } : { path: imagePath };

        if (position === "full") {
          // Full slide image
          slide.addImage({
            ...imageOpts,
            x: 0.5,
            y: 1.3,
            w: 12.3,
            h: 5.5,
          });
          return slide; // No text content for full image
        } else if (position === "right") {
          // Image on right
          const imgW = (13.333 * widthPct) / 100;
          const imgH = 5.0; // Fixed height for right-aligned images
          slide.addImage({
            ...imageOpts,
            x: 13.333 - 0.5 - imgW,
            y: 1.5,
            w: imgW,
            h: imgH,
          });
          contentArea.w = (13.333 * (100 - widthPct - 5)) / 100;
        } else if (position === "bottom") {
          // Image at bottom
          const imgH = (7.5 * heightPct) / 100;
          slide.addImage({
            ...imageOpts,
            x: 0.5,
            y: 7.5 - 0.5 - imgH,
            w: 12.3,
            h: imgH,
          });
          contentArea.h = (7.5 * (100 - heightPct - 20)) / 100;
        }
      } catch (err) {
        console.warn(`  ⚠️  Failed to add image: ${err.message}`);
      }
    }
  }

  // Content bullets
  const items = slideData.items || slideData.content || [];
  if (items.length > 0) {
    const textContent = items.map((item) => {
      if (typeof item === "object") {
        return { text: item.text || String(item), options: { bullet: true } };
      }
      return { text: String(item), options: { bullet: true } };
    });

    slide.addText(textContent, {
      x: contentArea.x,
      y: contentArea.y,
      w: contentArea.w,
      h: contentArea.h,
      fontSize: 20,
      fontFace: FONTS.body,
      color: COLORS.darkGray,
      valign: "top",
      paraSpaceAfter: 8,
    });
  }

  return slide;
}

/**
 * Add section slide
 * @param {pptxgen} pptx - Presentation object
 * @param {Object} slideData - Slide data
 */
function addSectionSlide(pptx, slideData) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.purple };

  slide.addText(slideData.title || "", {
    x: 0.5,
    y: 2.5,
    w: "92%",
    h: 1.2,
    fontSize: 40,
    fontFace: FONTS.title,
    color: COLORS.white,
    bold: true,
    align: "center",
    valign: "middle",
  });

  if (slideData.subtitle) {
    slide.addText(slideData.subtitle, {
      x: 0.5,
      y: 3.8,
      w: "92%",
      h: 0.6,
      fontSize: 22,
      fontFace: FONTS.body,
      color: COLORS.white,
      align: "center",
    });
  }

  return slide;
}

/**
 * Validate and fix content issues
 * @param {Array} slides - Slides array
 * @returns {Array} Fixed slides array
 */
function validateAndFixContent(slides) {
  let fixedCount = 0;

  slides.forEach((slide, i) => {
    const type = slide.type || "content";
    const items = slide.items || slide.content || [];
    const title = slide.title || `Slide ${i + 1}`;

    // closing type with items → convert to content
    if (type === "closing" && items.length > 1) {
      console.log(
        `  ⚠️  Warning: Slide ${i + 1} '${title.substring(
          0,
          30
        )}...' has type='closing' with ${items.length} items`
      );
      console.log(`      → Auto-converting to type='content'`);
      slide.type = "content";
      fixedCount++;
    }
  });

  if (fixedCount > 0) {
    console.log(`  ✅ Auto-fixed ${fixedCount} slide(s)\n`);
  }

  return slides;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(
      "Usage: node scripts/create_pptx.js <content.json> <output.pptx>"
    );
    console.log("");
    console.log("Example:");
    console.log(
      "  node scripts/create_pptx.js output_manifest/content.json output_ppt/result.pptx"
    );
    process.exit(1);
  }

  const [inputJson, outputPptx] = args;

  // Load content
  console.log(`\nLoading: ${inputJson}`);
  const content = JSON.parse(fs.readFileSync(inputJson, "utf-8"));
  let slides = content.slides || content;
  if (!Array.isArray(slides)) {
    slides = [slides];
  }

  // Validate content
  console.log("🔍 Validating content...");
  slides = validateAndFixContent(slides);

  // Create presentation
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "CUSTOM", width: 13.333, height: 7.5 }); // 16:9
  pptx.layout = "CUSTOM";

  console.log(`Creating ${slides.length} slides...\n`);

  const basePath = path.dirname(path.resolve(inputJson));

  for (let i = 0; i < slides.length; i++) {
    const slideData = slides[i];
    const type = slideData.type || "content";
    const title = slideData.title || `Slide ${i + 1}`;
    const hasImage = slideData.image ? " 📷" : "";

    console.log(
      `  Slide ${i + 1}: ${title.substring(0, 40)}... [${type}]${hasImage}`
    );

    switch (type) {
      case "title":
      case "closing":
        addTitleSlide(pptx, slideData);
        break;
      case "section":
      case "section_title":
        addSectionSlide(pptx, slideData);
        break;
      default:
        await addContentSlide(pptx, slideData, basePath);
    }
  }

  // Ensure output directory exists
  const outputDir = path.dirname(outputPptx);
  if (outputDir && !fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save
  await pptx.writeFile({ fileName: outputPptx });
  console.log(`\n✅ Created: ${outputPptx}`);
  console.log(`   Total slides: ${slides.length}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
