/**
 * generate_vnet_tap_pptx.js - Generate VNet TAP presentation with pptxgenjs
 * 
 * Usage:
 *   node generate_vnet_tap_pptx.js
 * 
 * Output:
 *   output_ppt/20251212_azure_vnet_tap_blog_D.pptx
 */

const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");

// Configuration
const OUTPUT_PATH = "output_ppt/20251212_azure_vnet_tap_blog_D.pptx";
const IMAGE_DIR = "images/20251212_azure_vnet_tap_blog";

// Color scheme (Azure-inspired)
const COLORS = {
  primary: "0078D4",      // Azure Blue
  secondary: "50E6FF",    // Light Azure
  dark: "243A5E",         // Dark Blue
  white: "FFFFFF",
  gray: "666666",
  lightGray: "F3F3F3",
  codeBackground: "1E1E1E",  // VS Code dark
  codeText: "D4D4D4"
};

// Slide master definitions
function defineMasters(pptx) {
  // Title slide master
  pptx.defineSlideMaster({
    title: "TITLE_SLIDE",
    background: { color: COLORS.primary },
    objects: [
      { rect: { x: 0, y: 5.5, w: "100%", h: 2, fill: { color: COLORS.dark } } }
    ]
  });

  // Content slide master
  pptx.defineSlideMaster({
    title: "CONTENT_SLIDE",
    background: { color: COLORS.white },
    objects: [
      { rect: { x: 0, y: 0, w: "100%", h: 0.8, fill: { color: COLORS.primary } } },
      { rect: { x: 0, y: 6.9, w: "100%", h: 0.6, fill: { color: COLORS.lightGray } } }
    ]
  });

  // Section slide master
  pptx.defineSlideMaster({
    title: "SECTION_SLIDE",
    background: { color: COLORS.dark }
  });

  // Photo slide master
  pptx.defineSlideMaster({
    title: "PHOTO_SLIDE",
    background: { color: COLORS.white },
    objects: [
      { rect: { x: 0, y: 0, w: "100%", h: 0.8, fill: { color: COLORS.primary } } }
    ]
  });
}

// Helper: Add title slide
function addTitleSlide(pptx, title, subtitle) {
  const slide = pptx.addSlide({ masterName: "TITLE_SLIDE" });
  
  slide.addText(title, {
    x: 0.5, y: 2.0, w: 12.33, h: 1.5,
    fontSize: 44, fontFace: "Segoe UI", bold: true,
    color: COLORS.white, align: "center"
  });
  
  slide.addText(subtitle, {
    x: 0.5, y: 5.7, w: 12.33, h: 0.8,
    fontSize: 20, fontFace: "Segoe UI",
    color: COLORS.white, align: "center"
  });
  
  return slide;
}

// Helper: Add content slide with bullets
function addContentSlide(pptx, title, items) {
  const slide = pptx.addSlide({ masterName: "CONTENT_SLIDE" });
  
  // Title
  slide.addText(title, {
    x: 0.5, y: 0.15, w: 12.33, h: 0.5,
    fontSize: 24, fontFace: "Segoe UI", bold: true,
    color: COLORS.white
  });
  
  // Build bullet list
  const bulletItems = [];
  items.forEach(item => {
    bulletItems.push({
      text: item.text,
      options: { fontSize: 18, color: COLORS.dark, bullet: { type: "bullet" } }
    });
    if (item.subItems && item.subItems.length > 0) {
      item.subItems.forEach(sub => {
        bulletItems.push({
          text: sub,
          options: { fontSize: 16, color: COLORS.gray, bullet: { type: "bullet", indent: 30 } }
        });
      });
    }
  });
  
  slide.addText(bulletItems, {
    x: 0.5, y: 1.0, w: 12.33, h: 5.5,
    fontFace: "Segoe UI", valign: "top"
  });
  
  return slide;
}

// Helper: Add code slide
function addCodeSlide(pptx, title, code, description) {
  const slide = pptx.addSlide({ masterName: "CONTENT_SLIDE" });
  
  // Title
  slide.addText(title, {
    x: 0.5, y: 0.15, w: 12.33, h: 0.5,
    fontSize: 24, fontFace: "Segoe UI", bold: true,
    color: COLORS.white
  });
  
  // Description
  if (description) {
    slide.addText(description, {
      x: 0.5, y: 1.0, w: 12.33, h: 0.5,
      fontSize: 16, fontFace: "Segoe UI",
      color: COLORS.gray
    });
  }
  
  // Code block
  slide.addText(code, {
    x: 0.5, y: description ? 1.6 : 1.0, w: 12.33, h: 4.5,
    fontSize: 14, fontFace: "Consolas",
    color: COLORS.codeText, fill: { color: COLORS.codeBackground },
    valign: "top"
  });
  
  return slide;
}

// Helper: Add photo slide
function addPhotoSlide(pptx, title, imagePath, caption) {
  const slide = pptx.addSlide({ masterName: "PHOTO_SLIDE" });
  
  // Title
  slide.addText(title, {
    x: 0.5, y: 0.15, w: 12.33, h: 0.5,
    fontSize: 24, fontFace: "Segoe UI", bold: true,
    color: COLORS.white
  });
  
  // Image
  const fullPath = path.resolve(imagePath);
  if (fs.existsSync(fullPath)) {
    slide.addImage({
      path: fullPath,
      x: 0.5, y: 1.0, w: 12.33, h: 5.0,
      sizing: { type: "contain", w: 12.33, h: 5.0 }
    });
  } else {
    slide.addText(`[Image not found: ${imagePath}]`, {
      x: 0.5, y: 3.0, w: 12.33, h: 1.0,
      fontSize: 14, color: COLORS.gray, align: "center"
    });
  }
  
  // Caption
  if (caption) {
    slide.addText(caption, {
      x: 0.5, y: 6.2, w: 12.33, h: 0.4,
      fontSize: 12, fontFace: "Segoe UI", color: COLORS.gray, align: "center"
    });
  }
  
  return slide;
}

// Helper: Add section slide
function addSectionSlide(pptx, title) {
  const slide = pptx.addSlide({ masterName: "SECTION_SLIDE" });
  
  slide.addText(title, {
    x: 0.5, y: 2.5, w: 12.33, h: 2.0,
    fontSize: 40, fontFace: "Segoe UI", bold: true,
    color: COLORS.white, align: "center", valign: "middle"
  });
  
  return slide;
}

// Helper: Add closing slide
function addClosingSlide(pptx, title, subtitle) {
  const slide = pptx.addSlide({ masterName: "TITLE_SLIDE" });
  
  slide.addText(title, {
    x: 0.5, y: 2.5, w: 12.33, h: 1.0,
    fontSize: 40, fontFace: "Segoe UI", bold: true,
    color: COLORS.white, align: "center"
  });
  
  slide.addText(subtitle, {
    x: 0.5, y: 5.7, w: 12.33, h: 0.8,
    fontSize: 18, fontFace: "Segoe UI",
    color: COLORS.white, align: "center"
  });
  
  return slide;
}

// Main function
async function main() {
  const pptx = new pptxgen();
  
  // Setup
  pptx.defineLayout({ name: "CUSTOM_16x9", width: 13.33, height: 7.5 });
  pptx.layout = "CUSTOM_16x9";
  pptx.title = "Azure Virtual Network TAP";
  pptx.author = "Isato-Hiyama";
  
  defineMasters(pptx);
  
  // Slide 1: Title
  addTitleSlide(pptx,
    "Azure Virtual Network TAP\nトラフィックミラーリング",
    "VM ネットワークトラフィックの監視・分析・冗長化"
  );
  
  // Slide 2: Agenda
  addContentSlide(pptx, "アジェンダ", [
    { text: "Virtual Network TAP 概要", subItems: [] },
    { text: "主な用途", subItems: [] },
    { text: "制限事項（公式＋検証結果）", subItems: [] },
    { text: "構成例と設定手順", subItems: [] },
    { text: "動作確認（tcpdump / Wireshark）", subItems: [] },
    { text: "VXLAN カプセル化の詳細", subItems: [] },
    { text: "冗長化の方法（ILB 連携）", subItems: [] },
    { text: "まとめ", subItems: [] }
  ]);
  
  // Slide 3: What is VNet TAP
  addContentSlide(pptx, "Azure Virtual Network TAP とは？", [
    { text: "トラフィックミラーリング機能", subItems: [
      "Azure VM のネットワークトラフィックを複製",
      "NVA (Network Virtual Appliance) に送信"
    ]},
    { text: "パブリックプレビュー中", subItems: [
      "Linux/Windows VM を NVA として利用可能",
      "パートナーソリューションと連携可能"
    ]},
    { text: "VXLAN (UDP 4789) でカプセル化して転送", subItems: [] }
  ]);
  
  // Slide 4: Use cases
  addContentSlide(pptx, "主な用途", [
    { text: "セキュリティ監視", subItems: ["ネットワークトラフィックの脅威検知", "不正アクセスの検出"] },
    { text: "トラブルシューティング", subItems: ["通信障害時のパケット解析", "レイヤー 3/4 の問題特定"] },
    { text: "パフォーマンス分析", subItems: ["レイテンシ・スループットの測定"] },
    { text: "コンプライアンス対応", subItems: ["監査ログ・通信記録の長期保持"] }
  ]);
  
  // Slide 5: Limitations (official)
  addContentSlide(pptx, "制限事項（公式）", [
    { text: "送信元の制約", subItems: ["VM の NIC のみ（VMSS、PaaS は不可）"] },
    { text: "宛先の制約", subItems: ["VM の NIC または Standard LB", "プライベートエンドポイントは不可"] },
    { text: "リージョン制限", subItems: ["Asia East / US West Central のみ", "VNet ピアリングは同一リージョンのみ"] },
    { text: "その他", subItems: ["暗号化 VNet 上の VM は送信元に指定不可", "送信元 VM 追加・削除時は最大 60 秒の切断"] }
  ]);
  
  // Slide 6: Limitations (findings)
  addContentSlide(pptx, "検証で気づいた制限事項", [
    { text: "UDR との非互換性", subItems: [
      "送信元に指定した VM では UDR が使えない",
      "TAP 対象から外すと UDR が有効になった"
    ]},
    { text: "NAT Gateway との制限", subItems: [
      "Egress パケットのみがミラーリングされる",
      "Ingress は取得できない"
    ]}
  ]);
  
  // Slide 7: Architecture diagram
  addPhotoSlide(pptx, "構成図", 
    `${IMAGE_DIR}/01_architecture.png`,
    "送信元 VM → VNet TAP → NVA でトラフィックをミラーリング"
  );
  
  // Slide 8: Setup code
  addCodeSlide(pptx, "設定手順", 
`# 参考ドキュメント
# https://learn.microsoft.com/azure/virtual-network/tutorial-virtual-network-tap-portal

# ポイント:
# 1. Portal から直接アクセス不可
# 2. MS Docs 内のリンクから機能を有効化
# 3. TAP リソースを作成
#    - 送信元: 監視対象 VM の NIC を指定
#    - 宛先: NVA の NIC または ILB を指定`,
    "※ ドキュメント内のリンクから Portal を開く必要があります"
  );
  
  // Slide 9: tcpdump command
  addCodeSlide(pptx, "動作確認: tcpdump でキャプチャ",
`# NVA 側でパケットキャプチャ開始
tcpdump -s0 -i any -n -w outfile-nva.pcap

# 送信元 VM から通信を発生
curl -v http://10.90.0.38

# 結果:
# *   Trying 10.90.0.38:80...
# * Connected to 10.90.0.38 (10.90.0.38) port 80
# > GET / HTTP/1.1
# > Host: 10.90.0.38
# < HTTP/1.1 200 OK
# < Server: Apache/2.4.58 (Ubuntu)`,
    "NVA (Ubuntu 24.04) で tcpdump を使用"
  );
  
  // Slide 10: VXLAN packet
  addPhotoSlide(pptx, "VXLAN パケット構造",
    `${IMAGE_DIR}/02_vxlan_packet.png`,
    "UDP 4789 でカプセル化、外側 IP ヘッダ + 内側 IP ヘッダの二重構造"
  );
  
  // Slide 11: VXLAN details
  addContentSlide(pptx, "VXLAN カプセル化の詳細", [
    { text: "UDP 4789 でカプセル化", subItems: ["VXLAN 標準ポートを使用"] },
    { text: "二重 IP ヘッダ構造", subItems: [
      "① 外側ヘッダ: ミラーリング転送用 (VM → NVA)",
      "② 内側ヘッダ: 実際の通信内容 (元パケット)"
    ]},
    { text: "データサイズの増加", subItems: ["カプセル化オーバーヘッド約 50 バイト"] }
  ]);
  
  // Slide 12: Packet comparison
  addPhotoSlide(pptx, "パケットサイズ比較",
    `${IMAGE_DIR}/03_packet_compare.png`,
    "左: 送信元 VM、右: NVA (VXLAN カプセル化によりサイズ増加)"
  );
  
  // Slide 13: Redundancy architecture
  addPhotoSlide(pptx, "冗長化構成（ILB 連携）",
    `${IMAGE_DIR}/04_redundancy_arch.png`,
    "Internal Load Balancer を使った NVA の冗長構成"
  );
  
  // Slide 14: Closing
  addClosingSlide(pptx,
    "まとめ",
    "Virtual Network TAP で VM トラフィックを簡単にミラーリング\nパートナーソリューションでセキュリティ監視・分析も可能"
  );
  
  // Save
  await pptx.writeFile({ fileName: OUTPUT_PATH });
  console.log(`Created: ${OUTPUT_PATH}`);
}

main().catch(console.error);
