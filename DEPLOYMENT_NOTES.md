# 安装部署记录

## 本次测试结论

当前项目可以成功部署到 Cloudflare Workers，并通过 D1 保存 VPS 上报数据。

已验证链路：

- Worker 可以访问
- D1 绑定成功
- `/api/init-db` 初始化成功
- VPS Agent 可以安装
- Agent 可以上报数据
- 面板显示 VPS 在线

测试 Worker 地址：

```text
https://cloudflare-vps-monitor.hackbread.workers.dev
```

测试 VPS：

```text
香港阿里云
Server ID: ixaaa2
IP: 47.76.80.75
```

## Cloudflare 部署步骤

### 1. 创建 Worker

在 Cloudflare 后台：

```text
Workers & Pages
-> 创建
-> Worker
-> 从 Hello World! 开始
```

创建后进入代码编辑器，删除默认代码，粘贴 `worker.js` 全部内容，然后部署。

### 2. 创建 D1 数据库

在 Cloudflare 后台：

```text
存储和数据库
-> D1 SQL 数据库
-> 创建数据库
```

### 3. 绑定 D1

进入 Worker 设置：

```text
设置
-> 绑定
-> 添加绑定
-> D1 数据库
```

变量名称必须是：

```text
DB
```

### 4. 设置环境变量

进入 Worker 设置：

```text
设置
-> 变量和机密
```

添加：

```text
USERNAME
PASSWORD
JWT_SECRET
```

建议后续一键部署时自动生成 `JWT_SECRET`，并强制用户设置管理员密码。

### 5. 初始化数据库

访问：

```text
https://你的-worker-url/api/init-db
```

成功返回：

```json
{"success":true,"message":"数据库初始化完成"}
```

### 6. Cron 触发器

VPS 主动上报不依赖 Cron。Cron 主要用于网站监控、持续离线提醒等后台任务。

建议配置：

```text
*/5 * * * *
```

或节省额度：

```text
0 * * * *
```

## Agent 安装步骤

在面板后台添加服务器，复制对应的一键安装命令。

测试安装时看到：

```text
数据上报成功
服务器返回新的上报间隔: 60秒
连接测试成功
systemd服务创建完成
```

说明安装主流程成功。

安装后验证：

```bash
systemctl daemon-reload
systemctl enable cf-vps-monitor
systemctl start cf-vps-monitor
systemctl status cf-vps-monitor --no-pager
journalctl -u cf-vps-monitor -n 50 --no-pager
```

服务正常时应看到：

```text
Active: active (running)
```

## 已发现问题

### Agent 安装脚本 `$USER` 未定义

测试机器上安装到 crontab 备用自启动阶段时报错：

```text
./cf-vps-monitor.sh: line 2503: USER: unbound variable
```

原因：

```bash
record_installation "crontab" "$USER" "add" "$backup_file"
```

在某些 root 非交互环境里 `$USER` 未定义，脚本又启用了严格模式。

本地已修复为：

```bash
record_installation "crontab" "${USER:-$(id -un 2>/dev/null || echo root)}" "add" "$backup_file"
```

## 已加入的二开功能

### 面包探针 UI 基础版

已重做后台视觉基调：

- 移除后台“背景设置”表单
- 禁用旧的自定义背景图片效果
- 替换为固定浅色科技感背景
- 使用淡紫、青蓝作为点缀色
- 弱化卡片边框和框套框效果
- 优化导航栏、表格、按钮、表单、状态徽标和移动端卡片样式
- 页面标题和 GitHub 链接已改为面包探针项目

保留现有功能和数据结构，不改 Agent 上报逻辑。

### 通用 Webhook 通知通道

后台 Telegram 设置下新增了 Webhook 通知通道管理：

- 名称
- URL
- 请求方式：GET、POST、PUT、PATCH
- 类型：JSON、FORM、TEXT
- 请求头 JSON
- 请求体模板
- 启用开关
- 测试通知
- 不发送测试消息

支持模板变量：

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

默认请求体适配企业微信机器人：

```json
{
  "msgtype": "text",
  "text": {
    "content": "#MESSAGE#\n服务器：#SERVER.NAME#\nIP：#SERVER.IP#\n时间：#DATETIME#"
  }
}
```

注意：Cloudflare Workers 的 `fetch` 不支持关闭 TLS 证书校验，所以“验证 TLS”字段目前只是兼容哪吒式配置界面，实际请求仍由 Workers 按平台规则验证 TLS。

### 复制终端输出时容易误执行日志

测试过程中误把终端提示符和安装日志粘回 SSH，导致：

```text
command not found
syntax error near unexpected token
```

这不是 Agent 问题。后续一键安装文档要强调：只复制命令，不复制终端提示符和日志。

## 二开部署目标

后续应尽量做到一键部署：

- 自动创建或引导创建 D1
- 自动生成 `wrangler.toml`
- 自动部署 Worker
- 自动绑定 D1
- 自动设置必要环境变量
- 自动初始化数据库
- 自动配置 Cron
- 面板里生成每台 VPS 的一键 Agent 安装命令
- Agent 安装脚本支持安装、升级、卸载、状态查看

优先目标不是功能堆满，而是把部署体验打磨到比哪吒更轻。

## 半自动部署基础版

已新增工程化文件：

```text
package.json
package-lock.json
wrangler.toml.example
.gitignore
.env.example
scripts/setup.mjs
scripts/init-db.mjs
```

推荐部署流程：

```bash
npm install
npm run cf:login
npm run setup
npm run deploy
npm run init-db
```

`npm run setup` 会引导：

- 设置 Worker 名称
- 创建或填写 D1 数据库
- 生成 `wrangler.toml`
- 写入 `USERNAME`
- 默认自动生成强密码并写入 `PASSWORD`，也可选择手动输入
- 自动生成并写入 `JWT_SECRET`
- 配置 Cron

默认用户名为 `admin`。自动生成的密码只会在终端显示一次，需要立即保存。

注意：

- `wrangler.toml` 包含用户自己的 D1 ID，已加入 `.gitignore`
- `node_modules/` 已加入 `.gitignore`
- 上传 GitHub 时应保留 `wrangler.toml.example`
- 公开发布前需要确认许可证，原始上游仓库目前未看到明确 LICENSE 文件
