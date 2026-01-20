# 网页版模拟经营足球游戏 - 系统设计文档

## 项目概述

开发一个基于微服务架构的完整版俱乐部经营模拟足球游戏，包含实时比赛模拟、青训系统和复杂的经济模型。

**核心需求：**
- 俱乐部经营模拟（类似FIFA经理模式）
- 完整版规模（多联赛、深度模拟）
- 实时比赛模拟
- 青训与球员发展系统
- 复杂的经济模型

**技术栈：**
- 前端：Next.js 14+ + TypeScript + Tailwind CSS + shadcn/ui
- 后端：Node.js + Express/Fastify + TypeScript
- 数据库：MongoDB + Redis
- 消息队列：RabbitMQ 或 Redis Stream
- 实时通信：Socket.io

## 系统架构

### 微服务架构

系统采用微服务架构，包含以下核心服务：

1. **前端应用** - Next.js应用，提供用户界面和交互
2. **API网关** - 统一入口，处理认证、路由和限流
3. **俱乐部服务** - 管理俱乐部信息、球队阵容、战术配置
4. **球员服务** - 管理球员数据、属性、成长系统
5. **比赛服务** - 实时比赛模拟引擎，处理比赛逻辑
6. **经济服务** - 处理财务、转会、赞助收入
7. **青训服务** - 管理青训系统、新球员生成
8. **联赛服务** - 管理赛程、排名、历史记录
9. **消息服务** - 使用WebSocket推送实时更新
10. **通知服务** - 处理游戏内通知和邮件

### 通信机制

- 所有服务通过REST API通信
- 实时数据通过WebSocket推送
- 异步任务使用消息队列（RabbitMQ/Redis Stream）

### 部署架构

- 开发环境：Docker Compose
- 生产环境：Kubernetes
- 反向代理：Nginx
- MongoDB副本集保证数据可用性
- Redis集群支持缓存和队列

## 数据库设计

### MongoDB集合结构

#### Clubs - 俱乐部信息
```typescript
{
  _id: ObjectId,
  name: string,
  foundedYear: number,
  city: string,
  stadium: {
    name: string,
    capacity: number
  },
  finances: {
    budget: number,
    cash: number,
    incomeHistory: Array,
    expenseHistory: Array
  },
  youthFacility: {
    level: number, // 1-5
    capacity: number,
    trainingQuality: number
  },
  tacticalPreference: {
    formation: string,
    attacking: number, // 0-100
    defending: number // 0-100
  }
}
```

#### Players - 球员数据
```typescript
{
  _id: ObjectId,
  name: string,
  age: number,
  nationality: string,
  height: number,
  weight: number,
  position: string,
  attributes: {
    speed: number,
    shooting: number,
    passing: number,
    defending: number,
    physical: number,
    technical: number,
    mental: number
  },
  potential: number, // 0-99
  currentAbility: number, // 0-99
  contract: {
    salary: number,
    expiresAt: Date,
    bonus: number
  },
  injury: {
    isInjured: boolean,
    type: string,
    recoveryTime: number
  },
  history: {
    matchesPlayed: number,
    goals: number,
    assists: number,
    growthLog: Array
  },
  clubId: ObjectId
}
```

#### Matches - 比赛数据
```typescript
{
  _id: ObjectId,
  homeTeam: {
    clubId: ObjectId,
    score: number,
    lineup: Array,
    tactics: Object
  },
  awayTeam: {
    clubId: ObjectId,
    score: number,
    lineup: Array,
    tactics: Object
  },
  date: Date,
  leagueId: ObjectId,
  status: 'scheduled' | 'live' | 'completed',
  events: [
    {
      minute: number,
      type: 'goal' | 'shot' | 'foul' | 'corner' | 'substitution',
      playerId: ObjectId,
      description: string
    }
  ],
  statistics: {
    possession: { home: number, away: number },
    shots: { home: number, away: number },
    corners: { home: number, away: number },
    fouls: { home: number, away: number }
  },
  playerRatings: Map<ObjectId, number>
}
```

#### Transfers - 转会记录
```typescript
{
  _id: ObjectId,
  playerId: ObjectId,
  fromClub: ObjectId,
  toClub: ObjectId,
  fee: number,
  status: 'offered' | 'negotiating' | 'medical' | 'completed',
  timeline: Array,
  paymentTerms: {
    upfront: number,
    installments: number,
    sellOnPercentage?: number
  }
}
```

#### Leagues - 联赛信息
```typescript
{
  _id: ObjectId,
  name: string,
  country: string,
  season: {
    start: Date,
    end: Date
  },
  rules: {
    promotionSlots: number,
    relegationSlots: number,
    pointsWin: 3,
    pointsDraw: 1,
    pointsLoss: 0
  },
  standings: [
    {
      clubId: ObjectId,
      played: number,
      won: number,
      drawn: number,
      lost: number,
      goalsFor: number,
      goalsAgainst: number,
      points: number
    }
  ],
  schedule: Array
}
```

#### Economy - 经济数据
```typescript
{
  _id: ObjectId,
  clubId: ObjectId,
  period: {
    type: 'week' | 'month' | 'year',
    startDate: Date,
    endDate: Date
  },
  income: {
    ticketSales: number,
    broadcasting: number,
    sponsorships: number,
    merchandise: number,
    other: number
  },
  expenses: {
    wages: number,
    transfers: number,
    operations: number,
    penalties: number,
    other: number
  },
  netProfit: number
}
```

## 比赛模拟引擎

### 比赛初始化
- 加载双方球队阵容和战术配置
- 根据球员能力值和战术设置初始参数
- 生成比赛的随机种子

### 实时模拟循环
- 比赛时间以1:1或1:2比例实时推进
- 每分钟评估：场上态势、球员体力、战术执行度
- 事件生成：射门、传球、犯规、角球、进球等
- 每个事件通过WebSocket推送到前端

### 战术系统
- 支持多种阵型（4-4-2、4-3-3、3-5-2等）
- 战术指令：进攻强度、防守高度、传球风格
- 实时调整：教练可以半场换人、改变战术

### 球员表现模型
- 基础能力 × 战术匹配度 × 当前体力 = 实际表现
- 随机因素影响关键事件
- 伤病系统：高风险动作、碰撞、体力透支

### 比赛结算
- 生成详细统计
- 球员评分系统
- 更新联赛积分榜和球员状态

## 经济系统

### 收入管理
- **比赛日收入**：门票销售（基于球场容量、上座率、票价）
- **转播收入**：根据联赛排名和转播合同分成
- **赞助收入**：球衣赞助、球场命名、合作伙伴
- **商业收入**：商品销售、季票、会员费

### 支出管理
- **工资支出**：球员和教练组薪资（每周结算）
- **转会支出**：一次性转会费、分期付款
- **运营成本**：球场维护、青训设施、员工工资
- **惩罚支出**：财务公平法案违规、违反联赛规则

### 财务周期
- **周结算**：工资、日常运营
- **月结算**：赞助分成、商业收入
- **年结算**：奖金、利润分红、税务

### 转会市场
- 球员估值算法：基于年龄、能力、合同剩余年限
- 转会流程：报价→谈判→体检→签约
- 贷款和买断条款支持
- 自由球员市场管理

## 青训系统

### 青训设施等级
- 1-5级设施，影响新球员质量上限
- 设施升级成本：资金+时间
- 最大容纳球员数量基于设施等级

### 新球员生成
- 每周生成1-3名新球员（基于设施等级）
- 年龄范围：14-18岁
- 潜力分布：低（20%）、中（50%）、高（30%）
- 国家籍：基于俱乐部所在国家和青训声誉

### 球员成长系统
- 训练类型：技术训练、体能训练、战术理解、心理素质
- 成长速度：基于年龄、教练水平、训练设施
- 黄金年龄：16-22岁快速成长，23-28岁稳定，29+衰退
- 伤病影响成长速度

### 青训运营
- 招募网络：全球招募、本地聚焦
- 球探系统：评估年轻球员潜力
- 青训比赛：内部联赛、友谊赛
- 一队提拔：球员达到特定能力后可进入一线队

### 球员退役系统
- 35-40岁强制退役
- 退役后可成为教练或球探
- 传奇球员退役后获得俱乐部加成

## 前端UI/UX设计

### 主要页面
1. **仪表盘**：俱乐部总览、财务概览、下一场比赛、重要通知
2. **球队管理**：阵容查看、战术配置、球员列表
3. **转会市场**：搜索球员、转会列表、球员详情
4. **比赛中心**：比赛日界面、实时比赛观赛、历史比赛
5. **青训系统**：青训设施、年轻球员、训练营
6. **经济中心**：财务报表、收入支出、预算管理
7. **联赛积分榜**：实时排名、赛程、历史数据

### 实时比赛界面
- 3D或2D球场视图（使用Canvas/WebGL）
- 实时比分和比赛时间
- 实时事件滚动条
- 战术调整面板（换人、改变阵型、战术强度）
- 球员评分实时更新

### 交互设计原则
- 响应式设计，支持桌面和移动端
- 使用shadcn/ui组件保证一致性
- 暗色/亮色主题切换
- 关键操作需要确认
- 数据可视化：图表展示财务趋势、球员成长曲线

### 状态管理
- 使用Zustand管理全局状态
- 使用React Query管理服务器状态缓存
- WebSocket连接管理实时数据更新

### 性能优化
- 代码分割和懒加载
- 图片优化和CDN
- 虚拟滚动处理长列表
- 防抖和节流优化用户输入

## 项目结构

```
football-manager/
├── frontend/              # Next.js前端应用
│   ├── app/              # App Router页面
│   ├── components/       # UI组件
│   ├── lib/              # 工具库
│   └── services/         # API客户端
├── services/
│   ├── api-gateway/      # API网关服务
│   ├── club-service/     # 俱乐部服务
│   ├── player-service/   # 球员服务
│   ├── match-service/    # 比赛服务
│   ├── economy-service/  # 经济服务
│   ├── youth-service/    # 青训服务
│   ├── league-service/   # 联赛服务
│   └── notification-service/ # 通知服务
├── shared/               # 共享代码（类型定义、工具）
├── docker-compose.yml    # 开发环境配置
├── kubernetes/           # 生产环境K8s配置
└── docs/
    ├── plans/            # 设计文档
    └── api/              # API文档
```

## 开发计划

### 第一阶段：基础设施搭建
- 项目初始化和目录结构
- Docker Compose环境配置
- MongoDB和Redis设置
- API网关基础框架

### 第二阶段：核心服务开发
- 俱乐部服务和球员服务
- 数据模型实现
- 基础API端点

### 第三阶段：比赛系统
- 比赛模拟引擎
- 实时WebSocket通信
- 前端比赛界面

### 第四阶段：经济和青训系统
- 经济服务实现
- 青训服务实现
- 转会市场

### 第五阶段：前端完善
- 所有页面实现
- UI/UX优化
- 性能优化

### 第六阶段：测试和部署
- 单元测试和集成测试
- CI/CD流水线
- 生产环境部署

## 技术亮点

1. **微服务架构**：模块化、可扩展、高可用
2. **实时比赛模拟**：沉浸式观赛体验
3. **复杂经济模型**：真实的俱乐部运营挑战
4. **深度青训系统**：长期策略和球员培养
5. **现代化前端**：Next.js 14+、TypeScript、shadcn/ui
6. **容器化部署**：Docker + Kubernetes

## 后续扩展

- 多人联机模式
- 更多联赛和球员数据
- 高级战术系统
- 球员心理和士气系统
- 新闻和媒体系统
- 赛季成就和奖励系统
