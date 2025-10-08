-- Supabase数据库种子数据
-- Description: 创建示例数据用于开发和测试
-- Created: 2025-10-08

-- ========================================
-- 用户数据
-- ========================================

-- 注意：实际用户通过Supabase Auth注册，这里仅作为示例
-- 在生产环境中，用户表会自动通过Auth系统填充

INSERT INTO mag_users (id, email, full_name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@magspeckit.com', '系统管理员', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'engineer1@magspeckit.com', '张工程师', 'engineer'),
  ('00000000-0000-0000-0000-000000000003', 'engineer2@magspeckit.com', '李工程师', 'engineer'),
  ('00000000-0000-0000-0000-000000000004', 'viewer@magspeckit.com', '王查看者', 'viewer')
ON CONFLICT (email) DO NOTHING;

-- ========================================
-- 项目数据
-- ========================================

INSERT INTO mag_projects (
  id,
  project_name,
  project_code,
  description,
  pipeline_spec,
  detection_type,
  detection_standard,
  status,
  priority,
  created_by,
  operator_id,
  start_date
) VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    '西气东输管道检测',
    'XQD-2025-001',
    '西气东输主管道第一期检测项目',
    '{"diameter": 406, "wallThickness": 9.52, "material": "API 5L X70", "length": 3000}'::JSONB,
    'mfl',
    'ISO 9934-1, ASTM E709',
    'in_progress',
    'high',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    now() - interval '5 days'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '石油管道维护检测',
    'SYGL-2025-002',
    '某石油公司管道年度维护检测',
    '{"diameter": 273, "wallThickness": 7.92, "material": "API 5L X52", "length": 1500}'::JSONB,
    'mfl',
    'ISO 9934-1',
    'preparing',
    'normal',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    now()
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '海底管道检测项目',
    'HDGL-2025-003',
    '海底石油管道检测',
    '{"diameter": 323, "wallThickness": 9.52, "material": "API 5L X65", "length": 5000}'::JSONB,
    'mfl',
    'ISO 9934-1, ASTM E709, API 1163',
    'completed',
    'urgent',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    now() - interval '30 days'
  )
ON CONFLICT (project_code) DO NOTHING;

-- ========================================
-- 检测数据 (示例)
-- ========================================

-- 插入一些示例检测数据
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
  '10000000-0000-0000-0000-000000000001',
  generate_series(1, 100),
  'axial',
  generate_series(1, 100) * 10.0,
  0.0,
  100.0 + (random() * 50.0 - 25.0),
  0.5 + (random() * 0.5),
  extract(epoch from now())::BIGINT * 1000 + generate_series(1, 100)
;

-- ========================================
-- 缺陷数据
-- ========================================

INSERT INTO mag_defects (
  project_id,
  defect_type,
  defect_code,
  position_data,
  severity_level,
  signal_amplitude,
  depth_mm,
  width_mm,
  length_mm,
  is_confirmed,
  confidence_score,
  notes
) VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'corrosion',
    'DEF-001',
    '{"distance": 150.5, "angle": 45.0, "depth": 2.3}'::JSONB,
    'high',
    125.5,
    2.3,
    15.0,
    80.0,
    true,
    0.92,
    '轴向腐蚀，需要修复'
  ),
  (
    '10000000-0000-0000-0000-000000000001',
    'crack',
    'DEF-002',
    '{"distance": 287.2, "angle": 120.0, "depth": 1.5}'::JSONB,
    'critical',
    156.8,
    1.5,
    5.0,
    45.0,
    true,
    0.95,
    '径向裂纹，紧急处理'
  ),
  (
    '10000000-0000-0000-0000-000000000001',
    'weld_defect',
    'DEF-003',
    '{"distance": 452.0, "angle": 0.0, "depth": 0.8}'::JSONB,
    'medium',
    98.5,
    0.8,
    8.0,
    25.0,
    false,
    0.78,
    '焊缝气孔，需进一步确认'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'wall_thinning',
    'DEF-004',
    '{"distance": 1250.0, "angle": 180.0, "depth": 3.2}'::JSONB,
    'high',
    142.3,
    3.2,
    120.0,
    200.0,
    true,
    0.88,
    '大面积壁厚减薄'
  )
;

-- ========================================
-- 配置数据
-- ========================================

INSERT INTO mag_configurations (
  project_id,
  config_name,
  config_type,
  parameters,
  is_active
) VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    '标准检测参数',
    'detection',
    '{"speed": 2.5, "gain": 60, "filter": "bandpass", "threshold": 0.5}'::JSONB,
    true
  ),
  (
    '10000000-0000-0000-0000-000000000001',
    '主闸门配置',
    'gate',
    '{"startPosition": 0, "width": 100, "height": 80, "type": "alarm"}'::JSONB,
    true
  ),
  (
    '10000000-0000-0000-0000-000000000001',
    '校准参数',
    'calibration',
    '{"zeroPoint": 0.0, "gainCalibration": 1.0, "probeOffset": 0.5}'::JSONB,
    true
  )
;

-- ========================================
-- 文件数据
-- ========================================

INSERT INTO mag_files (
  project_id,
  file_name,
  original_name,
  file_type,
  file_size,
  mime_type,
  storage_path,
  category,
  uploaded_by
) VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'detection_data_001.dat',
    'XQD-2025-001-数据文件.dat',
    'dat',
    2048000,
    'application/octet-stream',
    'projects/10000000-0000-0000-0000-000000000001/detection_data_001.dat',
    'raw_data',
    '00000000-0000-0000-0000-000000000002'
  ),
  (
    '10000000-0000-0000-0000-000000000001',
    'waveform_001.png',
    '波形图-001.png',
    'png',
    512000,
    'image/png',
    'projects/10000000-0000-0000-0000-000000000001/waveform_001.png',
    'image',
    '00000000-0000-0000-0000-000000000002'
  )
;

-- ========================================
-- 报告数据
-- ========================================

INSERT INTO mag_reports (
  project_id,
  report_title,
  report_type,
  summary,
  conclusions,
  recommendations,
  statistics,
  status,
  generated_by
) VALUES
  (
    '10000000-0000-0000-0000-000000000003',
    '海底管道检测报告',
    'standard',
    '本次检测对5000米海底管道进行了全面的漏磁检测，发现4处缺陷。',
    '总体管道状况良好，但存在1处高危缺陷需要紧急处理。',
    '建议对DEF-004壁厚减薄区域进行修复，其他缺陷纳入监控。',
    '{"totalDefects": 4, "byType": {"corrosion": 1, "crack": 1, "weld_defect": 1, "wall_thinning": 1}, "bySeverity": {"critical": 1, "high": 2, "medium": 1}}'::JSONB,
    'finalized',
    '00000000-0000-0000-0000-000000000002'
  )
;

-- ========================================
-- 告警数据
-- ========================================

INSERT INTO mag_alerts (
  project_id,
  alert_type,
  alert_level,
  title,
  message,
  details,
  status
) VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'defect_critical',
    'critical',
    '发现严重缺陷',
    '检测到严重级别缺陷: DEF-002',
    '{"defect_id": "DEF-002", "defect_type": "crack", "position": {"distance": 287.2, "angle": 120.0}}'::JSONB,
    'active'
  ),
  (
    '10000000-0000-0000-0000-000000000001',
    'data_anomaly',
    'warning',
    '数据采集异常',
    '通道2数据出现异常波动',
    '{"channel": "radial", "timestamp": 1234567890}'::JSONB,
    'acknowledged'
  )
;

-- ========================================
-- 审计日志示例
-- ========================================

INSERT INTO mag_audit_logs (
  user_id,
  user_email,
  action,
  resource_type,
  resource_id,
  status
) VALUES
  (
    '00000000-0000-0000-0000-000000000002',
    'engineer1@magspeckit.com',
    'create',
    'project',
    '10000000-0000-0000-0000-000000000001',
    'success'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'engineer1@magspeckit.com',
    'create',
    'defect',
    NULL,
    'success'
  )
;

-- ========================================
-- 完成提示
-- ========================================

-- 显示统计信息
DO $$
BEGIN
  RAISE NOTICE '===========================================';
  RAISE NOTICE '数据库种子数据创建完成！';
  RAISE NOTICE '===========================================';
  RAISE NOTICE '用户数: %', (SELECT COUNT(*) FROM mag_users);
  RAISE NOTICE '项目数: %', (SELECT COUNT(*) FROM mag_projects);
  RAISE NOTICE '缺陷数: %', (SELECT COUNT(*) FROM mag_defects);
  RAISE NOTICE '检测数据点数: %', (SELECT COUNT(*) FROM mag_detection_data);
  RAISE NOTICE '配置数: %', (SELECT COUNT(*) FROM mag_configurations);
  RAISE NOTICE '文件数: %', (SELECT COUNT(*) FROM mag_files);
  RAISE NOTICE '报告数: %', (SELECT COUNT(*) FROM mag_reports);
  RAISE NOTICE '告警数: %', (SELECT COUNT(*) FROM mag_alerts);
  RAISE NOTICE '审计日志数: %', (SELECT COUNT(*) FROM mag_audit_logs);
  RAISE NOTICE '===========================================';
END $$;

