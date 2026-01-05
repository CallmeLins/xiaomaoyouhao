# 小猫油耗 🚗

一款基于 Tauri 2.0 开发的跨平台油耗记录桌面应用，帮助您轻松管理车辆信息和油耗数据。

![Tauri](https://img.shields.io/badge/Tauri-2.0-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)
![Rust](https://img.shields.io/badge/Rust-1.70+-orange)

## ✨ 功能特性

### 核心功能
- 📊 **油耗记录管理** - 记录每次加油的详细信息（日期、里程、油量、价格等）
- 🚙 **多车辆管理** - 支持添加和管理多辆车辆，每辆车独立记录
- 📈 **数据统计分析** - 自动计算总花费、总油量、百公里油耗
- 📉 **趋势图表** - 可视化展示花费和油量趋势
- 💾 **本地数据存储** - 使用 SQLite 数据库持久化存储，数据安全可靠
- 📤 **数据导入导出** - 支持 CSV/JSON 格式导入导出，方便数据备份和迁移

### 界面特性
- 🎨 **深色模式** - 支持浅色/深色主题切换
- 📱 **响应式设计** - 适配不同屏幕尺寸
- ✏️ **便捷编辑** - 支持修改和删除历史记录
- 🎯 **直观操作** - 简洁友好的用户界面

## 🖼️ 应用截图

![安卓app截图](./public/androidscreenshot.jpg)

### 油耗记录
记录每次加油的详细信息，支持自动计算总价。

### 花费统计
查看总花费、油耗趋势，一目了然。

### 车辆管理
管理多辆车辆信息，支持切换当前车辆。

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.0.0
- **Rust** >= 1.70.0
- **pnpm** 或 **npm** 或 **yarn**

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm
pnpm install

# 或使用 yarn
yarn install
```

### 开发模式

```bash
npm run tauri dev
```

### 构建应用

```bash
npm run tauri build
```

构建完成后，安装包位于 `src-tauri/target/release/bundle/` 目录下。

## 📦 技术栈

### 前端
- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Radix UI** - 无障碍组件库
- **shadcn/ui** - UI 组件
- **Recharts** - 图表库
- **Sonner** - Toast 通知

### 后端
- **Rust** - 系统编程语言
- **Tauri 2.0** - 桌面应用框架
- **rusqlite** - SQLite 数据库驱动
- **serde** - 序列化/反序列化

## 📁 项目结构

```
xiaomaoyouhao/
├── src/                      # 前端源码
│   ├── app/
│   │   ├── components/       # React 组件
│   │   │   ├── ui/          # UI 基础组件
│   │   │   ├── FuelRecordTab.tsx      # 油耗记录页面
│   │   │   ├── ExpenseTab.tsx         # 花费统计页面
│   │   │   ├── SettingsTab.tsx        # 设置页面
│   │   │   ├── VehicleManagement.tsx  # 车辆管理
│   │   │   └── ...
│   │   └── App.tsx          # 主应用组件
│   └── ...
├── src-tauri/               # Rust 后端
│   ├── src/
│   │   ├── lib.rs          # 主逻辑和 API
│   │   ├── db.rs           # 数据库初始化
│   │   └── models.rs       # 数据模型
│   ├── Cargo.toml          # Rust 依赖
│   └── tauri.conf.json     # Tauri 配置
└── README.md
```

## 💾 数据存储

应用使用 SQLite 数据库存储数据，数据库文件位置：

- **Windows**: `%APPDATA%\com.xiaomaoyouhao.app\xiaomaoyouhao.db`
- **macOS**: `~/Library/Application Support/com.xiaomaoyouhao.app/xiaomaoyouhao.db`
- **Linux**: `~/.local/share/xiaomaoyouhao/xiaomaoyouhao.db`

## 🎯 使用指南

### 首次使用

1. **添加车辆**
   - 打开应用，进入"设置"标签
   - 点击"我的车辆"
   - 点击"添加车辆"按钮
   - 填写车辆信息（品牌和型号为必填）

2. **选择当前车辆**
   - 在车辆列表中点击要使用的车辆
   - 选中的车辆会显示蓝色背景和"当前车辆"标签

3. **添加油耗记录**
   - 进入"油耗"标签
   - 填写加油信息
   - 记录会自动关联到当前选中的车辆

4. **查看统计**
   - 进入"花费"标签
   - 查看总花费、总油量、百公里油耗
   - 查看趋势图表和历史记录

### 管理记录

- **编辑记录**: 在记录列表中点击菜单按钮，选择"编辑"
- **删除记录**: 在记录列表中点击菜单按钮，选择"删除"
- **删除车辆**: 删除车辆时会同时删除该车辆的所有油耗记录

### 数据导入导出

#### 导出数据
1. 进入"花费"标签
2. 点击"导出数据"按钮
3. 自动下载 CSV 格式文件（文件名：`fuel-records-YYYY-MM-DD.csv`）
4. CSV 文件包含所有油耗记录，可用 Excel 或其他表格软件打开

#### 导入数据
1. 进入"花费"标签
2. 点击"导入数据"按钮
3. 选择 CSV 或 JSON 格式的文件
4. 系统自动识别文件格式并导入
5. 导入成功后自动刷新页面显示新数据

**支持的文件格式：**
- **CSV** - 逗号分隔值文件，支持 Excel 编辑
- **JSON** - 标准 JSON 格式，便于程序处理

**CSV 文件格式：**
```csv
ID,车辆ID,日期,里程(km),加油量(L),单价(元/L),总价(元),油品类型,是否加满,备注,创建时间
"1234567890","vehicle123","2026-01-03",10000,40.5,7.5,303.75,"92号汽油","是","","2026-01-03T10:00:00Z"
```

**注意事项：**
- 导入前请确保 CSV 文件格式正确
- 导入的记录必须关联到已存在的车辆ID
- 建议定期导出数据进行备份

### WebDAV 云端同步

#### 配置 WebDAV
1. 进入"设置"标签
2. 点击"自动同步"区域打开配置对话框
3. 填写 WebDAV 服务器信息：
   - **服务器地址**：如 `https://dav.jianguoyun.com/dav/`
   - **用户名**：您的邮箱或用户名
   - **密码**：应用专用密码（坚果云需在网页端生成）
   - **同步路径**：留空使用默认文件夹 `xiaomaoyouhao`，或自定义路径
4. 点击"测试连接"确认配置正确
5. 保存配置

#### 同步策略
- **变化时延迟同步**：数据变化后 30 秒自动同步
- **定时全量同步**：每小时自动同步一次
- **手动控制**：可随时通过开关启用/禁用自动同步

#### 支持的 WebDAV 服务
- 坚果云
- Nextcloud
- ownCloud
- 其他标准 WebDAV 服务

#### 同步文件
- 文件名：`fuel-records-backup.csv`
- 格式：CSV（包含车辆信息和油耗记录）
- 位置：配置的路径下（默认 `xiaomaoyouhao` 文件夹）

## 🔧 开发指南

### 推荐 IDE 设置

- [VS Code](https://code.visualstudio.com/)
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

### 添加新功能

1. 在 `src-tauri/src/lib.rs` 中添加 Tauri 命令
2. 在前端组件中使用 `invoke` 调用后端 API
3. 更新数据模型（如需要）

### 调试

```bash
# 查看 Rust 日志
RUST_LOG=debug npm run tauri dev

# 前端开发者工具
# 在应用中按 F12 打开
```

## 📝 待实现功能

- [x] 批量导入/导出功能（已完成 - 支持 CSV/JSON 格式）
- [x] WebDAV 云端同步（已完成 - 支持坚果云、Nextcloud 等）
- [ ] AI 智能分析和建议
- [ ] 多车辆对比分析
- [ ] 数据自动备份

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👨‍💻 作者

开发者信息请在应用的"设置 → 关于作者"中查看。

---

**让每一次加油都清晰可见** 🚗💨
