-- Migration: 003_create_mag_detection_data
-- Description: 创建磁检测原始数据表
-- Created: 2025-10-08

-- 创建磁检测原始数据表
CREATE TABLE IF NOT EXISTS mag_detection_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES mag_projects(id) ON DELETE CASCADE,
  
  -- 数据标识
  data_sequence INTEGER NOT NULL,
  channel_id TEXT NOT NULL,
  
  -- 位置信息
  distance_mm DECIMAL(10, 2),
  angle_deg DECIMAL(5, 2),
  
  -- 磁场数据
  magnetic_field_gauss DECIMAL(8, 4),
  amplitude_value DECIMAL(8, 4),
  
  -- 时间戳
  timestamp_ms BIGINT NOT NULL,
  
  -- 质量标记
  is_valid BOOLEAN DEFAULT true,
  quality_flag TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE mag_detection_data IS '磁检测原始数据表 - 存储高频采样数据';
COMMENT ON COLUMN mag_detection_data.channel_id IS '通道ID: axial(轴向), radial(径向), circumferential(周向)';
COMMENT ON COLUMN mag_detection_data.data_sequence IS '数据序列号';
COMMENT ON COLUMN mag_detection_data.timestamp_ms IS 'Unix时间戳（毫秒）';

-- 启用RLS
ALTER TABLE mag_detection_data ENABLE ROW LEVEL SECURITY;

-- RLS策略：用户可以查看关联项目的数据
CREATE POLICY "Users can view project detection data"
  ON mag_detection_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mag_projects p
      WHERE p.id = project_id
      AND (p.created_by = auth.uid() OR p.operator_id = auth.uid())
    )
  );

-- RLS策略：工程师可以插入数据
CREATE POLICY "Engineers can insert detection data"
  ON mag_detection_data FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mag_projects p
      JOIN mag_users u ON u.id = auth.uid()
      WHERE p.id = project_id
      AND (p.created_by = auth.uid() OR p.operator_id = auth.uid())
      AND u.role IN ('engineer', 'admin')
    )
  );

-- 创建索引
CREATE INDEX idx_mag_detection_data_project_id ON mag_detection_data(project_id);
CREATE INDEX idx_mag_detection_data_sequence ON mag_detection_data(project_id, data_sequence);
CREATE INDEX idx_mag_detection_data_timestamp ON mag_detection_data(timestamp_ms);
CREATE INDEX idx_mag_detection_data_channel ON mag_detection_data(project_id, channel_id);

