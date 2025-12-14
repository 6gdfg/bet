# 快速部署指南

## 1. 推送代码到 GitHub

```bash
git push origin main
```

## 2. 在 Vercel 创建 Postgres 数据库

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **Storage** 标签页
3. 点击 **Create Database**
4. 选择 **Postgres** (Powered by Neon)
5. 选择区域（推荐选择与你物理位置接近的区域）
6. 点击创建

创建完成后：
- 切换到 **.env.local** 标签页
- 复制 `POSTGRES_PRISMA_URL` 的值
- 复制 `POSTGRES_URL_NON_POOLING` 的值

## 3. 部署应用到 Vercel

1. 在 Vercel Dashboard 点击 **New Project**
2. 导入你的 GitHub 仓库
3. 配置环境变量（Environment Variables）：

```env
POSTGRES_PRISMA_URL=你复制的值
POSTGRES_URL_NON_POOLING=你复制的值
JWT_SECRET=随机生成的密钥
```

生成 JWT_SECRET（在本地运行）：
```bash
# macOS/Linux
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

4. 点击 **Deploy**

## 4. 初始化数据库

部署成功后，在项目的 **Storage** 标签页：
1. 连接刚才创建的 Postgres 数据库
2. 在 **Data** 标签页，点击 **Query** 按钮
3. 复制并运行以下 SQL（初始化数据库表）：

```sql
-- Prisma 会自动创建表结构，但你需要确保数据库已连接
-- 如果表没有自动创建，可以在本地运行：
-- npx prisma db push
```

或者使用 Vercel CLI：
```bash
# 安装 Vercel CLI
npm i -g vercel

# 拉取环境变量到本地
vercel env pull .env.local

# 初始化数据库
npx prisma db push
```

## 5. 创建管理员账号

1. 访问你的网站，注册一个普通账号
2. 在 Vercel Postgres 的 **Data** 页面，运行以下 SQL：

```sql
UPDATE "User"
SET "isAdmin" = true
WHERE username = 'your-admin-username';
```

将 `your-admin-username` 替换为你注册的用户名。

## 6. 完成！

现在你可以：
- ✅ 使用管理员账号创建押分项目
- ✅ 普通用户可以注册、签到、押注
- ✅ 管理员可以截止项目并结算奖池

## 常见问题

### 构建失败怎么办？

检查环境变量是否正确配置：
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `JWT_SECRET`

### 数据库连接错误？

确保：
1. Postgres 数据库已创建
2. 环境变量正确复制（包括前缀和后缀）
3. 在 Storage 标签页将数据库连接到项目

### 如何更新代码？

```bash
git add .
git commit -m "更新说明"
git push origin main
```

Vercel 会自动重新部署。

## 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量（创建 .env 文件）
POSTGRES_PRISMA_URL="..."
POSTGRES_URL_NON_POOLING="..."
JWT_SECRET="..."

# 初始化数据库
npx prisma db push

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000
