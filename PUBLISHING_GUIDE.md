# 🚀 Football Manager Game - 发布到网上

本指南提供多种发布方式，根据你的需求选择合适的方式。

## 📋 发布前准备

### 1. 创建GitHub账号（如果还没有）
- 访问 https://github.com
- 注册新账号
- 验证邮箱

### 2. 创建新的GitHub仓库
- 登录GitHub后，点击右上角"+"
- 选择"New repository"
- 填写信息：
  - **Repository name**: `football-manager-game`（或你喜欢的名称）
  - **Description**: 网页版足球经理模拟游戏 - 基于微服务架构
  - **Visibility**: Public（公开）或Private（私有）
  - **Initialize repository**: 不勾选（我们已经有了代码）
- 点击"Create repository"

### 3. 本地Git配置更新（重要！）

**方法A：使用HTTPS（推荐新手）**
```bash
# 在项目目录执行
git remote set-url origin https://github.com/YOUR_USERNAME/football-manager-game.git
```

**方法B：使用SSH（推荐，更安全）**
```bash
# 1. 生成SSH密钥
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 2. 复制公钥内容
cat ~/.ssh/id_rsa.pub

# 3. 在GitHub添加SSH密钥
# GitHub > Settings > SSH and GPG keys > New SSH key
# 粘贴公钥内容，添加标题

# 4. 配置远程仓库
git remote set-url origin git@github.com:YOUR_USERNAME/football-manager-game.git
```

### 4. 更新敏感信息

**删除.env文件中的密码：**
```bash
# 确认.env不在git仓库中
echo ".env" >> .gitignore
git add .gitignore
git commit -m "chore: ensure .env is in .gitignore"
```

**生产环境secrets准备：**
```bash
# 生成安全的JWT密钥
openssl rand -base64 64 | head -c 32

# 生成MongoDB强密码
openssl rand -base64 32 | head -c 32

# 生成RabbitMQ强密码
openssl rand -base64 32 | head -c 32
```

## 📤 方式1：推送到GitHub（推荐）

### 步骤1：创建并推送所有分支

```bash
# 1. 创建main分支（如果不存在）
git branch -M main

# 2. 推送到GitHub
git push -u origin main
```

### 步骤2：推送所有分支（如果有多分支）

```bash
# 查看所有分支
git branch -a

# 推送所有分支
git push -u origin --all
```

### 步骤3：验证上传

```bash
# 在GitHub网页上查看仓库
# https://github.com/YOUR_USERNAME/football-manager-game
```

### 步骤4：添加项目描述和标签

在GitHub仓库页面：
1. 点击"Settings"标签
2. **Repository name**: football-manager-game
3. **Description**: 网页版足球经理模拟游戏
4. **Website**: （可选）部署后的网站地址
5. 添加topics: `football`, `game`, `simulation`, `microservices`, `nextjs`, `mongodb`

## 🌐 方式2：部署到云平台并公开访问

### 选项A：使用Vercel（最简单，适合前端）

**部署前端到Vercel：**

```bash
# 1. 安装Vercel CLI
npm i -g vercel

# 2. 登录Vercel
vercel login

# 3. 在frontend目录部署
cd frontend
vercel

# 4. 按提示操作
# 选择团队、项目名称等
# 完成后获得部署URL，如：https://football-manager.vercel.app
```

**配置API代理（重要）：**

由于后端是微服务，需要在Vercel配置API代理：

在 `vercel.json`中添加：
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "http://YOUR_BACKEND_URL/api/:path*"
    }
  ]
}
```

### 选项B：使用Railway（推荐，支持后端）

Railway支持Docker和多容器，非常适合微服务：

```bash
# 1. 安装Railway CLI
npm install -g @railway/cli

# 2. 登录Railway
railway login

# 3. 创建项目并部署服务
railway up

# 4. 按提示操作
# - 选择部署方式（Docker）
# - 添加环境变量（MongoDB、Redis、RabbitMQ连接字符串等）
# - 配置区域
```

### 选项C：使用Render（简单，全栈）

```bash
# 1. 连接GitHub仓库
# 在Render网站连接你的GitHub仓库

# 2. 创建New Web Service
# 选择仓库和根目录

# 3. 配置环境变量
# 在Render dashboard中添加所有.env中的变量

# 4. 部署
# Render会自动检测并部署
```

### 选项D：使用Zeet（免费额度最多，国内访问快）

```bash
# 1. 连接GitHub

# 2. 创建Web Service
# 选择Dockerfile：Dockerfile.k8s

# 3. 配置环境变量
# 注意：Zeet的免费MongoDB是514MB，需要升级

# 4. 部署
```

### 选项E：腾讯云（国内推荐）

**使用腾讯云Serverless部署前端：**

```bash
# 1. 安装Serverless Framework
npm install -g serverless

# 2. 配置
cd frontend
serverless deploy --stage prod

# 3. 按提示配置腾讯云账号
```

**使用腾讯云CVM部署后端：**

```bash
# 1. 购买CVM服务器
# 在腾讯云控制台购买

# 2. 安装Docker和Docker Compose
# 在CVM上执行部署脚本

# 3. 配置防火墙和安全组
# 开放3000-3009端口
```

## 🏗️ 方式3：完整云部署（生产级）

### 完整架构部署

**需要的服务：**
1. **云托管平台** - AWS、阿里云、腾讯云等
2. **数据库托管** - Atlas MongoDB、阿里云MongoDB等
3. **缓存服务** - ElastiCache、阿里云Redis等
4. **对象存储** - S3、OSS等（存储图片等）
5. **CDN** - CloudFront、阿里云CDN等
6. **域名** - 购买域名并配置DNS

### AWS部署示例

**1. 部署到EKS（Elastic Kubernetes Service）**

```bash
# 1. 安装eksctl
curl --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp

# 2. 创建EKS集群
eksctl create cluster --name football-manager \
  --region us-west-2 \
  --nodes 3 \
  --node-type t3.large

# 3. 获取kubeconfig
eksctl get kubeconfig --name football-manager > ~/.kube/config

# 4. 部署应用
kubectl apply -f kubernetes/

# 5. 配置ALB Ingress
kubectl apply -f kubernetes/ingress-aws.yaml
```

**2. 部署到RDS MongoDB**

```bash
# 在AWS控制台创建MongoDB实例
# 获取连接字符串后更新kubernetes/secrets/
```

**3. 配置Route 53**

```bash
# 购买域名：football-manager.com
# 在Route 53创建A记录指向ALB
# 配置HTTPS证书（AWS Certificate Manager）
```

### 阿里云部署示例

**使用阿里云ACK（阿里云Kubernetes）**

```bash
# 1. 创建ACK集群
# 在阿里云控制台创建托管Kubernetes集群

# 2. 配置kubeconfig
# 下载并配置kubeconfig

# 3. 部署应用
kubectl apply -f kubernetes/

# 4. 配置SLB
# 创建Server LoadBalancer类型的服务

# 5. 配置域名和HTTPS
# 在阿里云DNS配置A记录
# 使用阿里云SSL证书服务
```

## 🔄 CI/CD自动部署

### GitHub Actions自动部署

**使用现有的CI/CD流水线：**

仓库已包含 `.github/workflows/` 目录，配置了CI/CD。

**部署流程：**
1. 代码推送到GitHub → 触发CI流水线
2. 运行测试 → 验证代码质量
3. 构建Docker镜像 → 推送到容器仓库
4. 部署到Kubernetes → 自动更新服务

**如何使用：**

```bash
# 1. 设置GitHub Secrets
# GitHub仓库 > Settings > Secrets > Actions
# 添加以下secrets：
# - KUBE_CONFIG: Base64编码的kubeconfig
# - DOCKER_REGISTRY_USERNAME: 镜像仓库用户名
# - DOCKER_REGISTRY_PASSWORD: 镜像仓库密码

# 2. 推送到main分支
git push origin main

# 3. 自动部署
# GitHub Actions自动执行部署流程
```

### 查看部署状态

```bash
# 1. 在GitHub查看Actions
# 仓库 > Actions 标签

# 2. 查看部署日志
# 点击具体的workflow run

# 3. 检查部署状态
# 在Actions中可以看到每个步骤的进度
```

## 📚 项目文档和README

### 创建README.md

在仓库根目录创建 `README.md`：

```markdown
# 🎮 Football Manager Game

网页版足球经理模拟游戏，基于微服务架构构建。

## ✨ 特性

- 🏗️ 微服务架构（9个服务）
- 🎯 俱乐部管理系统
- ⚽ 球员管理系统（训练、成长）
- ⚽ 实时比赛模拟
- 💰 经济系统（转会市场、财务管理）
- 🎓 青训学院（球员生成、培养）
- 🏆 联赛系统（积分榜、赛程）
- 📨 通知系统
- 🌐 RESTful API + WebSocket
- 📊 完整测试覆盖

## 🚀 快速开始

### 本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/YOUR_USERNAME/football-manager-game.git
cd football-manager-game

# 2. 安装依赖
npm install
cd shared && npm install
cd frontend && npm install

# 3. 启动Docker Compose
docker compose up -d

# 4. 访问应用
# 前端: http://localhost:3000
# API文档: http://localhost:3001/api-docs
```

## 🏗️ 技术栈

- **前端**: Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **后端**: Node.js, Express, Socket.io
- **数据库**: MongoDB, Redis
- **消息队列**: RabbitMQ
- **容器化**: Docker, Kubernetes
- **CI/CD**: GitHub Actions

## 📝 文档

- [系统设计](docs/plans/2025-01-20-football-manager-design.md)
- [实施计划](docs/plans/2025-01-20-football-manager-implementation.md)
- [部署指南](deployment/README.md)
- [API文档](api-docs/README.md)

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

MIT License

## 👥 作者

[你的名字]

## 📄 许可证

MIT License
```

### 添加开源协议

```bash
# 在仓库根目录创建LICENSE文件
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2025 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

# 提交LICENSE
git add LICENSE
git commit -m "chore: add MIT license"
git push origin main
```

## 🎯 推荐的发布流程

### 第一阶段：开源（推荐先做）

1. ✅ 推送到GitHub（公开仓库）
2. ✅ 添加详细的README.md
3. ✅ 添加MIT许可证
4. ✅ 添加CONTRIBUTING.md（贡献指南）
5. ✅ 配置GitHub Actions CI/CD

### 第二阶段：前端部署

1. ✅ 部署前端到Vercel
   - 免费SSL证书
   - 全球CDN
   - 自动部署
   - 获得公共访问URL

2. ✅ 配置API代理
   - Vercel代理到你的后端服务
   - 或使用API Gateway的公共端点

### 第三阶段：后端部署（生产级）

**选项A：完全自托管**
1. 购买VPS服务器（如Vultr、DigitalOcean）
2. 安装Docker和Docker Compose
3. 部署所有9个微服务
4. 配置Nginx反向代理
5. 购买域名并配置DNS

**选项B：云平台托管**
1. 使用Railway或Render部署后端服务
2. 配置环境变量和数据库
3. 设置健康检查和自动扩展
4. 获得公共API端点

**选项C：云原生部署**
1. AWS EKS + RDS MongoDB
2. 阿里云ACK + MongoDB
3. 腾讯云TKE + MongoDB
4. 配置完整的监控和日志

## 🔐 安全注意事项

### 在发布前必须修改

```bash
# 1. .env.example中的密码不能使用！
# 必须在部署环境使用强密码

# 2. 检查.gitignore
echo ".env" >> .gitignore
echo "*.key" >> .gitignore
echo ".env.local" >> .gitignore

# 3. 不要硬编码任何密钥
# 所有敏感信息必须通过环境变量传递

# 4. 生产环境不要使用默认密钥
# JWT_SECRET、数据库密码等必须设置强密码
```

## 📊 项目展示

### 在GitHub仓库中添加

**设置以下内容：**

1. **Repository topics（标签）**
   - football
   - game
   - simulation
   - microservices
   - nextjs
   - mongodb
   - typescript

2. **Repository Description**
   网页版足球经理模拟游戏，基于微服务架构。包括实时比赛模拟、青训系统、经济管理、转会市场等功能。

3. **Website URL**
   部署后添加实际访问地址

4. **Open Source License**
   选择MIT License

5. **Social Preview**
   GitHub会自动生成预览链接

## 🎁 添加截图和演示

### 在README中添加

1. **应用截图**
   - 仪表盘页面
   - 球队管理
   - 比赛中心
   - 转会市场
   - 青训学院

2. **GIF演示**
   - 实时比赛过程
   - 球员训练动画
   - 转会操作流程

3. **在线演示（可选）**
   - 如果有演示环境，添加链接
   - 提供测试账号（如果需要）

## 📢 分享你的项目

### 社交媒体推广

**可以分享到的平台：**
- Reddit: r/webdev, r/gamedev, r/football
- Twitter/X: #gamedev, #webdev, #football
- Discord: 游戏开发服务器、Web开发社区
- Hacker News: Show HN
- Product Hunt: 提交产品

### 技术社区

- GitHub Trending
- Dev.to（写技术博客）
- Medium（详细教程）
- YouTube（演示视频）

## 📞 获取帮助

如果在发布过程中遇到问题：

1. **GitHub文档**
   - https://docs.github.com/
   - https://guides.github.com/activities/hello-world/

2. **Docker文档**
   - https://docs.docker.com/
   - https://docs.docker.com/compose/

3. **Kubernetes文档**
   - https://kubernetes.io/docs/
   - https://kubernetes.io/docs/tasks/

4. **Next.js文档**
   - https://nextjs.org/docs
   - https://nextjs.org/learn

## 🎉 完成后的效果

成功发布后，你将拥有：

✅ 公开的GitHub仓库
✅ 任何人都可以查看和克隆代码
✅ 可以接收社区的Issue和Pull Request
✅ CI/CD自动运行测试
✅ 部署到云平台的在线应用
✅ 公开访问的网站URL
✅ 完整的API文档
✅ 完整的项目文档

## 📋 发布检查清单

- [ ] GitHub远程仓库配置正确
- [ ] 所有代码已推送到GitHub
- [ ] .env文件不在仓库中
- [ ] 敏感信息已删除或加密
- [ ] README.md文件创建完成
- [ ] LICENSE文件创建完成
- [ ] GitHub Topics已添加
- [ ] CI/CD流水线正常工作
- [ ] 前端已部署到Vercel
- [ ] 后端已部署到云平台
- [ ] 应用可以公开访问
- [ ] HTTPS证书配置正确
- [ ] 监控和日志正常工作

祝你发布成功！🚀
