# 面包探针

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/hhbread/bread-cloudflare-probe)

**Bread Cloudflare Probe** 是一个 Cloudflare 原生服务器探针项目。

面板部署在 Cloudflare Workers 上，数据存储在 Cloudflare D1 中，服务器通过轻量 Agent 定时上报状态。目标是做一个轻量、易部署、低维护的服务器监控面板，适合个人、小团队和多云服务器管理。

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
bread-probe-agent.sh   服务器 Agent 安装和管理脚本
cf-vps-monitor.sh      原项目兼容脚本，保留用于旧版卸载和回滚
scripts/               部署、初始化和辅助脚本
wrangler.toml.example  Wrangler 配置模板
package.json           npm 命令入口
PROJECT_PLAN.md        二开路线
DEPLOYMENT_NOTES.md    部署和踩坑记录
```

## 部署

### 方式一：Deploy to Cloudflare

点击 README 顶部的 **Deploy to Cloudflare** 按钮，Cloudflare 会根据仓库里的 `wrangler.jsonc` 引导部署 Worker、D1 和 Cron。

部署完成后，先访问一次：

```text
https://你的-worker-url/api/init-db
```

然后访问：

```text
https://你的-worker-url/login
```

生产环境建议在 Cloudflare Worker 的 Variables and Secrets 中设置：

```text
USERNAME
PASSWORD
JWT_SECRET
```

### 方式二：本地 Wrangler 部署

安装依赖：

```bash
npm install
```

登录 Cloudflare：

```bash
npm run cf:login
```

运行引导配置：

```bash
npm run setup
```

默认情况下，脚本会使用 `admin` 作为用户名，并自动生成一个强密码。密码只会在终端显示一次，请及时保存。

部署 Worker：

```bash
npm run deploy
```

初始化 D1 数据库：

```bash
npm run init-db
```

登录后台：

```text
https://你的-worker-url/login
```

## 添加服务器

后台添加服务器后，复制面板生成的一键 Agent 安装命令，在对应服务器上执行。

安装成功后可以检查：

```bash
systemctl status bread-probe-agent --no-pager
journalctl -u bread-probe-agent -n 50 --no-pager
```

如需手动安装，命令格式如下：

```bash
wget https://raw.githubusercontent.com/hhbread/bread-cloudflare-probe/main/bread-probe-agent.sh -O bread-probe-agent.sh
chmod +x bread-probe-agent.sh
./bread-probe-agent.sh -i -k API_KEY -s SERVER_ID -u https://你的-worker-url
```

卸载新版 Agent：

```bash
./bread-probe-agent.sh uninstall
```

旧版兼容卸载：

```bash
wget https://raw.githubusercontent.com/hhbread/bread-cloudflare-probe/main/cf-vps-monitor.sh -O cf-vps-monitor.sh
chmod +x cf-vps-monitor.sh
./cf-vps-monitor.sh uninstall
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
- 增强通知通道
- 逐步拆分 `worker.js`
- 做成可维护、可发布的开源项目

## 致谢

本项目基于 [kadidalax/cf-vps-monitor](https://github.com/kadidalax/cf-vps-monitor) 二次开发。感谢原作者提供 Cloudflare Workers + D1 监控面板的基础实现和部署思路。

## 许可证

待确认。正式发布到 GitHub 前需要补充 `LICENSE`。
