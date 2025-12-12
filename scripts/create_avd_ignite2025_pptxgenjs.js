/**
 * AVD Ignite 2025 - pptxgenjs version
 * Generate PPTX from Qiita article content
 *
 * Usage: node scripts/create_avd_ignite2025_pptxgenjs.js
 */

const PptxGenJS = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

// Color palette - Azure theme
const COLORS = {
  primary: "0078D4", // Azure blue
  secondary: "50E6FF", // Light azure
  dark: "1A1A1A", // Near black
  white: "FFFFFF",
  gray: "737373",
  lightGray: "F5F5F5",
  accent: "00BCF2", // Bright cyan
  warning: "FFB900", // Amber
  success: "00B294", // Teal
};

// Font settings
const FONTS = {
  title: "Segoe UI",
  body: "Meiryo UI",
  code: "Consolas",
};

function createPresentation() {
  const pptx = new PptxGenJS();

  // Set presentation properties
  pptx.author = "@yuyanz";
  pptx.title = "Microsoft Ignite 2025: Azure Virtual Desktop まとめ";
  pptx.subject = "AVD Updates from Microsoft Ignite 2025";
  pptx.company = "Qiita";
  pptx.layout = "LAYOUT_WIDE"; // 16:9

  // Define master slide
  pptx.defineSlideMaster({
    title: "AZURE_MASTER",
    background: { color: COLORS.white },
    objects: [
      // Bottom accent bar
      {
        rect: {
          x: 0,
          y: 7.0,
          w: "100%",
          h: 0.5,
          fill: { color: COLORS.primary },
        },
      },
      // Top accent line
      {
        rect: {
          x: 0,
          y: 0,
          w: "100%",
          h: 0.05,
          fill: { color: COLORS.secondary },
        },
      },
    ],
  });

  // Slide 1: Title
  createTitleSlide(pptx);

  // Slide 2: Agenda
  createAgendaSlide(pptx);

  // Slide 3: Arc対応VM
  createArcVMSlide(pptx);

  // Slide 4: ゲストID
  createGuestIDSlide(pptx);

  // Slide 5: エフェメラルOSディスク
  createEphemeralDiskSlide(pptx);

  // Slide 6: RDPマルチパス
  createRDPMultipathSlide(pptx);

  // Slide 7: まとめ
  createClosingSlide(pptx);

  return pptx;
}

function createTitleSlide(pptx) {
  const slide = pptx.addSlide();

  // Background gradient effect
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: "100%",
    h: "100%",
    fill: { color: COLORS.primary },
  });

  // Decorative element
  slide.addShape("rect", {
    x: 0,
    y: 5.5,
    w: "100%",
    h: 2,
    fill: { color: "005A9E" }, // Darker blue
  });

  // Main title
  slide.addText("Microsoft Ignite 2025", {
    x: 0.5,
    y: 1.5,
    w: "90%",
    h: 1.2,
    fontSize: 48,
    fontFace: FONTS.title,
    color: COLORS.white,
    bold: true,
  });

  // Subtitle
  slide.addText("Azure Virtual Desktop まとめ", {
    x: 0.5,
    y: 2.8,
    w: "90%",
    h: 0.8,
    fontSize: 36,
    fontFace: FONTS.body,
    color: COLORS.secondary,
  });

  // Description
  slide.addText("AVD の最新アップデートと新機能", {
    x: 0.5,
    y: 4.0,
    w: "90%",
    h: 0.6,
    fontSize: 24,
    fontFace: FONTS.body,
    color: COLORS.white,
  });

  // Author and date
  slide.addText("@yuyanz | 2025年12月", {
    x: 0.5,
    y: 5.8,
    w: "90%",
    h: 0.5,
    fontSize: 18,
    fontFace: FONTS.body,
    color: COLORS.white,
  });
}

function createAgendaSlide(pptx) {
  const slide = pptx.addSlide({ masterName: "AZURE_MASTER" });

  // Title
  slide.addText("本日のアジェンダ", {
    x: 0.5,
    y: 0.3,
    w: "90%",
    h: 0.8,
    fontSize: 36,
    fontFace: FONTS.title,
    color: COLORS.primary,
    bold: true,
  });

  // Agenda items
  const agendaItems = [
    {
      num: "01",
      text: "Arc対応VMをセッションホストに追加可能に",
      desc: "ハイブリッドデプロイメントの拡張",
    },
    { num: "02", text: "ゲストIDサポート", desc: "外部ユーザーのAVD認証対応" },
    {
      num: "03",
      text: "エフェメラルOSディスク",
      desc: "コスト最適化と動的スケーリング",
    },
    {
      num: "04",
      text: "RDPマルチパスの完全ロールアウト",
      desc: "接続品質の向上",
    },
  ];

  agendaItems.forEach((item, idx) => {
    const y = 1.4 + idx * 1.35;

    // Number circle
    slide.addShape("ellipse", {
      x: 0.5,
      y: y,
      w: 0.7,
      h: 0.7,
      fill: { color: COLORS.primary },
    });

    slide.addText(item.num, {
      x: 0.5,
      y: y + 0.15,
      w: 0.7,
      h: 0.4,
      fontSize: 18,
      fontFace: FONTS.title,
      color: COLORS.white,
      align: "center",
      bold: true,
    });

    // Main text
    slide.addText(item.text, {
      x: 1.4,
      y: y,
      w: 10,
      h: 0.45,
      fontSize: 22,
      fontFace: FONTS.body,
      color: COLORS.dark,
      bold: true,
    });

    // Description
    slide.addText(item.desc, {
      x: 1.4,
      y: y + 0.45,
      w: 10,
      h: 0.35,
      fontSize: 16,
      fontFace: FONTS.body,
      color: COLORS.gray,
    });
  });
}

function createArcVMSlide(pptx) {
  const slide = pptx.addSlide({ masterName: "AZURE_MASTER" });

  // Title
  slide.addText("1. Arc対応VMをセッションホストに追加", {
    x: 0.5,
    y: 0.3,
    w: "90%",
    h: 0.8,
    fontSize: 32,
    fontFace: FONTS.title,
    color: COLORS.primary,
    bold: true,
  });

  // Content
  const bullets = [
    { text: "ハイブリッドデプロイメントの拡張", level: 0 },
    { text: "従来: Azure Local のみ対応", level: 1 },
    { text: "新規対応プラットフォーム:", level: 0 },
    { text: "Microsoft Hyper-V", level: 1 },
    { text: "Nutanix AHV", level: 1 },
    { text: "VMware vSphere", level: 1 },
    { text: "物理 Windows サーバー", level: 1 },
    { text: "オンプレとクラウドの中間地点として活用可能", level: 0 },
  ];

  addBulletList(slide, bullets, 0.5, 1.3, 12);
}

function createGuestIDSlide(pptx) {
  const slide = pptx.addSlide({ masterName: "AZURE_MASTER" });

  // Title
  slide.addText("2. ゲストIDサポート", {
    x: 0.5,
    y: 0.3,
    w: "90%",
    h: 0.8,
    fontSize: 32,
    fontFace: FONTS.title,
    color: COLORS.primary,
    bold: true,
  });

  // Main content
  const bullets = [
    { text: "外部ユーザーの AVD 認証が可能に", level: 0 },
    { text: "Entra ID でゲストユーザーを招待・管理", level: 1 },
    { text: "組織の合併などのシーンで便利", level: 0 },
  ];

  addBulletList(slide, bullets, 0.5, 1.3, 5.5);

  // Warning box
  slide.addShape("roundRect", {
    x: 0.5,
    y: 3.5,
    w: 12,
    h: 2.8,
    fill: { color: "FFF3CD" },
    line: { color: COLORS.warning, pt: 2 },
  });

  slide.addText("⚠️ 要件・制限事項", {
    x: 0.7,
    y: 3.6,
    w: 11.5,
    h: 0.5,
    fontSize: 18,
    fontFace: FONTS.body,
    color: COLORS.dark,
    bold: true,
  });

  const requirements = [
    "• Entra Join が必須",
    "• SSO も必須",
    "• FSlogix はプレビュー段階",
    "• Kerberos/NTLM オンプレ認証は不可",
  ];

  slide.addText(requirements.join("\n"), {
    x: 0.7,
    y: 4.1,
    w: 11.5,
    h: 2,
    fontSize: 16,
    fontFace: FONTS.body,
    color: COLORS.dark,
    valign: "top",
  });
}

function createEphemeralDiskSlide(pptx) {
  const slide = pptx.addSlide({ masterName: "AZURE_MASTER" });

  // Title
  slide.addText("3. エフェメラルOSディスク", {
    x: 0.5,
    y: 0.3,
    w: "90%",
    h: 0.8,
    fontSize: 32,
    fontFace: FONTS.title,
    color: COLORS.primary,
    bold: true,
  });

  // Content
  const bullets = [
    { text: "ディスクコストを 0 にできる VM ディスク", level: 0 },
    { text: "デメリット: VM の割り当て解除（課金停止）不可", level: 0 },
    { text: "解決策: 動的自動スケーリング（プレビュー）", level: 0 },
    { text: "セッションホストを自動的に作成/削除", level: 1 },
    { text: "オンデマンドデプロイとも呼ばれる", level: 1 },
    { text: "ディスクコスト + VM 代金を同時に節約", level: 0 },
    { text: "前提: セッションホスト構成が必要", level: 1 },
  ];

  addBulletList(slide, bullets, 0.5, 1.3, 12);
}

function createRDPMultipathSlide(pptx) {
  const slide = pptx.addSlide({ masterName: "AZURE_MASTER" });

  // Title
  slide.addText("4. RDPマルチパスの完全ロールアウト", {
    x: 0.5,
    y: 0.3,
    w: "90%",
    h: 0.8,
    fontSize: 32,
    fontFace: FONTS.title,
    color: COLORS.primary,
    bold: true,
  });

  // Content
  const bullets = [
    { text: "複数経路での接続品質向上", level: 0 },
    { text: "冗長化だけでなく最適経路を自動選択", level: 1 },
    { text: "MTTF（平均故障間隔）の改善を実現", level: 0 },
    { text: "接続経路に選択肢がある場合に効果的", level: 0 },
    { text: "正式版としてロールアウト完了", level: 0 },
  ];

  addBulletList(slide, bullets, 0.5, 1.3, 12);

  // Highlight box
  slide.addShape("roundRect", {
    x: 0.5,
    y: 4.5,
    w: 12,
    h: 1.5,
    fill: { color: "E6F4EA" },
    line: { color: COLORS.success, pt: 2 },
  });

  slide.addText("✅ 正式版 (GA) としてロールアウト完了！", {
    x: 0.7,
    y: 4.9,
    w: 11.5,
    h: 0.7,
    fontSize: 20,
    fontFace: FONTS.body,
    color: "0D652D",
    bold: true,
    align: "center",
  });
}

function createClosingSlide(pptx) {
  const slide = pptx.addSlide();

  // Background
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: "100%",
    h: "100%",
    fill: { color: COLORS.primary },
  });

  // Title
  slide.addText("まとめ・参考リンク", {
    x: 0.5,
    y: 0.5,
    w: "90%",
    h: 0.8,
    fontSize: 36,
    fontFace: FONTS.title,
    color: COLORS.white,
    bold: true,
  });

  // Session info
  slide.addText("Microsoft Ignite 2025 セッション", {
    x: 0.5,
    y: 1.5,
    w: "90%",
    h: 0.5,
    fontSize: 22,
    fontFace: FONTS.body,
    color: COLORS.secondary,
    bold: true,
  });

  slide.addText("BRK339: What's new & what's next in Azure Virtual Desktop", {
    x: 0.7,
    y: 2.0,
    w: "85%",
    h: 0.4,
    fontSize: 18,
    fontFace: FONTS.body,
    color: COLORS.white,
  });

  slide.addText("🔗 ignite.microsoft.com/sessions/BRK339", {
    x: 0.7,
    y: 2.5,
    w: "85%",
    h: 0.4,
    fontSize: 16,
    fontFace: FONTS.code,
    color: COLORS.secondary,
  });

  // Reference links
  slide.addText("参考記事・ドキュメント", {
    x: 0.5,
    y: 3.3,
    w: "90%",
    h: 0.5,
    fontSize: 22,
    fontFace: FONTS.body,
    color: COLORS.secondary,
    bold: true,
  });

  const links = [
    "📄 docs.microsoft.com/azure/virtual-desktop/",
    "📄 cloudou.net/azure-virtual-desktop/",
    "📄 qiita.com/yuyanz (元記事)",
  ];

  links.forEach((link, idx) => {
    slide.addText(link, {
      x: 0.7,
      y: 3.9 + idx * 0.5,
      w: "85%",
      h: 0.4,
      fontSize: 16,
      fontFace: FONTS.body,
      color: COLORS.white,
    });
  });

  // Footer
  slide.addText("Thank you!", {
    x: 0.5,
    y: 6.2,
    w: "90%",
    h: 0.6,
    fontSize: 28,
    fontFace: FONTS.title,
    color: COLORS.white,
    align: "center",
    bold: true,
  });
}

function addBulletList(slide, bullets, x, y, width) {
  let currentY = y;

  bullets.forEach((item) => {
    const indent = item.level === 0 ? 0 : 0.5;
    const bullet = item.level === 0 ? "●" : "○";
    const fontSize = item.level === 0 ? 20 : 18;
    const color = item.level === 0 ? COLORS.dark : COLORS.gray;

    slide.addText(`${bullet}  ${item.text}`, {
      x: x + indent,
      y: currentY,
      w: width - indent,
      h: 0.5,
      fontSize: fontSize,
      fontFace: FONTS.body,
      color: color,
    });

    currentY += 0.55;
  });
}

// Main execution
async function main() {
  console.log("Creating AVD Ignite 2025 presentation with pptxgenjs...\n");

  const pptx = createPresentation();

  const outputPath = path.join(
    __dirname,
    "..",
    "output_ppt",
    "20251212_avd_ignite2025_blog_pptxgenjs.pptx"
  );

  await pptx.writeFile({ fileName: outputPath });

  console.log(`✅ Created: ${outputPath}`);
  console.log("   Total slides: 7");
}

main().catch(console.error);
