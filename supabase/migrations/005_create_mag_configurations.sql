-- Migration: 005_create_mag_configurations
-- Description: 创建检测参数配置表
-- Created: 2025-10-08

-- 创建检测参数配置表
CREATE TABLE IF NOT EXISTS mag_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES mag_projects(id) ON DELETE CASCADE,
  
  -- 配置名称
  config_name TEXT NOT NULL,
  config_type TEXT NOT NULL CHECK (config_type IN ('detection', 'gate', 'calibration', 'display')),
  
  -- 配置参数
  parameters JSONB NOT NULL DEFAULT '{}',
  
  -- 版本控制
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  
  -- 审计
  created_by UUID REFERENCES mag_users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE mag_configurations IS '检测参数配置表';
COMMENT ON COLUMN mag_configurations.config_type IS '配置类型: detection(检测参数), gate(闸门), calibration(校准), display(显示)';
COMMENT ON COLUMN mag_configurations.parameters IS '配置参数JSON - detection: {speed, gain, filter, threshold}, gate: {startPosition, width, height, type}, calibration: {zero, gain, probe}, display: {refreshRate, zoom, colors}';

-- 启用RLS
ALTER TABLE mag_configurations ENABLE ROW LEVEL SECURITY;

-- RLS策略：用户可以查看关联项目的配置
CREATE POLICY "Users can view project configurations"
  ON mag_configurations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mag_projects p
      WHERE p.id = project_id
      AND (p.created_by = auth.uid() OR p.operator_id = auth.uid())
    )
  );

-- RLS策略：工程师可以管理配置
CREATE POLICY "Engineers can manage configurations"
  ON mag_configurations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM mag_projects p
      JOIN mag_users u ON u.id = auth.uid()
      WHERE p.id = project_id
      AND (p.created_by = auth.uid() OR p.operator_id = auth.uid())
      AND u.role IN ('engineer', 'admin')
    )
  );

-- 创建索引
CREATE INDEX idx_mag_configurations_project_id ON mag_configurations(project_id);
CREATE INDEX idx_mag_configurations_type ON mag_configurations(config_type);
CREATE INDEX idx_mag_configurations_active ON mag_configurations(is_active) WHERE is_active = true;

