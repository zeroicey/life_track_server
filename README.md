# Life Track Server

一个基于 Hono.js 的生活追踪系统后端服务，帮助用户更好地管理生活的各个方面。

## 技术栈

- **框架**: [Hono.js](https://hono.dev/)
- **数据库**: 
  - MongoDB (主数据库)
  - PostgreSQL (备用数据库)
- **ORM/ODM**: 
  - Mongoose (MongoDB)
  - Drizzle ORM (PostgreSQL)
- **运行时**: Bun
- **语言**: TypeScript

## 功能模块

### 1. 备忘录模块 (已完成)
- 备忘录管理（CRUD）
- 分组管理（CRUD）
- 支持文件附件（最多9个）

### 2. 任务模块 (开发中)
- 功能描述待补充
- ...

### 3. 文章模块 (开发中)
- 功能描述待补充
- ...

### 4. 习惯模块 (开发中)
- 功能描述待补充
- ...

### 5. 收集模块 (开发中)
- 功能描述待补充
- ...

## 环境准备

### 数据库服务启动

1. MongoDB 启动 (Docker)
```bash
docker run -d \
  --name mongo \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin \
  -v mongo-data:/data/db \
  -p 27017:27017 \
  mongo:latest
```

2. PostgreSQL 启动 (Docker)
```bash
docker run -d \
  --name postgres \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=life_track \
  -v pg-data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15-alpine
```

3. 应用服务启动 (Docker)
```bash
# 构建镜像
docker build -t life_track-server .

# 运行容器
docker run -d \
  --name life_track-server \
  -p 3000:3000 \
  -e MONGO_URL="mongodb://admin:admin@mongo:27017/life_track?authSource=admin" \
  -e POSTGRES_URL="postgresql://admin:admin@postgres:5432/life_track" \
  life_track-server
```

## 项目运行
To change the port and database url, you can modify the `.env` file.

To install dependencies:
```sh
bun install
```

To run:
```sh
bun run dev
```

open http://localhost:3000
