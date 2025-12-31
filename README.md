# 汽车油耗/电耗记录APP

一个基于Tauri + Vue + Rust开发的跨平台汽车能耗记录应用。

## 功能特性

### 已实现功能

#### 1. 车辆管理
- ✅ 添加车辆（支持燃油车、纯电动车、混合动力车）
- ✅ 查看车辆列表
- ✅ 记录车辆基本信息（品牌、型号、年份、油箱/电池容量）

#### 2. 数据模型
- ✅ 车辆信息模型
- ✅ 加油记录模型（支持多种油品类型）
- ✅ 充电记录模型（支持快充/慢充）
- ✅ 保养记录模型
- ✅ 费用记录模型

#### 3. 数据持久化
- ✅ SQLite数据库存储
- ✅ 自动创建数据库表结构
- ✅ 数据本地保存

#### 4. 能耗计算引擎
- ✅ 燃油车油耗计算（跳枪法算法）
- ✅ 电动车电耗计算
- ✅ 百公里能耗统计

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
