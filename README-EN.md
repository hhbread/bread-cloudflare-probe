# Bread Cloudflare Probe

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/hhbread/bread-cloudflare-probe)

**Bread Cloudflare Probe** is a Cloudflare-native server monitoring panel.

The dashboard runs on Cloudflare Workers, stores data in Cloudflare D1, and receives periodic reports from lightweight probe agents. The goal is to provide a simple, low-maintenance monitoring system for personal servers and small teams.

## Features

- Server online / offline status
- CPU, memory, disk, network, and uptime reporting
- Website uptime checks
- Telegram notifications
- Generic webhook notification channels
- Notification templates with variables
- Cloudflare Workers + D1 deployment

## Quick Start

### Option 1: Deploy to Cloudflare

Click the **Deploy to Cloudflare** button above. Cloudflare will use `wrangler.jsonc` to guide Worker, D1, and Cron provisioning.

After deployment, initialize the database:

```text
https://your-worker-url/api/init-db
```

Then open:

```text
https://your-worker-url/login
```

For production use, set these Worker Variables and Secrets:

```text
USERNAME
PASSWORD
JWT_SECRET
```

### Option 2: Local Wrangler Deploy

Install dependencies:

```bash
npm install
```

Login to Cloudflare:

```bash
npm run cf:login
```

Run the guided setup:

```bash
npm run setup
```

By default, setup uses `admin` as the username and generates a strong random password. Save the password when it is printed. Cloudflare secrets cannot be viewed later.

Deploy the Worker:

```bash
npm run deploy
```

Initialize the D1 database:

```bash
npm run init-db
```

Then open:

```text
https://your-worker-url/login
```

## Commands

```bash
npm run setup       # Generate wrangler.toml and configure secrets
npm run deploy      # Deploy the Worker
npm run init-db     # Initialize D1 tables
npm run update      # Deploy updates
npm run check       # Syntax-check worker.js
npm run cf:login    # Login to Cloudflare
```

## Notification Variables

Webhook templates support:

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

## Status

This project is in early development. The first goal is to make Cloudflare-native deployment and server monitoring simple and reliable.

## Credits

This project is based on [kadidalax/cf-vps-monitor](https://github.com/kadidalax/cf-vps-monitor). Many thanks to the original author for the Cloudflare Workers + D1 monitoring foundation and deployment approach.

## License

To be decided before public GitHub release.
