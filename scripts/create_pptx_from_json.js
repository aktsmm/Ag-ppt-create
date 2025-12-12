// -*- coding: utf-8 -*-
// Create PPTX from content JSON using pptxgenjs
// Usage: node create_pptx_from_json.js <content.json> <output.pptx>

const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

// Parse arguments
const inputJson = process.argv[2] || "output_manifest/content.json";
const outputPptx = process.argv[3] || "output_ppt/output.pptx";

// Load content JSON
const content = JSON.parse(fs.readFileSync(inputJson, "utf-8"));

// Create presentation
const pptx = new pptxgen();
pptx.layout = "LAYOUT_16x9";
pptx.author = "pptxgenjs";
pptx.title = content.title || "Presentation";

// Color palette (GitHub theme)
const COLORS = {
  github_dark: "24292e",
  github_blue: "0366d6",
  jupyter_orange: "f37626",
  white: "ffffff",
  light_gray: "f6f8fa",
  text_dark: "24292e",
  text_muted: "586069",
  green: "28a745",
  purple: "6f42c1",
};

// Helper: Add title slide
function addTitleSlide(slideData) {
  const slide = pptx.addSlide();

  // Background gradient simulation with solid color
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: "100%",
    h: "100%",
    fill: { color: COLORS.github_dark },
  });

  // Accent bar at bottom
  slide.addShape("rect", {
    x: 0,
    y: "96%",
    w: "100%",
    h: "4%",
    fill: { type: "solid", color: COLORS.github_blue },
  });

  // Title text
  const title = slideData.title_ja || slideData.title || "";
  slide.addText(title, {
    x: 0.5,
    y: 2.2,
    w: 9.0,
    h: 1.5,
    fontSize: 40,
    bold: true,
    color: COLORS.white,
    align: "center",
    valign: "middle",
  });

  // Subtitle
  const subtitle = slideData.subtitle_ja || slideData.subtitle || "";
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5,
      y: 3.8,
      w: 9.0,
      h: 0.8,
      fontSize: 24,
      color: "79b8ff",
      align: "center",
      valign: "top",
    });
  }
}

// Helper: Add content slide
function addContentSlide(slideData) {
  const slide = pptx.addSlide();

  // Header bar
  const slideType = slideData.type || "content";
  let headerColor = COLORS.github_blue;
  if (slideType === "jupyter" || slideType === "handson") {
    headerColor = COLORS.jupyter_orange;
  } else if (slideType === "copilot") {
    headerColor = COLORS.purple;
  } else if (slideType === "setup") {
    headerColor = COLORS.green;
  }

  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: "100%",
    h: 1.0,
    fill: { color: headerColor },
  });

  // Title
  const title = slideData.title_ja || slideData.title || "";
  slide.addText(title, {
    x: 0.4,
    y: 0.2,
    w: 9.2,
    h: 0.7,
    fontSize: 28,
    bold: true,
    color: COLORS.white,
  });

  // Content bullets - support multiple field names
  const items =
    slideData.content_ja || slideData.content || slideData.items || [];
  if (items.length > 0) {
    const bulletItems = items.map((item) => {
      if (typeof item === "string") {
        return { text: item, options: { bullet: { type: "bullet" } } };
      } else if (item.text) {
        return { text: item.text, options: { bullet: { type: "bullet" } } };
      } else if (item.stat && item.description) {
        return {
          text: `${item.stat} - ${item.description}`,
          options: { bullet: { type: "bullet" } },
        };
      } else if (item.label) {
        return {
          text: `${item.label} ${item.text || ""}`,
          options: { bullet: { type: "bullet" } },
        };
      }
      return {
        text: JSON.stringify(item),
        options: { bullet: { type: "bullet" } },
      };
    });

    slide.addText(bulletItems, {
      x: 0.5,
      y: 1.3,
      w: 9.0,
      h: 4.0,
      fontSize: 20,
      color: COLORS.text_dark,
      lineSpacing: 32,
      valign: "top",
    });
  }
}

// Helper: Add summary slide
function addSummarySlide(slideData) {
  const slide = pptx.addSlide();

  // Dark background
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: "100%",
    h: "100%",
    fill: { color: COLORS.github_dark },
  });

  // Top accent bar
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: "100%",
    h: 0.1,
    fill: { type: "solid", color: COLORS.github_blue },
  });

  // Title
  const title = slideData.title_ja || slideData.title || "まとめ";
  slide.addText(title, {
    x: 0.4,
    y: 0.3,
    w: 9.2,
    h: 0.8,
    fontSize: 32,
    bold: true,
    color: COLORS.white,
  });

  // Content bullets - support multiple field names
  const items =
    slideData.content_ja || slideData.content || slideData.items || [];
  if (items.length > 0) {
    const bulletItems = items.map((item) => {
      const text =
        typeof item === "string" ? item : item.text || JSON.stringify(item);
      return { text: "✅ " + text, options: {} };
    });

    slide.addText(bulletItems, {
      x: 0.5,
      y: 1.3,
      w: 9.0,
      h: 3.5,
      fontSize: 20,
      color: COLORS.white,
      lineSpacing: 32,
      valign: "top",
    });
  }

  // CTA
  if (slideData.cta) {
    slide.addText(slideData.cta, {
      x: 0.5,
      y: 4.8,
      w: 9.0,
      h: 0.5,
      fontSize: 18,
      color: "79b8ff",
      align: "center",
    });
  }
}

// Process slides
console.log(`Loading: ${inputJson}`);
console.log(`Creating ${content.slides.length} slides...`);

content.slides.forEach((slideData, idx) => {
  const slideType = slideData.type || "content";

  if (slideType === "title" || slideType === "closing") {
    addTitleSlide(slideData);
  } else if (slideType === "summary" || slideType === "closing") {
    addSummarySlide(slideData);
  } else {
    addContentSlide(slideData);
  }

  console.log(
    `  Slide ${idx + 1}: ${(
      slideData.title_ja ||
      slideData.title ||
      ""
    ).substring(0, 30)}...`
  );
});

// Ensure output directory exists
const outputDir = path.dirname(outputPptx);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Save PPTX
pptx
  .writeFile({ fileName: outputPptx })
  .then(() => {
    console.log(`\n✅ Created: ${outputPptx}`);
    console.log(`   Total slides: ${content.slides.length}`);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
