import { defineUserConfig } from "vuepress";
import { viteBundler } from "@vuepress/bundler-vite";
import recoTheme from "vuepress-theme-reco";

export default defineUserConfig({
  base: "/",
  head: [["link", { rel: "icon", href: "/alimi.ico" }]],
  title: "d0qbu's blog",
  bundler: viteBundler({}),
  description: "d0qbu's blog to share something I knew",
  theme: recoTheme({
    logo: "",
    author: "d0qbu",
    authorAvatar: "/alimi.ico",
    docsRepo: "https://github.com/dAd0qbu/dAd0qbu.github.io",
    docsBranch: "main",
    docsDir: "",
    lastUpdatedText: "",
    colorMode: "dark",
    primaryColor: "#5E81AC",
    navbar: [
      { text: "Home", link: "/" },
      { text: "Timeline", link: "/timeline.html" },
      { text: "Categories", link: "/categories/CTF/1.html"  },
    ],
    bulletin: {},
  }),
  debug: true,
});
