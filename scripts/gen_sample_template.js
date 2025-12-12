/**
 * Generate a sample template PPTX for testing
 */
const pptxgen = require("pptxgenjs");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_16x9";
pptx.title = "Sample Template";

// Slide 0: Title slide
let slide0 = pptx.addSlide();
slide0.addText("Title Slide", {
  x: 1,
  y: 1.5,
  w: 8,
  h: 1,
  fontSize: 36,
  bold: true,
  color: "333333",
});
slide0.addText("Subtitle goes here", {
  x: 1,
  y: 2.6,
  w: 8,
  h: 0.5,
  fontSize: 18,
  color: "666666",
});

// Slide 1: Bullet slide
let slide1 = pptx.addSlide();
slide1.addText("Agenda", {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 0.8,
  fontSize: 28,
  bold: true,
  color: "1f2a44",
});
slide1.addText(
  [
    { text: "First item", options: { bullet: true, fontSize: 18 } },
    { text: "Second item", options: { bullet: true, fontSize: 18 } },
    { text: "Third item", options: { bullet: true, fontSize: 18 } },
  ],
  { x: 0.5, y: 1.5, w: 9, h: 2 }
);

// Slide 2: Content slide
let slide2 = pptx.addSlide();
slide2.addText("Key Metrics", {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 0.8,
  fontSize: 28,
  bold: true,
  color: "1f2a44",
});
slide2.addText("Revenue growth: 15%", {
  x: 0.5,
  y: 1.5,
  w: 4,
  h: 0.5,
  fontSize: 16,
});
slide2.addText("Customer satisfaction: 92%", {
  x: 0.5,
  y: 2.1,
  w: 4,
  h: 0.5,
  fontSize: 16,
});

// Slide 3: Closing slide
let slide3 = pptx.addSlide();
slide3.addText("Thank You", {
  x: 1,
  y: 2,
  w: 8,
  h: 1,
  fontSize: 36,
  bold: true,
  color: "333333",
  align: "center",
});
slide3.addText("Questions?", {
  x: 1,
  y: 3.2,
  w: 8,
  h: 0.5,
  fontSize: 18,
  color: "666666",
  align: "center",
});

pptx
  .writeFile("templates/sample.pptx")
  .then(() => {
    console.log("Created: templates/sample.pptx");
  })
  .catch((err) => {
    console.error("Error:", err);
  });
