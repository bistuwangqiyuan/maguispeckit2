-- Migration: 002_create_mag_projects  
-- Description: 创建磁检测项目表
-- Created: 2025-10-08

-- 创建磁检测项目表
CREATE TABLE IF NOT EXISTS mag_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_name TEXT NOT NULL,
  project_code TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- 管道信息
  pipeline_spec JSONB NOT NULL DEFAULT '{}',
  
  -- 检测信息
  detection_type TEXT NOT NULL CHECK (detection_type IN ('mfl', 'mpi', 'ultrasonic')),
  detection_standard TEXT,
  
  -- 项目状态
  status TEXT NOT NULL DEFAULT 'preparing' CHECK (status IN ('preparing', 'in_progress', 'completed', 'archived')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- 时间信息
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  
  -- 人员信息
  created_by UUID REFERENCES mag_users(id),
  operator_id UUID REFERENCES mag_users(id),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE mag_projects IS '磁检测项目表';
COMMENT ON COLUMN mag_projects.pipeline_spec IS '管道规格JSON: {diameter, wallThickness, material, length}';
COMMENT ON COLUMN mag_projects.detection_type IS '检测类型: mfl(漏磁), mpi(磁粉), ultrasonic(超声)';

-- 启用RLS
ALTER TABLE mag_projects ENABLE ROW LEVEL SECURITY;

-- RLS策略：用户可以查看自己创建的项目
CREATE POLICY "Users can view own projects"
  ON mag_projects FOR SELECT
  USING (auth.uid() = created_by OR auth.uid() = operator_id);

-- RLS策略：工程师可以创建项目
CREATE POLICY "Engineers can create projects"
  ON mag_projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mag_users
      WHERE id = auth.uid() AND role IN ('engineer', 'admin')
    )
  );

-- RLS策略：工程师可以更新自己的项目
CREATE POLICY "Engineers can update own projects"
  ON mag_projects FOR UPDATE
  USING (
    (auth.uid() = created_by OR auth.uid() = operator_id)
    AND EXISTS (
      SELECT 1 FROM mag_users
      WHERE id = auth.uid() AND role IN ('engineer', 'admin')
    )
  );

-- 创建索引
CREATE INDEX idx_mag_projects_status ON mag_projects(status);
CREATE INDEX idx_mag_projects_created_by ON mag_projects(created_by);
CREATE INDEX idx_mag_projects_created_at ON mag_projects(created_at DESC);
CREATE INDEX idx_mag_projects_project_code ON mag_projects(project_code);

