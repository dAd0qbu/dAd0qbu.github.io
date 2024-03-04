import { defineUserConfig } from "vuepress";
import type { DefaultThemeOptions } from "vuepress";
import recoTheme from "vuepress-theme-reco";

export default defineUserConfig({
  base: "/",
  head: [['link', { rel: 'icon', href: '/alimi.ico' }]],
  title: "d0qbu's blog",
  description: "d0qbu's blog to share something I knew",
  theme: recoTheme({
    style: "@vuepress-reco/style-default",
    logo: "",
    author: "d0qbu",
    authorAvatar: "/alimi.ico",
    docsRepo: "https://github.com/vuepress-reco/vuepress-theme-reco-next",
    docsBranch: "main",
    docsDir: "example",
    lastUpdatedText: "Hehehhehe",
    // series 为原 sidebar
    series: {
    },
    navbar: [
      { text: "Home", link: "/" },
      { text: "Categories", link: "/categories/CTF/1/" },
      // { text: "Tags", link: "/tags/tag1/1/" },
    ],
    bulletin: {},
    // commentConfig: {
    //   type: 'valine',
    //   // options 与 1.x 的 valineConfig 配置一致
    //   options: {
    //     // appId: 'xxx',
    //     // appKey: 'xxx',
    //     // placeholder: '填写邮箱可以收到回复提醒哦！',
    //     // verify: true, // 验证码服务
    //     // notify: true,
    //     // recordIP: true,
    //     // hideComments: true // 隐藏评论
    //   },
    // },
  }),
  // debug: true,
});
