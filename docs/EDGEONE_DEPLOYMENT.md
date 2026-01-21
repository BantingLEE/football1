# EdgeOne Pages 部署指南

本指南将帮助你将 Football Manager Game 前端部署到腾讯云 EdgeOne Pages 平台。

## 部署模式说明

EdgeOne Pages 支持两种部署模式：

### 1. 静态站点生成 (SSG) - 推荐用于 EdgeOne
- **适用场景**: 纯前端展示，内容不经常变化
- **优点**: 部署简单，加载速度快，全球 CDN 加速
- **限制**: 不支持服务端渲染，API 需要独立部署
- **当前配置**: 已在 `next.config.js` 中配置 `output: 'export'`

### 2. 服务端渲染 (SSR) / 增量静态再生 (ISR)
- **适用场景**: 需要动态内容或 SEO 优化
- **优点**: 支持动态数据，更好的 SEO
- **限制**: 需要配置 `output: 'standalone'`
- **注意**: EdgeOne Pages 已支持 SSR，但需要额外配置

## 部署前准备

### 1. 准备后端服务

由于使用静态导出模式，需要先部署后端 API 服务：

**选项 A: 部署到腾讯云 SCF (云函数) + API 网关**
- 将微服务部署为云函数
- 通过 API 网关统一暴露接口
- 获取 API 网关访问地址

**选项 B: 部署到腾讯云 CVM (云服务器)**
- 使用 Docker Compose 部署所有微服务
- 配置 Nginx 反向代理
- 绑定域名并配置 SSL

**选项 C: 部署到腾讯云 TKE (容器服务)**
- 使用现有的 Kubernetes 配置
- 创建 LoadBalancer 服务
- 获取外部访问地址

### 2. 安装 EdgeOne CLI

```bash
npm install -g @tencent-cloud/edgeone-cli
```

### 3. 配置环境变量

复制环境变量示例文件：

```bash
cd frontend
cp .env.production.example .env.production
```

编辑 `.env.production`，填入实际的后端服务地址：

```env
OUTPUT_MODE=export
NEXT_PUBLIC_API_URL=https://your-backend-api.example.com
NEXT_PUBLIC_WS_URL=wss://your-backend-api.example.com
```

## 部署步骤

### 方法一: 通过 EdgeOne 控制台部署（推荐）

#### 1. 创建 EdgeOne Pages 项目

1. 登录 [EdgeOne Pages 控制台](https://pages.edgeone.ai)
2. 点击「创建新项目」
3. 选择「从 Git 仓库导入」

#### 2. 连接 Git 仓库

**使用 GitHub:**
- 授权 GitHub 账号
- 选择你的 football-manager 仓库
- 选择 `master` 分支

**使用 Gitee:**
- 授权 Gitee 账号
- 选择你的仓库
- 选择 `master` 分支

#### 3. 配置构建设置

在「构建设置」中填入以下信息：

```yaml
框架: Next.js
构建命令: npm run build
输出目录: out
安装命令: npm install
Node.js 版本: 20.x
环境变量:
  - OUTPUT_MODE=export
  - NEXT_PUBLIC_API_URL=https://your-backend-api.example.com
  - NEXT_PUBLIC_WS_URL=wss://your-backend-api.example.com
```

#### 4. 配置域名

1. 在「域名设置」中添加自定义域名（可选）
2. 或使用 EdgeOne 提供的免费域名：`your-project.pages.edgeone.ai`

#### 5. 开始部署

点击「部署」按钮，等待构建完成（约 2-5 分钟）。

---

### 方法二: 使用 EdgeOne CLI 部署

#### 1. 登录 EdgeOne

```bash
edgeone login
```

#### 2. 初始化项目

```bash
cd frontend
edgeone init
```

#### 3. 配置项目

按照提示配置项目信息：
- 项目名称: `football-manager-game`
- 框架: `Next.js`
- 构建命令: `npm run build`
- 输出目录: `out`

#### 4. 本地预览

```bash
edgeone dev
```

#### 5. 部署到生产环境

```bash
edgeone deploy --prod
```

---

### 方法三: 手动部署静态文件

#### 1. 构建静态文件

```bash
cd frontend
npm install
npm run build
```

构建完成后，静态文件会输出到 `frontend/out` 目录。

#### 2. 上传到对象存储 (COS)

```bash
# 安装 COSCMD
pip install coscmd

# 配置 COS
coscmd config -a <SecretId> -s <SecretKey> -b <bucket> -r <region>

# 上传文件
coscmd upload -r out/ / --delete
```

#### 3. 配置静态网站托管

1. 登录 [腾讯云 COS 控制台](https://console.cloud.tencent.com/cos)
2. 选择对应的存储桶
3. 开启「静态网站托管」
4. 设置索引文档为 `index.html`
5. 配置 CDN 加速

---

## 部署后配置

### 1. 配置 API 代理

如果后端 API 和前端不在同一个域名，需要配置 CORS：

**在 `edgeone.json` 中配置重写规则：**

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-api.example.com/api/:path*"
    }
  ]
}
```

### 2. 配置 WebSocket 连接

如果应用使用 WebSocket 进行实时通信，确保：

1. 后端 WebSocket 服务已配置好 SSL
2. 前端使用 `wss://` 协议连接
3. 在 EdgeOne 控制台配置 WebSocket 支持

### 3. 配置缓存策略

在 `edgeone.json` 中已配置了缓存策略：

- 静态资源（`/static/*`）: 缓存 1 年
- HTML 文件: 不缓存，每次都从服务器获取
- API 请求: 不缓存

---

## 更新部署

### 自动部署

配置 Git 仓库的 Webhook 后，每次推送到 `master` 分支会自动触发部署。

### 手动部署

在 EdgeOne 控制台点击「重新部署」按钮。

---

## 故障排查

### 问题 1: 构建失败

**可能原因:**
- Node.js 版本不匹配（需要 18.x 或 20.x）
- 依赖安装失败
- 构建配置错误

**解决方案:**
```bash
# 本地测试构建
cd frontend
rm -rf node_modules .next out
npm install
npm run build
```

### 问题 2: API 请求失败

**可能原因:**
- CORS 配置错误
- API 地址配置错误
- 后端服务未启动

**解决方案:**
1. 检查浏览器控制台的网络请求
2. 确认后端服务正常运行
3. 检查 CORS 配置

### 问题 3: 页面 404

**可能原因:**
- 路由配置错误
- 静态文件未正确生成

**解决方案:**
```bash
# 检查生成的文件
ls -la out/
```

确保 `out/` 目录下有 `index.html` 和其他页面文件。

---

## 性能优化建议

### 1. 启用 CDN 加速

EdgeOne Pages 默认启用全球 CDN 加速，确保：

- 静态资源使用了 CDN 域名
- 配置了合适的缓存策略

### 2. 图片优化

由于静态导出禁用了 Next.js 的图片优化，建议：

- 使用 WebP 格式图片
- 控制图片尺寸
- 使用图片压缩工具

### 3. 代码分割

Next.js 默认进行代码分割，确保：

- 使用动态导入（`dynamic import`）
- 按路由加载代码

---

## 成本估算

EdgeOne Pages 免费额度：
- 100GB 每月流量
- 100万 每月请求
- 5GB 存储

超出部分按量计费：
- 流量: 0.21 元/GB
- 请求: 0.5 元/100万次

---

## 相关资源

- [EdgeOne Pages 官方文档](https://pages.edgeone.ai/zh/document)
- [Next.js 静态导出文档](https://nextjs.net.cn/docs/pages/guides/static-exports)
- [腾讯云 API 网关文档](https://cloud.tencent.com/document/product/628)
- [项目仓库](https://github.com/your-username/football-manager)

---

## 后续步骤

部署完成后：

1. ✅ 配置自定义域名（可选）
2. ✅ 启用 HTTPS（EdgeOne 自动配置）
3. ✅ 配置监控告警
4. ✅ 设置自动备份
5. ✅ 优化 SEO 元数据

需要帮助？查看 [故障排查文档](./TROUBLESHOOTING.md)
