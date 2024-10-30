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

### 2. 模块二 (开发中)
- 功能描述待补充
- ...

### 3. 模块三 (开发中)
- 功能描述待补充
- ...

### 4. 模块四 (开发中)
- 功能描述待补充
- ...

### 5. 模块五 (开发中)
- 功能描述待补充
- ...

## 项目结构

```
DATABASE_URL=postgres://admin:admin@life_track-db:5432/life_track
```

To install dependencies:
```sh
bun install
```

To run:
```sh
bun run dev
```

open http://localhost:3000
