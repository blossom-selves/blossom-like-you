import { defineConfig } from "vitepress";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { 
  GitChangelog, 
  GitChangelogMarkdownSection 
} from "@nolebase/vitepress-plugin-git-changelog/vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Function to extract first heading from markdown file
function extractFirstHeading(filePath: string): string {
  try {
    const content = readFileSync(filePath, "utf-8");
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : "";
  } catch {
    return "";
  }
}

// Function to get clean URL path from category name
function getCleanCategoryPath(category: string): string {
  return category
    .replace(/^\d+_/, "") // Remove number prefix like "1_"
    .replace(/_/g, "-"); // Replace underscores with hyphens for URL-friendly format
}

// Function to get clean file name without number prefixes
function getCleanFileName(fileName: string): string {
  return fileName
    .replace(/^\d+_\d+_/, "") // Remove patterns like "1_1_"
    .replace(/^\d+_/, "") // Remove patterns like "1_"
    .replace(/_/g, "-"); // Replace underscores with hyphens for URL-friendly format
}

// Function to generate rewrites configuration automatically
function generateRewrites() {
  const rewrites: Record<string, string> = {};
  
  // 简体中文的 rewrites（root）- 重新映射到根路径
  const zhCNDir = join(__dirname, "../zh-CN");
  
  // 🔥 关键修复：映射首页文件
  if (existsSync(join(zhCNDir, 'index.md'))) {
    rewrites['zh-CN/index.md'] = 'index.md';
  }
  
  // 映射根级别的基本页面
  if (existsSync(join(zhCNDir, 'about.md'))) {
    rewrites['zh-CN/about.md'] = 'about.md';
  }
  
  // 映射冥想相关页面
  const zhCNMeditationsDir = join(zhCNDir, "meditations");
  if (existsSync(zhCNMeditationsDir)) {
    // 冥想首页
    if (existsSync(join(zhCNMeditationsDir, 'index.md'))) {
      rewrites['zh-CN/meditations/index.md'] = 'meditations/index.md';
    }
    
    const categories = readdirSync(zhCNMeditationsDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const category of categories) {
      const cleanCategoryPath = getCleanCategoryPath(category);
      const categoryPath = join(zhCNMeditationsDir, category);

      // 处理目录首页
      rewrites[`zh-CN/meditations/${category}/index.md`] = `meditations/${cleanCategoryPath}/index.md`;

      // 处理该目录下的所有文件
      if (existsSync(categoryPath)) {
        const files = readdirSync(categoryPath).filter(
          (file) => file.endsWith(".md") && file !== "index.md"
        );

        for (const file of files) {
          const cleanFileName = getCleanFileName(file.replace(".md", ""));
          rewrites[`zh-CN/meditations/${category}/${file}`] = `meditations/${cleanCategoryPath}/${cleanFileName}.md`;
        }
      }
    }
  }

  // 其他语言的 rewrites - 保持原路径
  const locales = ['zh-TW', 'zh-HK', 'en-US'];
  
  for (const locale of locales) {
    const localeDir = join(__dirname, `../${locale}`);
    
    if (existsSync(localeDir)) {
      // 🔥 关键修复：映射各语言的首页
      if (existsSync(join(localeDir, 'index.md'))) {
        rewrites[`${locale}/index.md`] = `${locale}/index.md`;
      }
      
      // 基本页面
      if (existsSync(join(localeDir, 'about.md'))) {
        rewrites[`${locale}/about.md`] = `${locale}/about.md`;
      }
      
      // 冥想页面
      const localeMeditationsDir = join(localeDir, 'meditations');
      if (existsSync(localeMeditationsDir)) {
        // 冥想首页
        if (existsSync(join(localeMeditationsDir, 'index.md'))) {
          rewrites[`${locale}/meditations/index.md`] = `${locale}/meditations/index.md`;
        }
        
        const categories = readdirSync(localeMeditationsDir, { withFileTypes: true })
          .filter((dirent) => dirent.isDirectory())
          .map((dirent) => dirent.name);

        for (const category of categories) {
          const cleanCategoryPath = getCleanCategoryPath(category);
          const categoryPath = join(localeMeditationsDir, category);

          // 处理目录首页
          rewrites[`${locale}/meditations/${category}/index.md`] = `${locale}/meditations/${cleanCategoryPath}/index.md`;

          // 处理该目录下的所有文件
          if (existsSync(categoryPath)) {
            const files = readdirSync(categoryPath).filter(
              (file) => file.endsWith(".md") && file !== "index.md"
            );

            for (const file of files) {
              const cleanFileName = getCleanFileName(file.replace(".md", ""));
              rewrites[`${locale}/meditations/${category}/${file}`] = `${locale}/meditations/${cleanCategoryPath}/${cleanFileName}.md`;
            }
          }
        }
      }
    }
  }

  // 🔥 调试：打印 rewrites 配置，看看是否正确
  console.log('Rewrites configuration:', rewrites);

  return rewrites;
}


// Function to generate sidebar automatically
function generateSidebar(locale: string = 'zh-CN') {
  const baseDir = locale === 'zh-CN' ? join(__dirname, "../zh-CN") : join(__dirname, `../${locale}`);
  const meditationsDir = join(baseDir, "meditations");
  
  // 检查目录是否存在
  if (!existsSync(meditationsDir)) {
    return [];
  }
  
  const categories = readdirSync(meditationsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .sort();

  const sidebarItems: Array<{
    text: string;
    collapsed: boolean;
    items: Array<{ text: string; link: string }>;
  }> = [];

  // 多语言文本配置
  const localeTexts = {
    'zh-CN': { intro: '章节简介' },
    'zh-TW': { intro: '章節簡介' },
    'zh-HK': { intro: '章節簡介' },
    'en-US': { intro: 'Chapter Introduction' }
  };

  const currentLocaleText = localeTexts[locale as keyof typeof localeTexts] || localeTexts['zh-CN'];

  for (const category of categories) {
    const categoryPath = join(meditationsDir, category);
    const indexPath = join(categoryPath, "index.md");
    const cleanCategoryPath = getCleanCategoryPath(category);

    // Extract category title from index.md
    let categoryTitle = "";
    if (existsSync(indexPath)) {
      categoryTitle = extractFirstHeading(indexPath);
    }
    if (!categoryTitle) {
      categoryTitle = category.replace(/^\d+_/, "").replace(/_/g, " ");
    }

    const items: Array<{ text: string; link: string }> = [];

    // Add index.md as introduction
    const linkPrefix = locale === 'zh-CN' ? '' : `/${locale}`;
    items.push({
      text: currentLocaleText.intro,
      link: `${linkPrefix}/meditations/${cleanCategoryPath}/`,
    });

    // Get all markdown files except index.md
    if (existsSync(categoryPath)) {
      const files = readdirSync(categoryPath)
        .filter((file) => file.endsWith(".md") && file !== "index.md")
        .sort();

      for (const file of files) {
        const filePath = join(categoryPath, file);
        const title = extractFirstHeading(filePath) || file.replace(/\.md$/, "").replace(/^\d+_\d+_/, "").replace(/^\d+_/, "").replace(/_/g, " ");
        const cleanFileName = getCleanFileName(file.replace(".md", ""));

        items.push({
          text: title,
          link: `${linkPrefix}/meditations/${cleanCategoryPath}/${cleanFileName}`,
        });
      }
    }

    sidebarItems.push({
      text: categoryTitle,
      collapsed: true,
      items,
    });
  }

  return sidebarItems;
}

export default defineConfig({
  // 共享配置
  rewrites: generateRewrites(),
  cleanUrls: true,
  
  // Sitemap 配置
  sitemap: {
    hostname: 'https://www.blsv.org',
    lastmodDateOnly: false,
  },

  head: [["link", { rel: "icon", href: "/logos/logo.png" }]],

  // 多语言配置
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: "花开如你",
      description: '"花开如你" 冥想系列，为跨性别女性提供科学、温柔的心理冥想支持',
      themeConfig: {
        nav: [
          { text: "首页", link: "/" },
          { text: "冥想练习", link: "/meditations/" },
          { text: "关于项目", link: "/about" },
        ],
        sidebar: {
          "/meditations/": generateSidebar('zh-CN'),
        },
      }
    },
    'zh-TW': {
      label: '繁體中文（台灣）',
      lang: 'zh-TW',
      title: "花開如你",
      description: '"花開如你" 冥想系列，為跨性別女性提供科學、溫柔的心理冥想支持',
      themeConfig: {
        nav: [
          { text: "首頁", link: "/zh-TW/" },
          { text: "冥想練習", link: "/zh-TW/meditations/" },
          { text: "關於專案", link: "/zh-TW/about" },
        ],
        sidebar: {
          "/zh-TW/meditations/": generateSidebar('zh-TW'),
        },
      }
    },
    'zh-HK': {
      label: '繁體中文（香港）',
      lang: 'zh-HK',
      title: "花開如你",
      description: '"花開如你" 冥想系列，為跨性別女性提供科學、溫柔嘅心理冥想支持',
      themeConfig: {
        nav: [
          { text: "首頁", link: "/zh-HK/" },
          { text: "冥想練習", link: "/zh-HK/meditations/" },
          { text: "關於專案", link: "/zh-HK/about" },
        ],
        sidebar: {
          "/zh-HK/meditations/": generateSidebar('zh-HK'),
        },
      }
    },
    'en-US': {
      label: 'English',
      lang: 'en-US',
      title: "Blossom Like You",
      description: 'Scientific and gentle psychological meditation support for transgender women',
      themeConfig: {
        nav: [
          { text: "Home", link: "/en-US/" },
          { text: "Meditations", link: "/en-US/meditations/" },
          { text: "About", link: "/en-US/about" },
        ],
        sidebar: {
          "/en-US/meditations/": generateSidebar('en-US'),
        },
      }
    }
  },

  // 共享主题配置
  themeConfig: {
    logo: "/logos/logo.png",

    footer: {
      message: "用爱与温柔，陪伴每一位跨性别女性成长。",
      copyright: "Copyright © 2025-Now 花开如你项目组",
    },

    editLink: {
      pattern: "https://github.com/blossom-selves/blossom-selves/edit/main/docs/:path",
      text: "在 GitHub 上编辑此页",
    },

    lastUpdated: {
      text: "最后更新于",
      formatOptions: {
        dateStyle: "short" as const,
        timeStyle: "medium" as const,
      },
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    outline: {
      label: '页面导航'
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',

    socialLinks: [
      { icon: "github", link: "https://github.com/blossom-selves/blossom-selves" },
    ],

    search: {
      provider: "local",
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换'
            }
          }
        }
      }
    },
  },

  vite: {
    plugins: [
      GitChangelog({
        repoURL: () => "https://github.com/blossom-selves/blossom-selves",
      }),
      GitChangelogMarkdownSection()
    ],
    optimizeDeps: {
      exclude: [
        "@nolebase/vitepress-plugin-enhanced-readabilities/client",
        "vitepress",
        "@nolebase/ui",
      ],
    },
    ssr: {
      noExternal: [
        "@nolebase/vitepress-plugin-enhanced-readabilities",
        "@nolebase/ui",
      ],
    },
  },
});
