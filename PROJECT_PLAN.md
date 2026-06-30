# 面包探针

## 项目定位

中文名：面包探针

英文名：Bread Cloudflare Probe

包名 / 推荐仓库名：`bread-cloudflare-probe`

基于 Cloudflare Workers + D1 的轻量 VPS 探针项目。

目标是做一个比哪吒更轻、更容易部署的服务器监控面板：

- 面板部署在 Cloudflare Workers
- 数据存储在 Cloudflare D1
- VPS 通过 Agent 定时上报状态
- 支持服务器在线状态、CPU、内存、磁盘、网络等基础监控
- 支持 Telegram 等通知渠道
- 后续逐步扩展为可公开发布的开源项目

## 当前阶段目标

先跑通上游基础项目，验证它是否适合作为二开基础。

成功标准：

- Cloudflare Worker 面板可以正常访问
- D1 数据库绑定并初始化成功
- 至少 1 台 VPS Agent 正常上报
- Telegram 测试通知成功
- VPS 离线 / 恢复通知可以触发

## 近期任务

1. 清理旧哪吒环境
   - 删除哪吒 Dashboard 容器
   - 删除不再使用的哪吒数据目录
   - 删除 Cloudflare Tunnel 里旧的哪吒路由
   - 在各 VPS 上卸载 `nezha-agent`

2. 部署当前项目测试版
   - 创建 Cloudflare D1 数据库
   - 创建 Worker
   - 部署 `worker.js`
   - 绑定 D1，变量名使用 `DB`
   - 设置 `USERNAME`、`PASSWORD`、`JWT_SECRET`
   - 访问 `/api/init-db` 初始化数据库
   - 配置 Cron 触发器
   - 添加第一台测试 VPS
   - 安装 Agent

3. 验证基础能力
   - 面板数据显示正常
   - Agent 重启后能自动恢复
   - VPS 离线超过阈值后能通知
   - VPS 恢复后能通知
   - 网站监控能正常检测和通知

## 二开路线

### 第一阶段：工程化整理

- 添加 `LICENSE`
- 添加 `wrangler.toml.example`（已完成）
- 添加 `package.json`（已完成）
- 添加半自动部署脚本，尽量自动完成 Worker、D1、环境变量、Cron 和初始化流程（已完成基础版）
- 整理 README 部署流程（已完成基础版）
- 增加 `.gitignore`（已完成）
- 拆分超大的 `worker.js`
- 区分前端、API、数据库 schema、通知模块

### 第二阶段：告警能力

- 增加 CPU 阈值告警
- 增加内存阈值告警
- 增加磁盘阈值告警
- 增加流量异常告警
- 支持按服务器单独配置告警规则
- 支持告警静默时间

### 第三阶段：通知渠道

- 保留 Telegram
- 增加通用 Webhook 通知通道（已完成基础版）
- 支持自定义 URL、请求方式、内容类型、请求头、请求体模板（已完成基础版）
- 支持通知模板变量：`#MESSAGE#`、`#SERVER.NAME#`、`#SERVER.IP#`、`#SITE.NAME#`、`#SITE.URL#`、`#STATUS#`、`#DATETIME#`
- 增加 Bark
- 增加 ServerChan
- 增加 Discord / Slack 可选支持

### 第四阶段：Agent 增强

- 独立 Agent 项目
- 支持 systemd 安装、升级、卸载
- 支持配置文件
- 支持多网卡统计
- 支持 Docker 状态采集
- 支持进程监控

### 第五阶段：面板体验

- 服务器分组
- 公开状态页
- 科技感浅色后台 UI（已完成基础版）
- 移除自定义背景图片设置（已完成）
- 深色模式视觉优化
- 移动端优化
- 历史图表
- 批量复制安装命令
- 多语言支持

### 第六阶段：接近哪吒的高级功能

- 任务系统
- 远程命令执行
- 简易终端
- 多用户和权限
- API Token 管理

这些功能风险更高，先不作为第一版目标。

## 暂不做

- 不一开始照搬哪吒全部功能
- 不先做复杂远程终端
- 不先做多租户 SaaS
- 不先引入重型前端框架

先把轻量、稳定、好部署做好。
