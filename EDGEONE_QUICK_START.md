# 快速部署到 EdgeOne Pages

> 🚀 3 分钟将 Football Manager Game 前端部署到腾讯云 EdgeOne Pages

## 前置条件

- [ ] 已有腾讯云账号（如果没有，[免费注册](https://cloud.tencent.com/register)）
- [ ] 代码已推送到 GitHub 或 Gitee 仓库
- [ ] 后端 API 服务已部署（如未部署，见下方说明）

---

## 快速开始（3 步完成部署）

### 第 1 步：准备代码

```bash
# 确保配置正确
cat frontend/next.config.js
```

确认 `output: 'export'` 配置存在（已配置 ✅）

### 第 2 步：推送代码到 Git 仓库

**选项 A：使用 Gitee（推荐，国内更快）**

```bash
# 添加 Gitee 远程仓库
git remote add gitee https://gitee.com/YOUR_USERNAME/football-manager.git

# 推送代码
git push -u gitee master
```

**选项 B：使用 GitHub**

```bash
# 使用 Personal Access Token
git remote add origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/football-manager.git
git push -u origin master
```

### 第 3 步：在 EdgeOne Pages 创建项目

1. 访问 [EdgeOne Pages 控制台](https://pages.edgeone.ai)
2. 点击「创建新项目」
3. 选择 Git 平台（GitHub 或 Gitee）
4. 选择你的 `football-manager` 仓库
5. 使用以下配置：

```yaml
框架: Next.js
工作目录: frontend
构建命令: npm run build
输出目录: out
安装命令: npm install
Node.js 版本: 20.x
环境变量:
  OUTPUT_MODE: export
  NODE_ENV: production
```

6. 点击「部署」

> **⚠️ 关键说明**：
> - 必须设置 **工作目录** 为 `frontend`，否则会在根目录安装依赖导致 `@shared` 包名错误
> - 由于工作目录是 `frontend`，输出目录应该是 `out` 而不是 `frontend/out`

---

## 部署后配置

### 配置 API 地址

部署完成后，需要配置前端连接到后端 API：

**在 EdgeOne Pages 控制台：**

1. 进入「设置」→「环境变量」
2. 添加以下环境变量：

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.example.com
NEXT_PUBLIC_WS_URL=wss://your-backend-api.example.com
```

3. 点击「保存并重新部署」

### 获取访问地址

部署成功后，你会得到：
- EdgeOne 提供的免费域名：`your-project.pages.edgeone.ai`
- 或绑定的自定义域名

---

## 后端服务部署（如果尚未部署）

由于使用静态导出模式，需要单独部署后端服务：

### 快速方案：使用腾讯云轻量应用服务器

```bash
# 在服务器上运行
git clone https://github.com/YOUR_USERNAME/football-manager.git
cd football-manager

# 使用 Docker Compose 部署所有微服务
docker-compose -f docker-compose.prod.yml up -d
```

### 或使用云函数 + API 网关

参考 [后端部署指南](./docs/BACKEND_DEPLOYMENT.md)

---

## 常见问题

### Q: 构建失败怎么办？

```bash
# 本地测试构建
cd frontend
npm install
npm run build
```

如果本地构建成功，检查 EdgeOne 的 Node.js 版本是否为 20.x。

### Q: 如何连接到后端 API？

1. 确保后端服务已部署并运行
2. 在 EdgeOne 控制台配置环境变量 `NEXT_PUBLIC_API_URL`
3. 重新部署前端

### Q: 如何更新网站？

推送到 Git 仓库后，EdgeOne 会自动触发重新部署。

---

## 费用说明

EdgeOne Pages 免费额度：
- ✅ 100GB/月 流量
- ✅ 100万次/月 请求
- ✅ 5GB 存储

对于个人项目，免费额度完全够用！

---

## 下一步

- [ ] 配置自定义域名（可选）
- [ ] 启用监控和告警
- [ ] 配置自动备份
- [ ] 优化性能和 SEO

查看完整文档：[EdgeOne 部署完整指南](./docs/EDGEONE_DEPLOYMENT.md)

---

## 需要帮助？

- [EdgeOne Pages 文档](https://pages.edgeone.ai/zh/document)
- [Next.js 静态导出文档](https://nextjs.net.cn/docs/pages/guides/static-exports)
- [提交问题](https://github.com/YOUR_USERNAME/football-manager/issues)
