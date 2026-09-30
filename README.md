# 中国历史疆域演变可视化

> 从虞朝到现代，上下五千年的疆域变化与多政权并立展示

一个基于 Vue 3 + Vite + Leaflet 的交互式历史地图可视化项目，涵盖中国历史上 23 个重要时期、61 个政权的疆域演变。

![预览](https://img.shields.io/badge/Vue-3.3-42b883)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ 项目特色

- 🗺️ **真实边界**：基于阿里云 DataV 提供的中国省份 GeoJSON 数据，每个朝代疆域采用真实省份边界
- 📜 **23 个时期**：从传说中的虞朝到现代中国，跨越约 4000 年历史
- 🏛️ **61 个政权**：包含多国并立时期（春秋、战国、三国、五代十国、宋辽金等）的所有政权
- 🏯 **首都标记**：每个政权都标注其首都，白底彩色边框样式
- 🌍 **超出疆域**：唐、元、清等朝代显示超出今天中国国界的疆域（蒙古高原、中亚、朝鲜半岛等）
- 🖱️ **交互操作**：
  - 点击图例项切换政权显示/隐藏
  - 点击信息卡片切换显示状态
  - 鼠标悬停高亮疆域
  - 时间轴拖动浏览不同时期

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.3.4 | 前端框架（Composition API + `<script setup>`） |
| Vite | ^4.5.0 | 构建工具 |
| Leaflet | ^1.9.4 | 地图库 |
| 天地图 | - | 矢量地图底图 + 标签层 |
| OpenStreetMap | - | 天地图失败时的备用底图 |

## 📦 项目结构

```
china-map/
├── public/
│   ├── vite.svg                  # 网站图标
│   └── data/
│       └── china_provinces.json  # 中国省份边界 GeoJSON（来自 DataV）
├── src/
│   ├── App.vue                   # 主组件
│   ├── main.js                   # 入口文件
│   ├── assets/styles/main.css    # 全局样式
│   ├── components/
│   │   ├── MapView.vue           # 地图组件（含图例交互）
│   │   ├── DynastyPanel.vue      # 朝代列表面板
│   │   ├── TimeSlider.vue        # 时间轴
│   │   └── DynastyInfo.vue       # 时期信息卡片
│   ├── composables/
│   │   └── useTianditu.js        # 天地图 Token 池管理
│   └── data/
│       ├── dynasties.js          # 朝代数据（23 个时期 + 61 个政权）
│       └── provinceCodes.js      # 省份编码映射
├── index.html
├── package.json
└── vite.config.js
```

## 🚀 快速开始

### 环境要求

- Node.js 16+
- npm 或 yarn 或 pnpm

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

默认监听 `http://localhost:5173`。

### 构建生产版本

```bash
npm run build
```

构建产物输出至 `dist/` 目录。

### 预览生产版本

```bash
npm run preview
```

## 🗝️ 天地图 Token 配置

项目使用天地图作为默认底图，需要在天地图官网申请 Token。

编辑 `src/composables/useTianditu.js`，将 `TOKEN_POOL` 替换为您的 Token：

```js
const TOKEN_POOL = [
  'your-tianditu-token-1',
  'your-tianditu-token-2',
  // ...
]
```

如果天地图不可访问，将自动降级使用 OpenStreetMap。

## 📊 数据来源

- **省份 GeoJSON**：阿里云 DataV 地理小工具（https://datav.aliyun.com/geo/atlas/）
- **天地图**：国家地理信息公共服务平台（https://www.tianditu.gov.cn/）
- **历史疆域数据**：基于权威历史地图和学术资料整理

## 🎮 使用说明

1. **左侧朝代列表**：点击任一时期切换疆域展示
2. **左侧地图图例**：
   - 点击政权名称可切换显示/隐藏
   - 隐藏后图例变灰并显示"显示"按钮
3. **右侧信息卡片**：
   - 点击政权卡片可切换显示/隐藏
   - 点击"重置"按钮恢复全部显示
4. **底部时间轴**：拖动滑块快速浏览不同时期

## 🤝 贡献指南

欢迎贡献！您可以：

- 📝 补充历史资料（特别是边缘政权的疆域数据）
- 🐛 修复 Bug 或优化代码
- 🎨 改进 UI/UX 设计
- 🌍 翻译文档为其他语言

## 📜 历史时期列表

### 远古
- 虞、夏、商、西周

### 分裂与统一
- 春秋、战国、秦

### 帝制早期
- 西汉、新朝、东汉、三国、西晋

### 中古
- 东晋十六国、南北朝、隋、唐、五代十国

### 宋元明清
- 宋辽金、元、明、清

### 近代
- 中华民国、中华人民共和国

## ⚠️ 数据声明

- 历史疆域数据基于学界主流观点整理，不代表任何官方政治立场
- 部分边疆地区的疆域范围存在学术争议
- 早期朝代（虞、夏、商）的疆域为推测性描绘

## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

## 🙏 致谢

- 阿里云 DataV 提供中国省份 GeoJSON 数据
- 天地图提供矢量地图服务
- OpenStreetMap 提供备用底图
- Vue.js / Vite / Leaflet 等开源社区

---

如果这个项目对您有帮助，欢迎 ⭐ Star！