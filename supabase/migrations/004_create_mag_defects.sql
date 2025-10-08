-- Migration: 004_create_mag_defects
-- Description: 创建缺陷记录表
-- Created: 2025-10-08

-- 创建缺陷记录表
CREATE TABLE IF NOT EXISTS mag_defects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES mag_projects(id) ON DELETE CASCADE,
  
  -- 缺陷信息
  defect_type TEXT NOT NULL CHECK (defect_type IN ('corrosion', 'crack', 'weld_defect', 'wall_thinning', 'other')),
  defect_code TEXT,
  
  -- 位置信息
  position_data JSONB NOT NULL,
  
  -- 严重程度
  severity_level TEXT NOT NULL CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
  signal_amplitude DECIMAL(8, 4),
  
  -- 尺寸信息
  depth_mm DECIMAL(6, 2),
  width_mm DECIMAL(6, 2),
  length_mm DECIMAL(6, 2),
  
  -- 评估信息
  is_confirmed BOOLEAN DEFAULT false,
  confidence_score DECIMAL(4, 2),
  notes TEXT,
  
  -- 关联数据
  related_data_ids UUID[],
  image_urls TEXT[],
  
  -- 审核信息
  reviewed_by UUID REFERENCES mag_users(id),
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE mag_defects IS '缺陷记录表';
COMMENT ON COLUMN mag_defects.defect_type IS '缺陷类型: corrosion(腐蚀), crack(裂纹), weld_defect(焊缝缺陷), wall_thinning(壁厚减薄)';
COMMENT ON COLUMN mag_defects.position_data IS '位置信息JSON: {distance, angle, depth, width, length}';
COMMENT ON COLUMN mag_defects.confidence_score IS 'AI识别置信度 0-1';

-- 启用RLS
ALTER TABLE mag_defects ENABLE ROW LEVEL SECURITY;

-- RLS策略：用户可以查看关联项目的缺陷
CREATE POLICY "Users can view project defects"
  ON mag_defects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mag_projects p
      WHERE p.id = project_id
      AND (p.created_by = auth.uid() OR p.operator_id = auth.uid())
    )
  );

-- RLS策略：工程师可以创建缺陷记录
CREATE POLICY "Engineers can create defects"
  ON mag_defects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mag_projects p
      JOIN mag_users u ON u.id = auth.uid()
      WHERE p.id = project_id
      AND (p.created_by = auth.uid() OR p.operator_id = auth.uid())
      AND u.role IN ('engineer', 'admin')
    )
  );

-- RLS策略：工程师可以更新缺陷
CREATE POLICY "Engineers can update defects"
  ON mag_defects FOR UPDATE
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
CREATE INDEX idx_mag_defects_project_id ON mag_defects(project_id);
CREATE INDEX idx_mag_defects_severity ON mag_defects(severity_level);
CREATE INDEX idx_mag_defects_type ON mag_defects(defect_type);
CREATE INDEX idx_mag_defects_created_at ON mag_defects(created_at DESC);

