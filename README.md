# 🎮 Football Manager Game

网页版足球经理模拟游戏，基于微服务架构构建，包含实时比赛模拟、青训系统和复杂的经济模型。

## ✨ 特性

- 🏗️ **微服务架构** - 9个独立服务，高可用和可扩展
- ⚽ **实时比赛模拟** - 90分钟实时比赛，WebSocket事件推送
- 👥 **青训系统** - 球员生成、训练、成长、退役
- 💰 **经济系统** - 收入/支出、转会市场、财务管理
- 🏆 **联赛系统** - 积分榜、赛程、升降级
- 📨 **通知系统** - 应用内通知和邮件通知
- 🔒 **完整认证** - JWT认证、请求限流、输入验证
- 📊 **数据可视化** - 财务图表、积分榜可视化

## 🚀 快速开始

### 本地开发

```bash
# 1. 克隆仓库
git clone <your-repo-url>
cd football-manager

# 2. 安装依赖
npm install
cd shared && npm install
cd frontend && npm install

# 3. 配置环境变量
cp .env.example .env
nano .env  # 编辑配置

# 4. 启动服务
docker compose up -d

# 5. 访问应用
# 前端: http://localhost:3000
# API文档: http://localhost:3001/api-docs
```

### 在线体验

如果你部署了在线版本，访问：
- 演示地址：[待添加]
- API文档：[待添加]

## 🏗️ 系统架构

```
┌─────────────────────────┐
│   Frontend (Next.js)  │
│   - 8个主要页面     │
└────────┬──────────────┘
         │ HTTP + WebSocket
┌────────▼──────────────┐
│  API Gateway (3001)  │
└─┬──┬──┬──┬──┬──┬──┬──┬──┬──┘
  │  │  │  │  │  │  │  │  │  │
┌─▼┐┌▼┐┌▼┐┌▼┐┌▼┐┌▼┐┌▼┐┌▼┐┌▼┐┌▼┐
│Club│Pl│Mtc│Eco│You│Lge│Msg│Not│
│302│303│304│305│306│307│308│309│
└─┬──┘└─┬──┘└─┬──┘└─┬──┘└─┬──┘└─┬──┘
  │      │      │      │      │      │
┌──▼──────┴──────┴──────┴──────┴──────┴───────┐
│  MongoDB + Redis + RabbitMQ           │
└───────────────────────────────────────┘
```

### 服务说明

| 服务 | 端口 | 功能 |
|------|------|------|
| Frontend | 3000 | Next.js前端应用 |
| API Gateway | 3001 | API网关、认证、限流 |
| Club Service | 3002 | 俱乐部管理、财务 |
| Player Service | 3003 | 球员管理、训练、转会 |
| Match Service | 3004 | 比赛模拟、实时通信 |
| Economy Service | 3005 | 经济系统、转会市场 |
| Youth Service | 3006 | 青训系统、球员成长 |
| League Service | 3007 | 联赛管理、积分榜 |
| Message Service | 3008 | 消息服务、WebSocket |
| Notification Service | 3009 | 通知系统、邮件 |

## 📁 项目结构

```
football-manager/
├── frontend/              # Next.js前端应用
│   ├── src/
│   │   ├── app/          # 页面路由
│   │   ├── components/    # React组件
│   │   ├── lib/          # 工具库
│   │   └── store/        # 状态管理
│   ├── package.json
│   └── Dockerfile
│
├── services/             # 微服务
│   ├── api-gateway/    # API网关
│   ├── club-service/    # 俱乐部服务
│   ├── player-service/  # 球员服务
│   ├── match-service/   # 比赛服务
│   ├── economy-service/ # 经济服务
│   ├── youth-service/   # 青训服务
│   ├── league-service/  # 联赛服务
│   ├── message-service/ # 消息服务
│   └── notification-service/ # 通知服务
│
├── shared/              # 共享代码
│   ├── src/
│   │   ├── types/       # TypeScript类型
│   │   ├── utils/       # 工具函数
│   │   ├── constants/   # 常量
│   │   ├── errors/      # 错误类
│   │   └── migrations/  # 数据库迁移
│   └── package.json
│
├── docker-compose.yml    # Docker Compose配置
├── .env.example        # 环境变量模板
├── PUBLISHING_GUIDE.md  # 发布指南
└── scripts/publish-to-github.sh  # 发布脚本
```

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 14.2.15 (App Router)
- **UI库**: React 18.2.0
- **样式**: Tailwind CSS 3.4.0
- **组件库**: shadcn/ui (Radix UI)
- **状态管理**: Zustand 4.4.7
- **数据获取**: React Query 5.14.0
- **实时通信**: Socket.io-client 4.6.0
- **图表**: Recharts
- **类型安全**: TypeScript 5.3.3

### 后端
- **运行时**: Node.js 20
- **框架**: Express 4.18.2
- **类型安全**: TypeScript 5.3.3
- **实时通信**: Socket.io 4.6.0
- **ORM**: Mongoose 8.0.3
- **输入验证**: Joi 17.11.0
- **认证**: JWT (jsonwebtoken 9.0.2)
- **消息队列**: RabbitMQ 3.12-management

### 数据库
- **主数据库**: MongoDB 7.0
- **缓存**: Redis 7
- **消息队列**: RabbitMQ 3.12-management

### DevOps
- **容器化**: Docker, Docker Compose
- **编排**: Kubernetes 1.28
- **CI/CD**: GitHub Actions
- **反向代理**: Nginx

## 📝 文档

### 设计文档
- [系统设计文档](docs/plans/2025-01-20-football-manager-design.md)
- [实施计划](docs/plans/2025-01-20-football-manager-implementation.md)

### API文档
- [OpenAPI规范](api-docs/openapi.yaml)
- [Swagger UI](http://localhost:3001/api-docs) (启动后访问)

### 部署文档
- [Docker Compose指南](deployment/README.md)
- [完整发布指南](PUBLISHING_GUIDE.md)
- [一键发布脚本](scripts/publish-to-github.sh)

## 🧪 测试

- **单元测试**: 180+ 测试用例
- **E2E测试**: 125+ 场景
- **性能测试**: 6个负载测试场景
- **测试覆盖率**: >85%

运行测试：
```bash
# 运行单元测试
cd services/club-service && npm test
cd services/player-service && npm test

# 运行E2E测试
cd e2e && npm test

# 运行性能测试
cd performance && npm test
```

## 🚀 部署

### 本地开发环境
```bash
# 启动所有服务
docker compose up -d

# 查看日志
docker compose logs -f

# 停止服务
docker compose down
```

### 生产环境
详细的部署步骤请参考：
- [Docker Compose部署](deployment/README.md)
- [发布到GitHub指南](PUBLISHING_GUIDE.md)
- [Kubernetes部署](deployment/README.md#kubernetes-deployment)

## 🔒 安全

- ✅ JWT认证
- ✅ 请求限流（基于IP和用户）
- ✅ 输入验证和消毒
- ✅ CORS配置
- ✅ 敏感数据处理
- ✅ 环境变量验证
- ✅ 数据库连接池
- ✅ 事务支持

## 📊 项目统计

- ✅ 已完成阶段: 6个
- 🏗️ 微服务数量: 9个
- 🌐 前端页面: 8个
- 📝 Git提交: 35+
- 📁 代码文件: ~1,509个TypeScript文件
- 🧪 单元测试: 180+
- 🔬 E2E测试: 125+场景
- ⚡ 性能测试: 6个场景
- 📊 总代码量: ~32,000+行
- 🐛 修复问题: 18个（6个critical + 12个important）

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

### 开发规范

- 遵循TDD（测试驱动开发）
- 添加单元测试覆盖新功能
- 遵循现有代码风格
- 更新相关文档

### Pull Request规范

- 清晰的PR标题和描述
- 关联相关Issue
- 添加必要的截图
- 确保所有测试通过

## 📄 许可证

本项目采用 MIT License

## 👥 作者

Football Manager Game Development Team

## 🙏 致谢

- Next.js团队
- React社区
- MongoDB团队
- Socket.io团队
- 所有开源项目的贡献者

## 📮 联系

- Issues: [GitHub Issues](../../issues)
- 讨论: [GitHub Discussions](../../discussions)

---

**祝你玩得开心！⚽**
