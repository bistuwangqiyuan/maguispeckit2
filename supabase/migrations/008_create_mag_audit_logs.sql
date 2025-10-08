-- Migration: 008_create_mag_audit_logs
-- Description: 创建系统审计日志表
-- Created: 2025-10-08

-- 创建系统审计日志表
CREATE TABLE IF NOT EXISTS mag_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 用户信息
  user_id UUID REFERENCES mag_users(id),
  user_email TEXT,
  
  -- 操作信息
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  
  -- 详细信息
  details JSONB DEFAULT '{}',
  
  -- 请求信息
  ip_address INET,
  user_agent TEXT,
  
  -- 结果
  status TEXT CHECK (status IN ('success', 'failure', 'error')),
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE mag_audit_logs IS '系统审计日志表 - 记录所有关键操作';
COMMENT ON COLUMN mag_audit_logs.action IS '操作类型: create, read, update, delete, login, logout等';
COMMENT ON COLUMN mag_audit_logs.resource_type IS '资源类型: project, defect, file, report等';

-- 启用RLS
ALTER TABLE mag_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS策略：用户可以查看自己的日志
CREATE POLICY "Users can view own logs"
  ON mag_audit_logs FOR SELECT
  USING (user_id = auth.uid());

-- RLS策略：管理员可以查看所有日志
CREATE POLICY "Admins can view all logs"
  ON mag_audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mag_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 创建索引
CREATE INDEX idx_mag_audit_logs_user_id ON mag_audit_logs(user_id);
CREATE INDEX idx_mag_audit_logs_action ON mag_audit_logs(action);
CREATE INDEX idx_mag_audit_logs_resource ON mag_audit_logs(resource_type, resource_id);
CREATE INDEX idx_mag_audit_logs_created_at ON mag_audit_logs(created_at DESC);
CREATE INDEX idx_mag_audit_logs_status ON mag_audit_logs(status);

