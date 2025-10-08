-- Migration: 009_create_mag_alerts
-- Description: 创建系统告警表
-- Created: 2025-10-08

-- 创建系统告警表
CREATE TABLE IF NOT EXISTS mag_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES mag_projects(id) ON DELETE CASCADE,
  
  -- 告警信息
  alert_type TEXT NOT NULL CHECK (alert_type IN ('device_error', 'data_anomaly', 'defect_critical', 'system_error')),
  alert_level TEXT NOT NULL CHECK (alert_level IN ('info', 'warning', 'error', 'critical')),
  
  -- 告警内容
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  
  -- 状态
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
  
  -- 处理信息
  acknowledged_by UUID REFERENCES mag_users(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES mag_users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE mag_alerts IS '系统告警表';
COMMENT ON COLUMN mag_alerts.alert_type IS '告警类型: device_error(设备错误), data_anomaly(数据异常), defect_critical(严重缺陷), system_error(系统错误)';
COMMENT ON COLUMN mag_alerts.alert_level IS '告警级别: info(信息), warning(警告), error(错误), critical(严重)';

-- 启用RLS
ALTER TABLE mag_alerts ENABLE ROW LEVEL SECURITY;

-- RLS策略：用户可以查看关联项目的告警
CREATE POLICY "Users can view project alerts"
  ON mag_alerts FOR SELECT
  USING (
    project_id IS NULL
    OR EXISTS (
      SELECT 1 FROM mag_projects p
      WHERE p.id = project_id
      AND (p.created_by = auth.uid() OR p.operator_id = auth.uid())
    )
  );

-- RLS策略：工程师可以更新告警状态
CREATE POLICY "Engineers can update alerts"
  ON mag_alerts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM mag_users
      WHERE id = auth.uid() AND role IN ('engineer', 'admin')
    )
  );

-- 创建索引
CREATE INDEX idx_mag_alerts_project_id ON mag_alerts(project_id);
CREATE INDEX idx_mag_alerts_type ON mag_alerts(alert_type);
CREATE INDEX idx_mag_alerts_level ON mag_alerts(alert_level);
CREATE INDEX idx_mag_alerts_status ON mag_alerts(status);
CREATE INDEX idx_mag_alerts_created_at ON mag_alerts(created_at DESC);

