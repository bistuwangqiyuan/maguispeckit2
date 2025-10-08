-- Migration: 007_create_mag_reports
-- Description: 创建检测报告表
-- Created: 2025-10-08

-- 创建检测报告表
CREATE TABLE IF NOT EXISTS mag_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES mag_projects(id) ON DELETE CASCADE,
  
  -- 报告信息
  report_title TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('standard', 'simplified', 'detailed', 'custom')),
  report_template TEXT,
  
  -- 报告内容
  summary TEXT,
  conclusions TEXT,
  recommendations TEXT,
  
  -- 统计数据
  statistics JSONB DEFAULT '{}',
  
  -- 文件信息
  pdf_file_id UUID REFERENCES mag_files(id),
  excel_file_id UUID REFERENCES mag_files(id),
  word_file_id UUID REFERENCES mag_files(id),
  
  -- 报告状态
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'approved', 'archived')),
  
  -- 审批信息
  generated_by UUID REFERENCES mag_users(id),
  approved_by UUID REFERENCES mag_users(id),
  approved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE mag_reports IS '检测报告表';
COMMENT ON COLUMN mag_reports.report_type IS '报告类型: standard(标准), simplified(简化), detailed(详细), custom(自定义)';
COMMENT ON COLUMN mag_reports.statistics IS '统计数据JSON: {totalDefects, byType, bySeverity}';

-- 启用RLS
ALTER TABLE mag_reports ENABLE ROW LEVEL SECURITY;

-- RLS策略：用户可以查看关联项目的报告
CREATE POLICY "Users can view project reports"
  ON mag_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mag_projects p
      WHERE p.id = project_id
      AND (p.created_by = auth.uid() OR p.operator_id = auth.uid())
    )
  );

-- RLS策略：工程师可以创建报告
CREATE POLICY "Engineers can create reports"
  ON mag_reports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mag_projects p
      JOIN mag_users u ON u.id = auth.uid()
      WHERE p.id = project_id
      AND (p.created_by = auth.uid() OR p.operator_id = auth.uid())
      AND u.role IN ('engineer', 'admin')
    )
  );

-- RLS策略：工程师可以更新自己生成的报告
CREATE POLICY "Engineers can update own reports"
  ON mag_reports FOR UPDATE
  USING (
    generated_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM mag_users
      WHERE id = auth.uid() AND role IN ('engineer', 'admin')
    )
  );

-- 创建索引
CREATE INDEX idx_mag_reports_project_id ON mag_reports(project_id);
CREATE INDEX idx_mag_reports_status ON mag_reports(status);
CREATE INDEX idx_mag_reports_created_at ON mag_reports(created_at DESC);

