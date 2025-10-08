-- Migration: 001_create_mag_users
-- Description: 创建磁检测系统用户表
-- Created: 2025-10-08

-- 创建磁检测系统用户表
CREATE TABLE IF NOT EXISTS mag_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'engineer', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE mag_users IS '磁检测系统用户表 - 存储系统用户信息和角色';
COMMENT ON COLUMN mag_users.role IS '用户角色: admin(管理员), engineer(检测工程师), viewer(查看者)';

-- 启用RLS
ALTER TABLE mag_users ENABLE ROW LEVEL SECURITY;

-- RLS策略：用户可以查看自己的信息
CREATE POLICY "Users can view own data"
  ON mag_users FOR SELECT
  USING (auth.uid() = id);

-- RLS策略：管理员可以查看所有用户
CREATE POLICY "Admins can view all users"
  ON mag_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mag_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 创建索引
CREATE INDEX idx_mag_users_email ON mag_users(email);
CREATE INDEX idx_mag_users_role ON mag_users(role);

