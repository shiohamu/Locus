import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { generateStaticHTML } from "../apps/api/src/services/export/static-html.js";

/**
 * 公開サイトをデプロイ用ディレクトリに生成
 */
async function deployPublicSite() {
  const outputDir = process.env.PUBLIC_SITE_OUTPUT_DIR || "./public-site";

  console.log("Generating static HTML files...");

  try {
    // 出力ディレクトリを作成
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // 静的HTMLを生成
    const htmlFiles = await generateStaticHTML();

    // ファイルを書き込み
    for (const [filename, content] of htmlFiles) {
      const filePath = join(outputDir, filename);
      writeFileSync(filePath, content, "utf-8");
      console.log(`Generated: ${filename}`);
    }

    console.log("\n✅ Static site generated successfully!");
    console.log(`📁 Output directory: ${outputDir}`);
    console.log("\n📝 Next steps:");
    console.log(`   1. Review the generated files in ${outputDir}`);
    console.log("   2. Deploy to your hosting service:");
    console.log("      - GitHub Pages: Push to gh-pages branch");
    console.log(`      - Netlify: Drag and drop ${outputDir} folder`);
    console.log(`      - Vercel: Run 'vercel --cwd ${outputDir}'`);
    console.log(`      - Any static hosting: Upload ${outputDir} contents`);
  } catch (error) {
    console.error("❌ Failed to generate static site:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  deployPublicSite();
}
