# Supabase数据库设置指南

**项目**: MagSpecKit - 磁检测仪器系统  
**日期**: 2025-10-08  
**版本**: v1.0.0

---

## 📋 目录

1. [前置要求](#前置要求)
2. [安装Supabase CLI](#安装supabase-cli)
3. [连接项目](#连接项目)
4. [应用数据库迁移](#应用数据库迁移)
5. [插入种子数据](#插入种子数据)
6. [验证数据库](#验证数据库)
7. [常见问题](#常见问题)

---

## 前置要求

### 1. Supabase项目信息

确认您有以下信息：

```
项目URL: https://zzyueuweeoakopuuwfau.supabase.co
项目引用ID: zzyueuweeoakopuuwfau
匿名密钥: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
服务角色密钥: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. 系统要求

- Node.js 18+ 或 npm
- Git
- 终端/命令行工具

---

## 安装Supabase CLI

### 方式1: 使用npm (推荐)

```bash
npm install -g supabase
```

### 方式2: 使用pnpm

```bash
pnpm add -g supabase
```

### 方式3: 直接下载二进制文件

**Windows**:
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**macOS**:
```bash
brew install supabase/tap/supabase
```

**Linux**:
```bash
curl -o- https://raw.githubusercontent.com/supabase/cli/main/install.sh | bash
```

### 验证安装

```bash
supabase --version
```

应该显示类似: `1.100.0` 或更高版本

---

## 连接项目

### 1. 登录Supabase

```bash
supabase login
```

这将打开浏览器，要求您登录Supabase账户。登录后，CLI会自动获取访问令牌。

### 2. 链接到项目

在项目根目录执行：

```bash
cd C:\Users\wangqiyuan\project\cursor\maguispeckit2

supabase link --project-ref zzyueuweeoakopuuwfau
```

**输出示例**:
```
Linked to project zzyueuweeoakopuuwfau
```

### 3. 验证连接

```bash
supabase status
```

**输出示例**:
```
Project ID: zzyueuweeoakopuuwfau
API URL: https://zzyueuweeoakopuuwfau.supabase.co
GraphQL URL: https://zzyueuweeoakopuuwfau.supabase.co/graphql/v1
DB URL: postgresql://postgres:[PASSWORD]@db.zzyueuweeoakopuuwfau.supabase.co:5432/postgres
```

---

## 应用数据库迁移

### 方式1: 使用Supabase CLI推送 (推荐)

```bash
# 应用所有迁移文件
supabase db push
```

**输出示例**:
```
Applying migration 001_create_mag_users.sql...
Applying migration 002_create_mag_projects.sql...
Applying migration 003_create_mag_detection_data.sql...
Applying migration 004_create_mag_defects.sql...
Applying migration 005_create_mag_configurations.sql...
Applying migration 006_create_mag_files.sql...
Applying migration 007_create_mag_reports.sql...
Applying migration 008_create_mag_audit_logs.sql...
Applying migration 009_create_mag_alerts.sql...
Applying migration 010_create_views_functions_triggers.sql...
✅ All migrations applied successfully!
```

### 方式2: 手动执行SQL (备用方案)

如果CLI无法使用，可以手动执行SQL：

1. 登录Supabase控制台: https://supabase.com/dashboard
2. 选择项目 `zzyueuweeoakopuuwfau`
3. 进入 **SQL Editor**
4. 按顺序执行每个迁移文件：

```sql
-- 复制粘贴 supabase/migrations/001_create_mag_users.sql 的内容
-- 点击 "Run" 执行
-- 重复执行 002 到 010 的所有迁移文件
```

---

## 插入种子数据

### 1. 应用种子数据

```bash
supabase db seed
```

**或手动执行**:

```bash
# 使用psql连接数据库
psql postgresql://postgres:[PASSWORD]@db.zzyueuweeoakopuuwfau.supabase.co:5432/postgres -f supabase/seed.sql
```

### 2. 验证种子数据

在Supabase控制台的 **Table Editor** 中检查：

- `mag_users`: 应该有4个用户
- `mag_projects`: 应该有3个项目
- `mag_defects`: 应该有4条缺陷记录
- `mag_detection_data`: 应该有100条数据点

---

## 验证数据库

### 1. 检查表结构

```bash
# 列出所有表
supabase db list

# 或使用SQL查询
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'mag_%'
ORDER BY table_name;
```

**预期输出**:
```
mag_alerts
mag_audit_logs
mag_configurations
mag_defects
mag_detection_data
mag_files
mag_projects
mag_reports
mag_users
```

### 2. 检查视图

```sql
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public'
  AND table_name LIKE 'mag_%';
```

**预期输出**:
```
mag_project_statistics
```

### 3. 检查函数

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name LIKE '%mag%'
ORDER BY routine_name;
```

**预期输出**:
```
create_mag_project
get_project_statistics
log_audit
insert_detection_data_batch
```

### 4. 测试RLS策略

```sql
-- 检查表的RLS是否启用
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE 'mag_%'
ORDER BY tablename;
```

所有表的 `rowsecurity` 应该是 `t` (true)。

### 5. 测试API访问

使用cURL测试REST API：

```bash
curl -X GET "https://zzyueuweeoakopuuwfau.supabase.co/rest/v1/mag_projects?select=*" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**预期输出**: JSON格式的项目列表

---

## 常见问题

### Q1: "permission denied" 错误

**问题**: 
```
Error: permission denied for table mag_users
```

**解决方案**:
1. 确认使用了正确的 `SUPABASE_SERVICE_ROLE_KEY`
2. 检查RLS策略是否正确配置
3. 如果是在本地测试，使用service_role key而不是anon key

### Q2: 迁移文件顺序错误

**问题**:
```
Error: relation "mag_users" does not exist
```

**解决方案**:
迁移文件必须按顺序执行（001, 002, 003...）。如果手动执行，请确保顺序正确。

### Q3: CLI连接超时

**问题**:
```
Error: timeout connecting to database
```

**解决方案**:
1. 检查网络连接
2. 确认Supabase项目处于活动状态
3. 尝试使用VPN或更换网络

### Q4: 种子数据插入失败

**问题**:
```
Error: duplicate key value violates unique constraint
```

**解决方案**:
1. 检查是否已经插入过种子数据
2. 如果需要重新插入，先清空相关表：
```sql
TRUNCATE mag_users, mag_projects, mag_defects, 
         mag_detection_data, mag_configurations,
         mag_files, mag_reports, mag_alerts,
         mag_audit_logs CASCADE;
```

### Q5: RLS策略测试失败

**问题**: 在客户端无法访问数据

**解决方案**:
1. 确认使用正确的JWT token
2. 检查用户角色是否正确
3. 在Supabase控制台的 **Authentication** 中验证用户信息

---

## 高级操作

### 1. 重置数据库 (⚠️ 危险操作)

```bash
# 删除所有表
supabase db reset

# 重新应用迁移
supabase db push

# 重新插入种子数据
supabase db seed
```

### 2. 备份数据库

```bash
# 导出数据库结构和数据
pg_dump postgresql://postgres:[PASSWORD]@db.zzyueuweeoakopuuwfau.supabase.co:5432/postgres > backup.sql
```

### 3. 查看迁移历史

```bash
supabase migration list
```

### 4. 生成TypeScript类型

```bash
supabase gen types typescript --project-id zzyueuweeoakopuuwfau > types/supabase.ts
```

---

## 下一步

数据库设置完成后，您可以：

1. ✅ 在前端代码中初始化Supabase客户端
2. ✅ 开始开发用户认证功能
3. ✅ 实现项目管理CRUD操作
4. ✅ 开发实时数据采集功能

---

## 参考资源

- [Supabase CLI文档](https://supabase.com/docs/guides/cli)
- [Supabase REST API文档](https://supabase.com/docs/guides/api)
- [Supabase RLS文档](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL文档](https://www.postgresql.org/docs/)

---

## 支持

如遇到问题，请：
1. 查看 [常见问题](#常见问题) 章节
2. 查看Supabase官方文档
3. 联系开发团队

---

**文档版本**: v1.0.0  
**最后更新**: 2025-10-08  
**维护人**: 开发团队

---

<div align="center">

**数据库设置完成后，您就可以开始开发了！🚀**

[返回主文档](../README.md) • [查看技术计划](../specs/001-web/plan.md)

</div>

