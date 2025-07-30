import { defineConfig } from 'vitepress'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Function to extract first heading from markdown file
function extractFirstHeading(filePath: string): string {
  try {
    const content = readFileSync(filePath, 'utf-8')
    const match = content.match(/^#\s+(.+)$/m)
    return match ? match[1].trim() : ''
  } catch {
    return ''
  }
}

// Function to extract clean display name from file path
function getCleanDisplayName(filePath: string): string {
  return filePath
    .replace(/\d+_/g, '') // Remove number prefixes
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\.md$/, '') // Remove .md extension
}

// Function to generate sidebar automatically
function generateSidebar() {
  const meditationsDir = join(__dirname, '../meditations')
  const categories = readdirSync(meditationsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort() // This will sort 0_, 1_, 2_, 3_ correctly

  const sidebarItems: Array<{
    text: string
    collapsed: boolean
    items: Array<{ text: string; link: string }>
  }> = []

  for (const category of categories) {
    const categoryPath = join(meditationsDir, category)
    const indexPath = join(categoryPath, 'index.md')
    
    // Extract category title from index.md
    let categoryTitle = ''
    if (existsSync(indexPath)) {
      categoryTitle = extractFirstHeading(indexPath)
    }
    
    const items: Array<{ text: string; link: string }> = []
    
    // Add index.md as "章节简介"
    items.push({
      text: '章节简介',
      link: `/meditations/${category}/`
    })

    // Get all markdown files except index.md
    const files = readdirSync(categoryPath)
      .filter(file => file.endsWith('.md') && file !== 'index.md')
      .sort() // This will sort 1_1_, 1_2_, etc. correctly

    for (const file of files) {
      const filePath = join(categoryPath, file)
      const title = extractFirstHeading(filePath) || getCleanDisplayName(file)
      
      items.push({
        text: title,
        link: `/meditations/${category}/${file.replace('.md', '')}`
      })
    }

    sidebarItems.push({
      text: categoryTitle,
      collapsed: category.startsWith('0_') ? false : true, // Keep emergency open
      items
    })
  }

  return sidebarItems
}

export default defineConfig({
  title: '花开如你',
  description: '"花开如你" 冥想系列，为跨性别女性提供科学、温柔的心理冥想支持',
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],


  themeConfig: {
    logo: '/logos/logo.png',
    
    nav: [
      { text: '首页', link: '/' },
      { text: '冥想练习', link: '/meditations/' },
      { text: '关于项目', link: '/about/' }
    ],
    
    sidebar: {
      '/meditations/': generateSidebar()
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/iuu6/blossom-selves' }
    ],
    
    footer: {
      message: '用爱与温柔，陪伴每一位跨性别女性成长。',
      copyright: 'Copyright © 2025-Now 花开如你项目组'
    },
    
    search: {
      provider: 'local'
    },
    
    editLink: {
      pattern: 'https://github.com/iuu6/blossom-selves/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },
    
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    }
  }
})