# 面包探针

**Bread Cloudflare Probe** 是一个 Cloudflare 原生服务器探针项目。

它把监控面板部署在 Cloudflare Workers 上，使用 Cloudflare D1 存储数据，服务器通过轻量 Agent 定时上报状态。目标是做一个比传统自建面板更轻、更容易部署、更适合小团队和个人服务器管理的探针系统。

## 功能

- 服务器在线 / 离线状态
- CPU、内存、磁盘、网络、运行时间上报
- 网站可用性监控
- Telegram 通知
- 通用 Webhook 通知通道
- 通知模板变量
- 后台管理服务器、网站监控和通知配置
- Cloudflare Workers + D1 部署

## 项目结构

```text
worker.js              Cloudflare Worker 主程序
cf-vps-monitor.sh      VPS Agent 安装和管理脚本
scripts/               部署、初始化和辅助脚本
wrangler.toml.example  Wrangler 配置模板
package.json           npm 命令入口
PROJECT_PLAN.md        二开路线
DEPLOYMENT_NOTES.md    部署和踩坑记录
```

## 半自动部署

### 1. 准备环境

本地需要安装：

```text
Node.js 18+
npm
```

然后在项目目录执行：

```bash
npm install
```

### 2. 登录 Cloudflare

```bash
npm run cf:login
```

浏览器会打开 Cloudflare 授权页面。登录完成后回到终端。

### 3. 初始化配置

```bash
npm run setup
```

脚本会引导你：

- 设置 Worker 名称
- 创建或填写 D1 数据库
- 生成 `wrangler.toml`
- 设置 `USERNAME`
- 自动生成或手动设置 `PASSWORD`
- 自动生成并写入 `JWT_SECRET`
- 配置 Cron 触发器

默认情况下，脚本会使用 `admin` 作为用户名，并自动生成一个强密码。密码只会在终端显示一次，请及时保存。

### 4. 部署 Worker

```bash
npm run deploy
```

部署完成后，终端会显示 Worker 访问地址。

### 5. 初始化数据库

```bash
npm run init-db
```

按提示输入 Worker 地址，例如：

```text
https://bread-cloudflare-probe.your-name.workers.dev
```

成功时会返回：

```json
{"success":true,"message":"数据库初始化完成"}
```

### 6. 登录后台

访问：

```text
https://你的-worker-url/login
```

使用 `npm run setup` 时设置的账号密码登录。

### 7. 添加服务器

后台添加服务器后，复制面板生成的一键 Agent 安装命令，在对应服务器上执行。

安装成功后可检查：

```bash
systemctl status cf-vps-monitor --no-pager
journalctl -u cf-vps-monitor -n 50 --no-pager
```

## 常用命令

```bash
npm run setup       # 半自动生成 Cloudflare 部署配置
npm run deploy      # 部署 Worker
npm run init-db     # 初始化 D1 数据库
npm run update      # 更新部署
npm run check       # 检查 worker.js 语法
npm run cf:login    # 登录 Cloudflare
```

## 通知模板变量

Webhook 请求体支持以下变量：

```text
#MESSAGE#
#SERVER.ID#
#SERVER.NAME#
#SERVER.IP#
#SITE.NAME#
#SITE.URL#
#STATUS#
#TYPE#
#DATETIME#
#DATE#
#TIME#
#PRIORITY#
#NEZHA#
```

企业微信机器人示例：

```json
{
  "msgtype": "text",
  "text": {
    "content": "#MESSAGE#\n服务器：#SERVER.NAME#\nIP：#SERVER.IP#\n时间：#DATETIME#"
  }
}
```

## 当前状态

项目仍处于二开早期阶段。当前重点是：

- 跑通 Cloudflare 原生部署
- 优化一键部署体验
- 增强通知渠道
- 逐步拆分 `worker.js`
- 做成可维护、可发布的开源项目

## 致谢

本项目基于 [kadidalax/cf-vps-monitor](https://github.com/kadidalax/cf-vps-monitor) 二次开发。感谢原作者提供 Cloudflare Workers + D1 VPS 监控面板的基础实现和部署思路。

## 许可证

待确认。正式发布到 GitHub 前需要补充 `LICENSE`。
