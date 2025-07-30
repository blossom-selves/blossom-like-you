import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '花开如你',
  description: '"花开如你" 冥想系列，为跨性别女性提供科学、温柔的心理冥想支持',
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],

  themeConfig: {
    logo: '/images/logos/logo.png',
    
    nav: [
      { text: '首页', link: '/' },
      { text: '冥想练习', link: '/meditations/' },
      { text: '关于项目', link: '/about' }
    ],
    
    sidebar: {
      '/meditations/': [
        {
          text: '紧急心理应答',
          collapsed: false,
          items: [
            { text: '简介', link: '/meditations/0_emergency_psychological_response/' }
          ]
        },
        {
          text: '冥想入门',
          collapsed: false,
          items: [
            { text: '章节简介', link: '/meditations/1_introduce/' },
            { text: '开始冥想', link: '/meditations/1_introduce/1_1_hello_meditation' },
            { text: '享受星空', link: '/meditations/1_introduce/1_2_enjoy_the_starry_sky' }
          ]
        },
        {
          text: '自我接纳',
          collapsed: true,
          items: [
            { text: '简介', link: '/meditations/2_self_acceptance/' }
          ]
        },
        {
          text: '女性自我想象',
          collapsed: true,
          items: [
            { text: '简介', link: '/meditations/3_feminine_self_visualization/' }
          ]
        }
      ]
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