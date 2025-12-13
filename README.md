# 班级押分系统

一个简洁美观的班级娱乐押分平台，支持用户注册、押注、签到等功能。

## 功能特点

- ✅ 用户注册登录（用户名+密码）
- ✅ 新用户注册赠送100万金币
- ✅ 每日签到赠送5万-100万随机金币
- ✅ 管理员创建押分项目
- ✅ 玩家押注选项
- ✅ 按比例分配奖池（可扩展其他计算方式）
- ✅ 出结果前可继续押注，不可撤回
- ✅ 简洁美观的界面设计

## 技术栈

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- Vercel Postgres (Neon)
- bcryptjs (密码加密)
- jose (JWT认证)

## 部署到 Vercel

### 1. 准备工作

1. Fork 或上传此代码到 GitHub 仓库
2. 在 [Vercel](https://vercel.com) 注册账号

### 2. 创建数据库

1. 在 Vercel Dashboard 中，进入 Storage 标签页
2. 点击 "Create Database"
3. 选择 "Postgres" (Powered by Neon)
4. 选择区域并创建数据库
5. 创建后，进入数据库详情页，切换到 ".env.local" 标签页
6. 复制 `POSTGRES_PRISMA_URL` 和 `POSTGRES_URL_NON_POOLING` 的值

### 3. 部署应用

1. 在 Vercel Dashboard 中，点击 "New Project"
2. 导入你的 GitHub 仓库
3. 在环境变量配置中添加：
   - `POSTGRES_PRISMA_URL`: 从数据库页面复制
   - `POSTGRES_URL_NON_POOLING`: 从数据库页面复制
   - `JWT_SECRET`: 随机生成一个安全的密钥（例如：使用 `openssl rand -base64 32`）
4. 点击 "Deploy"

### 4. 初始化数据库

部署成功后，需要运行数据库迁移：

```bash
# 方法1：在本地运行（推荐）
# 在本地克隆项目，创建 .env 文件并填入环境变量
npm install
npx prisma migrate dev
npx prisma db push

# 方法2：使用 Vercel CLI
vercel env pull .env.local
npm install
npx prisma db push
```

### 5. 创建管理员账号

应用部署后，你需要手动创建一个管理员账号：

1. 在网站注册一个普通账号
2. 在 Vercel Postgres 数据库的 "Data" 页面，或使用数据库客户端执行：

```sql
UPDATE "User" SET "isAdmin" = true WHERE username = 'your-admin-username';
```

## 本地开发

1. 克隆项目

```bash
git clone <your-repo-url>
cd bet-app
```

2. 安装依赖

```bash
npm install
```

3. 配置环境变量

创建 `.env` 文件：

```env
POSTGRES_PRISMA_URL="your-postgres-url"
POSTGRES_URL_NON_POOLING="your-postgres-non-pooling-url"
JWT_SECRET="your-secret-key"
```

4. 初始化数据库

```bash
npx prisma generate
npx prisma db push
```

5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 使用说明

### 普通用户

1. 注册账号，获得100万金币
2. 每日签到获得随机金币奖励
3. 浏览押分项目，选择选项押注
4. 等待项目结算，查看是否中奖

### 管理员

1. 创建押分项目，添加多个选项
2. 玩家押注后，可以截止押注
3. 公布答案时，选择正确选项并结算
4. 系统自动按比例分配奖池给中奖玩家

## 奖励计算说明

当前使用按比例分配的方式：

1. 所有押注金额进入总奖池
2. 管理员设置正确答案后触发结算
3. 押中正确答案的玩家按照其押注金额占正确选项总金额的比例分配奖池
4. 未押中的玩家不获得任何奖励

计算公式：
```
玩家奖励 = 总奖池 × (玩家押注金额 / 正确选项总押注金额)
```

系统设计支持扩展其他计算方式（通过 `calculationType` 字段）。

## License

MIT
