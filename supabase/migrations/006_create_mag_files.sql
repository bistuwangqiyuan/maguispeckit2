-- Migration: 006_create_mag_files
-- Description: 创建文件管理表
-- Created: 2025-10-08

-- 创建文件管理表
CREATE TABLE IF NOT EXISTS mag_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES mag_projects(id) ON DELETE CASCADE,
  
  -- 文件信息
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT,
  
  -- 存储路径
  storage_path TEXT NOT NULL,
  storage_bucket TEXT DEFAULT 'mag-detection-files',
  
  -- 文件分类
  category TEXT CHECK (category IN ('raw_data', 'report', 'config', 'image', 'other')),
  tags TEXT[],
  
  -- 元数据
  metadata JSONB DEFAULT '{}',
  
  -- 上传信息
  uploaded_by UUID REFERENCES mag_users(id),
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  
  -- 访问控制
  is_public BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE mag_files IS '文件管理表';
COMMENT ON COLUMN mag_files.file_type IS '文件类型: dat, csv, pdf, json等';
COMMENT ON COLUMN mag_files.category IS '文件分类: raw_data(原始数据), report(报告), config(配置), image(图片), other(其他)';

-- 启用RLS
ALTER TABLE mag_files ENABLE ROW LEVEL SECURITY;

-- RLS策略：用户可以查看关联项目的文件
CREATE POLICY "Users can view project files"
  ON mag_files FOR SELECT
  USING (
    is_public = true
    OR uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM mag_projects p
      WHERE p.id = project_id
      AND (p.created_by = auth.uid() OR p.operator_id = auth.uid())
    )
  );

-- RLS策略：用户可以上传文件
CREATE POLICY "Users can upload files"
  ON mag_files FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid()
    AND (
      project_id IS NULL
      OR EXISTS (
        SELECT 1 FROM mag_projects p
        WHERE p.id = project_id
        AND (p.created_by = auth.uid() OR p.operator_id = auth.uid())
      )
    )
  );

-- RLS策略：用户可以删除自己上传的文件
CREATE POLICY "Users can delete own files"
  ON mag_files FOR DELETE
  USING (uploaded_by = auth.uid());

-- 创建索引
CREATE INDEX idx_mag_files_project_id ON mag_files(project_id);
CREATE INDEX idx_mag_files_category ON mag_files(category);
CREATE INDEX idx_mag_files_uploaded_at ON mag_files(uploaded_at DESC);
CREATE INDEX idx_mag_files_uploaded_by ON mag_files(uploaded_by);

