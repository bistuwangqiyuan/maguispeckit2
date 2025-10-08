-- Migration: 010_create_views_functions_triggers
-- Description: 创建视图、函数和触发器
-- Created: 2025-10-08

-- ========================================
-- 视图 (Views)
-- ========================================

-- 项目统计视图
CREATE OR REPLACE VIEW mag_project_statistics AS
SELECT 
  p.id AS project_id,
  p.project_name,
  p.project_code,
  p.status,
  p.priority,
  COUNT(DISTINCT d.id) AS defect_count,
  COUNT(DISTINCT CASE WHEN d.severity_level = 'critical' THEN d.id END) AS critical_defects,
  COUNT(DISTINCT CASE WHEN d.severity_level = 'high' THEN d.id END) AS high_defects,
  COUNT(DISTINCT CASE WHEN d.severity_level = 'medium' THEN d.id END) AS medium_defects,
  COUNT(DISTINCT CASE WHEN d.severity_level = 'low' THEN d.id END) AS low_defects,
  COUNT(DISTINCT f.id) AS file_count,
  COALESCE(SUM(f.file_size), 0) AS total_file_size,
  COUNT(DISTINCT dt.id) AS data_points_count,
  COUNT(DISTINCT r.id) AS report_count,
  p.created_at,
  p.updated_at
FROM mag_projects p
LEFT JOIN mag_defects d ON d.project_id = p.id
LEFT JOIN mag_files f ON f.project_id = p.id
LEFT JOIN mag_detection_data dt ON dt.project_id = p.id
LEFT JOIN mag_reports r ON r.project_id = p.id
GROUP BY p.id, p.project_name, p.project_code, p.status, p.priority, p.created_at, p.updated_at;

COMMENT ON VIEW mag_project_statistics IS '项目统计视图 - 汇总项目的缺陷、文件、数据点、报告等统计信息';

-- ========================================
-- 函数 (Functions)
-- ========================================

-- 1. 创建项目函数
CREATE OR REPLACE FUNCTION create_mag_project(
  p_project_name TEXT,
  p_project_code TEXT,
  p_pipeline_spec JSONB,
  p_detection_type TEXT,
  p_detection_standard TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_project_id UUID;
BEGIN
  INSERT INTO mag_projects (
    project_name,
    project_code,
    pipeline_spec,
    detection_type,
    detection_standard,
    description,
    created_by,
    operator_id,
    status
  ) VALUES (
    p_project_name,
    p_project_code,
    p_pipeline_spec,
    p_detection_type,
    p_detection_standard,
    p_description,
    auth.uid(),
    auth.uid(),
    'preparing'
  )
  RETURNING id INTO v_project_id;
  
  -- 记录审计日志
  INSERT INTO mag_audit_logs (user_id, user_email, action, resource_type, resource_id, status)
  SELECT auth.uid(), u.email, 'create', 'project', v_project_id, 'success'
  FROM mag_users u WHERE u.id = auth.uid();
  
  RETURN v_project_id;
END;
$$;

COMMENT ON FUNCTION create_mag_project IS '创建磁检测项目并记录审计日志';

-- 2. 获取项目统计函数
CREATE OR REPLACE FUNCTION get_project_statistics(p_project_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_defects', COUNT(DISTINCT d.id),
    'critical_defects', COUNT(DISTINCT CASE WHEN d.severity_level = 'critical' THEN d.id END),
    'high_defects', COUNT(DISTINCT CASE WHEN d.severity_level = 'high' THEN d.id END),
    'data_points', COUNT(DISTINCT dt.id),
    'files', COUNT(DISTINCT f.id),
    'total_file_size', COALESCE(SUM(f.file_size), 0),
    'reports', COUNT(DISTINCT r.id)
  )
  INTO result
  FROM mag_projects p
  LEFT JOIN mag_defects d ON d.project_id = p.id
  LEFT JOIN mag_detection_data dt ON dt.project_id = p.id
  LEFT JOIN mag_files f ON f.project_id = p.id
  LEFT JOIN mag_reports r ON r.project_id = p.id
  WHERE p.id = p_project_id;
  
  RETURN result;
END;
$$;

COMMENT ON FUNCTION get_project_statistics IS '获取指定项目的统计信息';

-- 3. 记录审计日志函数
CREATE OR REPLACE FUNCTION log_audit(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::JSONB,
  p_status TEXT DEFAULT 'success'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO mag_audit_logs (
    user_id,
    user_email,
    action,
    resource_type,
    resource_id,
    details,
    status
  )
  SELECT 
    auth.uid(),
    u.email,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    p_status
  FROM mag_users u
  WHERE u.id = auth.uid()
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

COMMENT ON FUNCTION log_audit IS '记录审计日志';

-- 4. 批量插入检测数据函数
CREATE OR REPLACE FUNCTION insert_detection_data_batch(
  p_project_id UUID,
  p_data JSONB
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO mag_detection_data (
    project_id,
    data_sequence,
    channel_id,
    distance_mm,
    angle_deg,
    magnetic_field_gauss,
    amplitude_value,
    timestamp_ms
  )
  SELECT 
    p_project_id,
    (data->>'data_sequence')::INTEGER,
    data->>'channel_id',
    (data->>'distance_mm')::DECIMAL,
    (data->>'angle_deg')::DECIMAL,
    (data->>'magnetic_field_gauss')::DECIMAL,
    (data->>'amplitude_value')::DECIMAL,
    (data->>'timestamp_ms')::BIGINT
  FROM jsonb_array_elements(p_data) AS data;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION insert_detection_data_batch IS '批量插入检测数据 - 提高性能';

-- ========================================
-- 触发器 (Triggers)
-- ========================================

-- 1. 更新updated_at时间戳触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 应用到各表
CREATE TRIGGER update_mag_users_updated_at
  BEFORE UPDATE ON mag_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mag_projects_updated_at
  BEFORE UPDATE ON mag_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mag_defects_updated_at
  BEFORE UPDATE ON mag_defects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mag_configurations_updated_at
  BEFORE UPDATE ON mag_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mag_reports_updated_at
  BEFORE UPDATE ON mag_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 2. 项目状态变更审计触发器
CREATE OR REPLACE FUNCTION audit_project_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO mag_audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      details,
      status
    )
    VALUES (
      auth.uid(),
      'update_status',
      'project',
      NEW.id,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status
      ),
      'success'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_project_status
  AFTER UPDATE ON mag_projects
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION audit_project_status_change();

-- 3. 严重缺陷自动创建告警触发器
CREATE OR REPLACE FUNCTION create_alert_for_critical_defect()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.severity_level = 'critical' THEN
    INSERT INTO mag_alerts (
      project_id,
      alert_type,
      alert_level,
      title,
      message,
      details,
      status
    )
    VALUES (
      NEW.project_id,
      'defect_critical',
      'critical',
      '发现严重缺陷',
      '检测到严重级别缺陷: ' || COALESCE(NEW.defect_code, NEW.id::TEXT),
      jsonb_build_object(
        'defect_id', NEW.id,
        'defect_type', NEW.defect_type,
        'position', NEW.position_data
      ),
      'active'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER alert_critical_defect
  AFTER INSERT ON mag_defects
  FOR EACH ROW
  WHEN (NEW.severity_level = 'critical')
  EXECUTE FUNCTION create_alert_for_critical_defect();

COMMENT ON TRIGGER alert_critical_defect ON mag_defects IS '当插入严重级别缺陷时自动创建告警';

