# 技术实现计划 (Technical Implementation Plan)

**项目名称**: MagSpecKit - 石油用防爆工业磁检测仪器界面软件系统  
**功能编号**: 001-web  
**计划版本**: v1.0.0  
**创建日期**: 2025-10-08  
**负责人**: 开发团队  
**预计周期**: 8-10周

---

## 📋 目录

1. [技术栈选择](#技术栈选择)
2. [架构设计](#架构设计)
3. [数据库设计](#数据库设计)
4. [文件结构](#文件结构)
5. [API设计](#api设计)
6. [组件设计](#组件设计)
7. [开发阶段](#开发阶段)
8. [测试策略](#测试策略)
9. [部署方案](#部署方案)
10. [风险管理](#风险管理)

---

## 1. 技术栈选择

### 1.1 前端技术栈

| 技术 | 版本 | 用途 | 选择理由 |
|------|------|------|---------|
| **HTML5** | - | 页面结构 | 原生Web标准，无依赖 |
| **CSS3** | - | 样式设计 | 支持现代布局和动画 |
| **JavaScript (ES6+)** | - | 交互逻辑 | 原生语言，无框架开销 |
| **Tailwind CSS** | 3.4+ | CSS框架 | 快速开发，工业化主题 |
| **ECharts** | 5.5+ | 数据可视化 | 高性能Canvas渲染，实时数据流 |

**决策说明**:
- ✅ **无构建工具**: 直接运行，易于AI编程工具理解
- ✅ **无框架依赖**: 避免学习曲线，完全控制UI
- ✅ **工业级性能**: 原生JS性能最优，适合实时数据处理

### 1.2 后端技术栈

| 技术 | 版本 | 用途 | 选择理由 |
|------|------|------|---------|
| **Supabase** | Latest | BaaS平台 | 后端无代码，自动RESTful API |
| **PostgreSQL** | 15+ | 关系数据库 | Supabase内置，强大的查询能力 |
| **Supabase Auth** | - | 认证授权 | JWT Token，角色权限管理 |
| **Supabase Storage** | - | 文件存储 | 检测数据文件存储 |
| **Supabase Realtime** | - | 实时推送 | WebSocket实时波形更新 |

**决策说明**:
- ✅ **零后端代码**: 全部通过Supabase实现
- ✅ **自动API**: Row Level Security (RLS) 数据安全
- ✅ **实时能力**: WebSocket支持实时数据推送

### 1.3 开发工具

| 工具 | 用途 |
|------|------|
| **VSCode / Cursor** | 代码编辑器 |
| **Supabase CLI** | 数据库迁移和管理 |
| **Git** | 版本控制 |
| **ESLint + Prettier** | 代码规范 |
| **Jest** | 单元测试 |
| **Playwright** | E2E测试 |
| **Netlify** | 部署平台 |

---

## 2. 架构设计

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     用户浏览器 (Browser)                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              工业化界面 (Industrial UI)                │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐ │  │
│  │  │ 功能导航区  │  │  中央工作区   │  │  控制面板区  │ │  │
│  │  │ (Function)  │  │  (Workspace)  │  │  (Control)   │ │  │
│  │  └─────────────┘  └──────────────┘  └──────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
│                            ↕ HTTPS                           │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                    Supabase 后端服务                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ PostgreSQL   │  │  Auth        │  │  Storage     │      │
│  │ (数据库)     │  │  (认证)      │  │  (文件)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Realtime     │  │  REST API    │                        │
│  │ (实时推送)   │  │  (RESTful)   │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 前端架构

**三层架构模式**:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│         (展示层 - HTML/CSS)             │
├─────────────────────────────────────────┤
│         Business Logic Layer            │
│         (业务逻辑层 - JavaScript)       │
│  ┌──────────────────────────────────┐  │
│  │  Data Acquisition (数据采集)     │  │
│  │  Waveform Rendering (波形渲染)   │  │
│  │  Defect Detection (缺陷识别)     │  │
│  │  Report Generation (报告生成)    │  │
│  └──────────────────────────────────┘  │
├─────────────────────────────────────────┤
│         Data Access Layer               │
│         (数据访问层 - Supabase Client)  │
│  ┌──────────────────────────────────┐  │
│  │  REST API Client                  │  │
│  │  Realtime Subscription            │  │
│  │  Storage Client                   │  │
│  │  Auth Client                      │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 2.3 模块化设计

**核心模块**:

1. **`supabase-client.js`** - Supabase客户端初始化
2. **`auth-manager.js`** - 用户认证和授权
3. **`project-manager.js`** - 项目CRUD操作
4. **`file-manager.js`** - 文件上传下载管理
5. **`data-acquisition.js`** - 实时数据采集
6. **`waveform-renderer.js`** - ECharts波形渲染
7. **`defect-detector.js`** - AI缺陷识别
8. **`report-generator.js`** - PDF报告生成
9. **`config-manager.js`** - 参数配置管理
10. **`logger.js`** - 日志系统
11. **`utils.js`** - 工具函数库

---

## 3. 数据库设计

### 3.1 数据库表结构

#### 3.1.1 用户和权限

**表名**: `mag_users`
```sql
CREATE TABLE mag_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'engineer', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE mag_users IS '磁检测系统用户表';
COMMENT ON COLUMN mag_users.role IS '用户角色: admin(管理员), engineer(检测工程师), viewer(查看者)';
```

**RLS策略**:
```sql
ALTER TABLE mag_users ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的信息
CREATE POLICY "Users can view own data"
  ON mag_users FOR SELECT
  USING (auth.uid() = id);

-- 管理员可以查看所有用户
CREATE POLICY "Admins can view all users"
  ON mag_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mag_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

#### 3.1.2 检测项目

**表名**: `mag_projects`
```sql
CREATE TABLE mag_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_name TEXT NOT NULL,
  project_code TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- 管道信息
  pipeline_spec JSONB NOT NULL DEFAULT '{}', -- {diameter, wallThickness, material, length}
  
  -- 检测信息
  detection_type TEXT NOT NULL CHECK (detection_type IN ('mfl', 'mpi', 'ultrasonic')),
  detection_standard TEXT, -- ISO 9934, ASTM E709等
  
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
```

**索引**:
```sql
CREATE INDEX idx_mag_projects_status ON mag_projects(status);
CREATE INDEX idx_mag_projects_created_by ON mag_projects(created_by);
CREATE INDEX idx_mag_projects_created_at ON mag_projects(created_at DESC);
```

---

#### 3.1.3 检测数据

**表名**: `mag_detection_data`
```sql
CREATE TABLE mag_detection_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES mag_projects(id) ON DELETE CASCADE,
  
  -- 数据标识
  data_sequence INTEGER NOT NULL, -- 数据序列号
  channel_id TEXT NOT NULL, -- 通道ID (axial, radial, circumferential)
  
  -- 位置信息
  distance_mm DECIMAL(10, 2), -- 检测距离（毫米）
  angle_deg DECIMAL(5, 2), -- 角度（度）
  
  -- 磁场数据
  magnetic_field_gauss DECIMAL(8, 4), -- 磁场强度（高斯）
  amplitude_value DECIMAL(8, 4), -- 幅值
  
  -- 时间戳
  timestamp_ms BIGINT NOT NULL, -- Unix时间戳（毫秒）
  
  -- 质量标记
  is_valid BOOLEAN DEFAULT true,
  quality_flag TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE mag_detection_data IS '磁检测原始数据表 - 存储高频采样数据';
```

**分区策略** (按项目ID分区):
```sql
-- 启用声明式分区（如数据量大时使用）
-- CREATE TABLE mag_detection_data_partitioned (...) PARTITION BY HASH (project_id);
```

**索引**:
```sql
CREATE INDEX idx_mag_detection_data_project_id ON mag_detection_data(project_id);
CREATE INDEX idx_mag_detection_data_sequence ON mag_detection_data(project_id, data_sequence);
CREATE INDEX idx_mag_detection_data_timestamp ON mag_detection_data(timestamp_ms);
```

---

#### 3.1.4 缺陷记录

**表名**: `mag_defects`
```sql
CREATE TABLE mag_defects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES mag_projects(id) ON DELETE CASCADE,
  
  -- 缺陷信息
  defect_type TEXT NOT NULL CHECK (defect_type IN ('corrosion', 'crack', 'weld_defect', 'wall_thinning', 'other')),
  defect_code TEXT, -- 缺陷编号
  
  -- 位置信息
  position_data JSONB NOT NULL, -- {distance, angle, depth, width, length}
  
  -- 严重程度
  severity_level TEXT NOT NULL CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
  signal_amplitude DECIMAL(8, 4),
  
  -- 尺寸信息
  depth_mm DECIMAL(6, 2),
  width_mm DECIMAL(6, 2),
  length_mm DECIMAL(6, 2),
  
  -- 评估信息
  is_confirmed BOOLEAN DEFAULT false,
  confidence_score DECIMAL(4, 2), -- AI识别置信度 0-1
  notes TEXT,
  
  -- 关联数据
  related_data_ids UUID[], -- 关联的原始数据ID数组
  image_urls TEXT[], -- 波形图片URL数组
  
  -- 审核信息
  reviewed_by UUID REFERENCES mag_users(id),
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE mag_defects IS '缺陷记录表';
COMMENT ON COLUMN mag_defects.position_data IS '位置信息JSON: {distance, angle, depth, width, length}';
```

**索引**:
```sql
CREATE INDEX idx_mag_defects_project_id ON mag_defects(project_id);
CREATE INDEX idx_mag_defects_severity ON mag_defects(severity_level);
CREATE INDEX idx_mag_defects_type ON mag_defects(defect_type);
```

---

#### 3.1.5 检测参数配置

**表名**: `mag_configurations`
```sql
CREATE TABLE mag_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES mag_projects(id) ON DELETE CASCADE,
  
  -- 配置名称
  config_name TEXT NOT NULL,
  config_type TEXT NOT NULL CHECK (config_type IN ('detection', 'gate', 'calibration', 'display')),
  
  -- 配置参数
  parameters JSONB NOT NULL DEFAULT '{}',
  -- detection: {speed, gain, filter, threshold}
  -- gate: {startPosition, width, height, type}
  -- calibration: {zero, gain, probe}
  -- display: {refreshRate, zoom, colors}
  
  -- 版本控制
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  
  -- 审计
  created_by UUID REFERENCES mag_users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE mag_configurations IS '检测参数配置表';
COMMENT ON COLUMN mag_configurations.parameters IS '配置参数JSON';
```

---

#### 3.1.6 文件管理

**表名**: `mag_files`
```sql
CREATE TABLE mag_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES mag_projects(id) ON DELETE CASCADE,
  
  -- 文件信息
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- dat, csv, pdf, json
  file_size BIGINT NOT NULL, -- 字节
  mime_type TEXT,
  
  -- 存储路径
  storage_path TEXT NOT NULL, -- Supabase Storage路径
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
```

**索引**:
```sql
CREATE INDEX idx_mag_files_project_id ON mag_files(project_id);
CREATE INDEX idx_mag_files_category ON mag_files(category);
CREATE INDEX idx_mag_files_uploaded_at ON mag_files(uploaded_at DESC);
```

---

#### 3.1.7 报告生成记录

**表名**: `mag_reports`
```sql
CREATE TABLE mag_reports (
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
  statistics JSONB DEFAULT '{}', -- {totalDefects, byType, bySeverity}
  
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
```

---

#### 3.1.8 系统日志

**表名**: `mag_audit_logs`
```sql
CREATE TABLE mag_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 用户信息
  user_id UUID REFERENCES mag_users(id),
  user_email TEXT,
  
  -- 操作信息
  action TEXT NOT NULL, -- create, read, update, delete, login, logout等
  resource_type TEXT NOT NULL, -- project, defect, file, report等
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
```

**索引**:
```sql
CREATE INDEX idx_mag_audit_logs_user_id ON mag_audit_logs(user_id);
CREATE INDEX idx_mag_audit_logs_action ON mag_audit_logs(action);
CREATE INDEX idx_mag_audit_logs_resource ON mag_audit_logs(resource_type, resource_id);
CREATE INDEX idx_mag_audit_logs_created_at ON mag_audit_logs(created_at DESC);
```

---

#### 3.1.9 系统告警

**表名**: `mag_alerts`
```sql
CREATE TABLE mag_alerts (
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
```

---

### 3.2 数据库视图

#### 3.2.1 项目统计视图
```sql
CREATE VIEW mag_project_statistics AS
SELECT 
  p.id AS project_id,
  p.project_name,
  p.status,
  COUNT(DISTINCT d.id) AS defect_count,
  COUNT(DISTINCT CASE WHEN d.severity_level = 'critical' THEN d.id END) AS critical_defects,
  COUNT(DISTINCT CASE WHEN d.severity_level = 'high' THEN d.id END) AS high_defects,
  COUNT(DISTINCT f.id) AS file_count,
  SUM(f.file_size) AS total_file_size,
  p.created_at,
  p.updated_at
FROM mag_projects p
LEFT JOIN mag_defects d ON d.project_id = p.id
LEFT JOIN mag_files f ON f.project_id = p.id
GROUP BY p.id, p.project_name, p.status, p.created_at, p.updated_at;
```

---

### 3.3 数据库函数

#### 3.3.1 创建项目函数
```sql
CREATE OR REPLACE FUNCTION create_mag_project(
  p_project_name TEXT,
  p_project_code TEXT,
  p_pipeline_spec JSONB,
  p_detection_type TEXT,
  p_detection_standard TEXT DEFAULT NULL
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
    created_by,
    operator_id,
    status
  ) VALUES (
    p_project_name,
    p_project_code,
    p_pipeline_spec,
    p_detection_type,
    p_detection_standard,
    auth.uid(),
    auth.uid(),
    'preparing'
  )
  RETURNING id INTO v_project_id;
  
  -- 记录审计日志
  INSERT INTO mag_audit_logs (user_id, action, resource_type, resource_id, status)
  VALUES (auth.uid(), 'create', 'project', v_project_id, 'success');
  
  RETURN v_project_id;
END;
$$;
```

---

### 3.4 数据库触发器

#### 3.4.1 更新时间戳触发器
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mag_projects_updated_at
  BEFORE UPDATE ON mag_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mag_defects_updated_at
  BEFORE UPDATE ON mag_defects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 4. 文件结构

### 4.1 完整目录结构

```
maguispeckit2/
├── index.html                      # 主入口页面
├── pages/                          # 页面文件
│   ├── dashboard.html              # 仪表板页面
│   ├── projects.html               # 项目管理页面
│   ├── project-detail.html         # 项目详情页面
│   ├── detection.html              # 实时检测页面
│   ├── waveform.html               # 波形显示页面
│   ├── defects.html                # 缺陷管理页面
│   ├── reports.html                # 报告列表页面
│   ├── report-generator.html       # 报告生成页面
│   ├── analytics.html              # 数据分析页面
│   ├── files.html                  # 文件管理页面
│   ├── settings.html               # 系统设置页面
│   ├── profile.html                # 个人资料页面
│   └── login.html                  # 登录页面
│
├── js/                             # JavaScript模块
│   ├── main.js                     # 主入口文件
│   ├── config.js                   # 全局配置
│   ├── supabase-client.js          # Supabase客户端
│   ├── auth-manager.js             # 认证管理
│   ├── project-manager.js          # 项目管理
│   ├── file-manager.js             # 文件管理
│   ├── data-acquisition.js         # 数据采集
│   ├── waveform-renderer.js        # 波形渲染
│   ├── defect-detector.js          # 缺陷识别
│   ├── report-generator.js         # 报告生成
│   ├── analytics-engine.js         # 数据分析
│   ├── config-manager.js           # 配置管理
│   ├── alert-manager.js            # 告警管理
│   ├── logger.js                   # 日志系统
│   ├── utils.js                    # 工具函数
│   └── constants.js                # 常量定义
│
├── css/                            # 样式文件
│   ├── main.css                    # 主样式文件
│   ├── industrial-theme.css        # 工业主题
│   ├── components.css              # 组件样式
│   ├── pages.css                   # 页面样式
│   └── responsive.css              # 响应式样式
│
├── assets/                         # 静态资源
│   ├── images/                     # 图片资源
│   │   ├── logo.svg                # Logo
│   │   ├── icons/                  # 图标
│   │   └── backgrounds/            # 背景图
│   ├── fonts/                      # 字体文件
│   └── data/                       # 示例数据
│       └── sample-detection-data.json
│
├── lib/                            # 第三方库（CDN备份）
│   ├── echarts.min.js              # ECharts
│   ├── tailwind.min.css            # Tailwind CSS
│   └── jspdf.min.js                # jsPDF
│
├── tests/                          # 测试文件
│   ├── unit/                       # 单元测试
│   │   ├── auth-manager.test.js
│   │   ├── project-manager.test.js
│   │   ├── waveform-renderer.test.js
│   │   └── utils.test.js
│   ├── integration/                # 集成测试
│   │   ├── project-workflow.test.js
│   │   └── data-pipeline.test.js
│   └── e2e/                        # 端到端测试
│       ├── login.spec.js
│       ├── project-creation.spec.js
│       └── detection-workflow.spec.js
│
├── docs/                           # 文档
│   ├── API.md                      # API文档
│   ├── DATABASE.md                 # 数据库文档
│   ├── USER_MANUAL_CN.md           # 用户手册（中文）
│   ├── USER_MANUAL_EN.md           # 用户手册（英文）
│   ├── DEVELOPER_GUIDE.md          # 开发者指南
│   ├── DEPLOYMENT.md               # 部署指南
│   └── TROUBLESHOOTING.md          # 故障排查
│
├── supabase/                       # Supabase配置
│   ├── migrations/                 # 数据库迁移
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_projects.sql
│   │   ├── 003_create_detection_data.sql
│   │   ├── 004_create_defects.sql
│   │   ├── 005_create_configurations.sql
│   │   ├── 006_create_files.sql
│   │   ├── 007_create_reports.sql
│   │   ├── 008_create_audit_logs.sql
│   │   ├── 009_create_alerts.sql
│   │   ├── 010_create_views.sql
│   │   ├── 011_create_functions.sql
│   │   ├── 012_create_triggers.sql
│   │   └── 013_create_rls_policies.sql
│   ├── seed.sql                    # 示例数据
│   └── config.toml                 # Supabase配置
│
├── .specify/                       # 项目宪章
├── specs/                          # 功能规格
├── .env                            # 环境变量
├── .gitignore                      # Git忽略
├── README.md                       # 项目说明
├── CHANGELOG.md                    # 变更日志
├── LICENSE                         # 许可证
└── package.json                    # NPM配置（可选）
```

---

## 5. API设计

### 5.1 Supabase REST API端点

所有API通过Supabase自动生成，基础URL:
```
https://zzyueuweeoakopuuwfau.supabase.co/rest/v1/
```

#### 5.1.1 认证API

| 端点 | 方法 | 说明 | 权限 |
|------|------|------|------|
| `/auth/v1/signup` | POST | 用户注册 | 公开 |
| `/auth/v1/token` | POST | 用户登录 | 公开 |
| `/auth/v1/logout` | POST | 用户登出 | 认证 |
| `/auth/v1/user` | GET | 获取当前用户 | 认证 |

#### 5.1.2 项目API

| 端点 | 方法 | 说明 | 权限 |
|------|------|------|------|
| `/mag_projects` | GET | 获取项目列表 | 认证 |
| `/mag_projects` | POST | 创建项目 | engineer+ |
| `/mag_projects?id=eq.{id}` | GET | 获取项目详情 | 认证 |
| `/mag_projects?id=eq.{id}` | PATCH | 更新项目 | engineer+ |
| `/mag_projects?id=eq.{id}` | DELETE | 删除项目 | admin |

**请求示例** (创建项目):
```javascript
const response = await supabase
  .from('mag_projects')
  .insert({
    project_name: '西气东输管道检测',
    project_code: 'XQD-2025-001',
    pipeline_spec: {
      diameter: 406,
      wallThickness: 9.52,
      material: 'API 5L X70',
      length: 3000
    },
    detection_type: 'mfl',
    detection_standard: 'ISO 9934-1'
  });
```

#### 5.1.3 检测数据API

| 端点 | 方法 | 说明 | 权限 |
|------|------|------|------|
| `/mag_detection_data` | POST | 批量插入数据 | engineer+ |
| `/mag_detection_data?project_id=eq.{id}` | GET | 获取项目数据 | 认证 |
| `/mag_detection_data?project_id=eq.{id}&order=timestamp_ms` | GET | 按时间排序获取 | 认证 |

#### 5.1.4 缺陷API

| 端点 | 方法 | 说明 | 权限 |
|------|------|------|------|
| `/mag_defects?project_id=eq.{id}` | GET | 获取项目缺陷 | 认证 |
| `/mag_defects` | POST | 创建缺陷记录 | engineer+ |
| `/mag_defects?id=eq.{id}` | PATCH | 更新缺陷 | engineer+ |
| `/mag_defects?severity_level=eq.critical` | GET | 获取严重缺陷 | 认证 |

#### 5.1.5 文件API

使用Supabase Storage API:

```javascript
// 上传文件
const { data, error } = await supabase.storage
  .from('mag-detection-files')
  .upload(`project-${projectId}/data-${Date.now()}.dat`, file);

// 下载文件
const { data, error } = await supabase.storage
  .from('mag-detection-files')
  .download(filePath);
```

#### 5.1.6 Realtime订阅

```javascript
// 订阅新检测数据
const subscription = supabase
  .channel('detection-data')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'mag_detection_data',
      filter: `project_id=eq.${projectId}`
    },
    (payload) => {
      console.log('New data:', payload.new);
      updateWaveform(payload.new);
    }
  )
  .subscribe();
```

---

### 5.2 自定义RPC函数

#### 5.2.1 获取项目统计
```sql
CREATE OR REPLACE FUNCTION get_project_statistics(p_project_id UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_defects', COUNT(DISTINCT d.id),
    'critical_defects', COUNT(DISTINCT CASE WHEN d.severity_level = 'critical' THEN d.id END),
    'data_points', COUNT(DISTINCT dt.id),
    'files', COUNT(DISTINCT f.id)
  )
  INTO result
  FROM mag_projects p
  LEFT JOIN mag_defects d ON d.project_id = p.id
  LEFT JOIN mag_detection_data dt ON dt.project_id = p.id
  LEFT JOIN mag_files f ON f.project_id = p.id
  WHERE p.id = p_project_id;
  
  RETURN result;
END;
$$;
```

调用方式:
```javascript
const { data, error } = await supabase.rpc('get_project_statistics', {
  p_project_id: projectId
});
```

---

## 6. 组件设计

### 6.1 UI组件库

#### 6.1.1 工业化按钮组件
```html
<!-- 大号橙色按钮 -->
<button class="industrial-btn industrial-btn-primary">
  开始检测
</button>

<!-- 次要按钮 -->
<button class="industrial-btn industrial-btn-secondary">
  保存配置
</button>
```

CSS样式:
```css
.industrial-btn {
  min-width: 120px;
  min-height: 50px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 4px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s;
}

.industrial-btn-primary {
  background: #FF6600;
  color: #FFFFFF;
  border-color: #FF6600;
}

.industrial-btn-primary:hover {
  background: #FF8533;
  box-shadow: 0 0 15px rgba(255, 102, 0, 0.5);
}
```

#### 6.1.2 状态指示器
```html
<div class="status-indicator status-active">
  <span class="status-dot"></span>
  <span class="status-text">正在检测</span>
</div>
```

#### 6.1.3 数据卡片
```html
<div class="data-card">
  <div class="card-header">
    <h3 class="card-title">检测进度</h3>
  </div>
  <div class="card-body">
    <div class="progress-bar">
      <div class="progress-fill" style="width: 65%"></div>
    </div>
    <p class="progress-text">65% 已完成</p>
  </div>
</div>
```

---

### 6.2 波形渲染组件

使用ECharts实现高性能波形显示:

```javascript
class WaveformRenderer {
  constructor(containerId) {
    this.chart = echarts.init(document.getElementById(containerId));
    this.dataBuffer = [];
    this.maxDataPoints = 1000;
  }
  
  initChart() {
    const option = {
      backgroundColor: '#2C2C2C',
      title: {
        text: '磁场强度波形',
        textStyle: { color: '#FFFFFF' }
      },
      xAxis: {
        type: 'value',
        name: '距离 (mm)',
        axisLine: { lineStyle: { color: '#666' } },
        axisLabel: { color: '#999' }
      },
      yAxis: {
        type: 'value',
        name: '磁场强度 (Gauss)',
        axisLine: { lineStyle: { color: '#666' } },
        axisLabel: { color: '#999' }
      },
      series: [
        {
          name: '轴向',
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#FF6600', width: 2 },
          data: []
        },
        {
          name: '径向',
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#00CCFF', width: 2 },
          data: []
        }
      ],
      grid: { left: 60, right: 40, top: 60, bottom: 40 }
    };
    
    this.chart.setOption(option);
  }
  
  addData(channel, distance, value) {
    const seriesIndex = channel === 'axial' ? 0 : 1;
    const seriesData = this.chart.getOption().series[seriesIndex].data;
    
    seriesData.push([distance, value]);
    
    // 限制数据点数量
    if (seriesData.length > this.maxDataPoints) {
      seriesData.shift();
    }
    
    this.chart.setOption({
      series: [{ data: seriesData }]
    });
  }
  
  startRealtime() {
    setInterval(() => {
      this.chart.setOption({
        series: [{ data: this.dataBuffer }]
      });
    }, 33); // 30 FPS
  }
}
```

---

## 7. 开发阶段

### 7.1 阶段划分

| 阶段 | 周期 | 主要任务 | 交付物 |
|------|------|---------|--------|
| **阶段1: 环境搭建** | 1周 | 项目初始化、数据库设计、开发环境 | 数据库迁移脚本 |
| **阶段2: 基础功能** | 2周 | 认证、项目管理、文件管理 | 核心CRUD功能 |
| **阶段3: 检测功能** | 2周 | 数据采集、波形显示、缺陷识别 | 实时检测界面 |
| **阶段4: 高级功能** | 2周 | 报告生成、数据分析、告警系统 | 完整业务流程 |
| **阶段5: 测试优化** | 1周 | 单元测试、集成测试、性能优化 | 测试报告 |
| **阶段6: 部署上线** | 1周 | 生产部署、监控配置、文档完善 | 生产环境 |

---

### 7.2 详细任务分解

#### 阶段1: 环境搭建 (1周)

**任务1.1: 项目初始化** [1天]
- [ ] 创建Git仓库
- [ ] 配置.gitignore
- [ ] 创建目录结构
- [ ] 配置环境变量

**任务1.2: Supabase设置** [2天]
- [ ] 创建Supabase项目
- [ ] 配置数据库连接
- [ ] 创建数据库表（9个表）
- [ ] 配置RLS策略
- [ ] 创建视图和函数
- [ ] 设置Storage buckets

**任务1.3: 开发环境** [1天]
- [ ] 安装Node.js和依赖
- [ ] 配置ESLint和Prettier
- [ ] 配置测试框架Jest
- [ ] 配置Playwright E2E测试

**任务1.4: CDN依赖** [1天]
- [ ] 引入Tailwind CSS
- [ ] 引入ECharts
- [ ] 引入jsPDF
- [ ] 创建本地备份

---

#### 阶段2: 基础功能 (2周)

**任务2.1: 用户认证** [3天]
- [ ] 实现登录页面
- [ ] 实现注册功能
- [ ] JWT Token管理
- [ ] 权限检查中间件
- [ ] 个人资料页面

**任务2.2: 项目管理** [4天]
- [ ] 项目列表页面
- [ ] 创建项目表单
- [ ] 项目详情页面
- [ ] 项目编辑功能
- [ ] 项目状态管理
- [ ] 项目统计展示

**任务2.3: 文件管理** [3天]
- [ ] 文件浏览器UI
- [ ] 文件上传功能
- [ ] 文件下载功能
- [ ] 文件删除和重命名
- [ ] 文件搜索和筛选

---

#### 阶段3: 检测功能 (2周)

**任务3.1: 数据采集** [4天]
- [ ] 实时数据采集界面
- [ ] 数据采集引擎
- [ ] 多通道数据同步
- [ ] 数据缓冲和流式传输
- [ ] 采集进度显示

**任务3.2: 波形显示** [4天]
- [ ] ECharts波形组件
- [ ] 实时数据渲染（30 FPS）
- [ ] 多通道叠加显示
- [ ] 波形缩放和平移
- [ ] 闸门可视化
- [ ] 历史波形回放

**任务3.3: 缺陷识别** [3天]
- [ ] AI缺陷识别算法（模拟）
- [ ] 缺陷标注功能
- [ ] 缺陷列表展示
- [ ] 缺陷详情页面
- [ ] 缺陷严重程度评级

---

#### 阶段4: 高级功能 (2周)

**任务4.1: 参数配置** [3天]
- [ ] 检测参数设置页面
- [ ] 闸门配置界面
- [ ] 设备校准功能
- [ ] 配置保存和加载
- [ ] 配置版本管理

**任务4.2: 报告生成** [4天]
- [ ] 报告模板设计
- [ ] 报告数据组装
- [ ] PDF生成（jsPDF）
- [ ] Excel导出
- [ ] 报告预览和打印

**任务4.3: 数据分析** [3天]
- [ ] 统计分析页面
- [ ] 缺陷分布图表
- [ ] 趋势分析
- [ ] 对比分析
- [ ] 自定义报表

**任务4.4: 告警系统** [2天]
- [ ] 告警规则配置
- [ ] 实时告警弹窗
- [ ] 告警历史记录
- [ ] 邮件通知集成（可选）

---

#### 阶段5: 测试优化 (1周)

**任务5.1: 单元测试** [2天]
- [ ] 工具函数测试
- [ ] 业务逻辑测试
- [ ] API客户端测试
- [ ] 覆盖率≥85%

**任务5.2: 集成测试** [2天]
- [ ] 项目工作流测试
- [ ] 数据管道测试
- [ ] 文件操作测试

**任务5.3: E2E测试** [2天]
- [ ] 用户登录流程
- [ ] 项目创建流程
- [ ] 检测完整流程
- [ ] 报告生成流程

**任务5.4: 性能优化** [1天]
- [ ] 页面加载优化（<2秒）
- [ ] API响应优化（<500ms）
- [ ] 波形渲染优化（≥30 FPS）
- [ ] 内存泄漏检查

---

#### 阶段6: 部署上线 (1周)

**任务6.1: Netlify部署** [2天]
- [ ] 配置netlify.toml
- [ ] 环境变量设置
- [ ] 自定义域名绑定
- [ ] SSL证书配置

**任务6.2: 监控配置** [1天]
- [ ] 日志系统验证
- [ ] 性能监控配置
- [ ] 错误追踪（Sentry可选）
- [ ] 告警通知设置

**任务6.3: 文档完善** [2天]
- [ ] API文档
- [ ] 用户手册（中英文）
- [ ] 开发者指南
- [ ] 部署指南
- [ ] 故障排查文档

**任务6.4: 上线验证** [1天]
- [ ] 生产环境smoke测试
- [ ] 性能基准测试
- [ ] 安全扫描
- [ ] 用户验收测试

---

## 8. 测试策略

### 8.1 测试金字塔

```
        /\
       /  \       E2E测试 (10%)
      /____\      - 关键用户流程
     /      \     
    /        \    集成测试 (20%)
   /__________\   - API集成、数据流
  /            \  
 /              \ 单元测试 (70%)
/________________\ - 函数、模块
```

### 8.2 测试覆盖率要求

| 层级 | 覆盖率目标 | 测试工具 |
|------|-----------|---------|
| 单元测试 | ≥85% | Jest |
| 集成测试 | ≥70% | Jest |
| E2E测试 | 关键流程100% | Playwright |

### 8.3 测试用例示例

#### 8.3.1 单元测试
```javascript
// tests/unit/utils.test.js
describe('formatFileSize', () => {
  test('should format bytes to KB', () => {
    expect(formatFileSize(1024)).toBe('1.00 KB');
  });
  
  test('should format bytes to MB', () => {
    expect(formatFileSize(1048576)).toBe('1.00 MB');
  });
});
```

#### 8.3.2 集成测试
```javascript
// tests/integration/project-workflow.test.js
describe('Project Workflow', () => {
  test('should create and retrieve project', async () => {
    const project = await createProject({
      project_name: 'Test Project',
      project_code: 'TEST-001'
    });
    
    expect(project.id).toBeDefined();
    
    const retrieved = await getProject(project.id);
    expect(retrieved.project_name).toBe('Test Project');
  });
});
```

#### 8.3.3 E2E测试
```javascript
// tests/e2e/project-creation.spec.js
test('user can create a new project', async ({ page }) => {
  await page.goto('/projects');
  await page.click('text=新建项目');
  
  await page.fill('[name="project_name"]', '测试项目');
  await page.fill('[name="project_code"]', 'TEST-001');
  await page.click('button:has-text("创建")');
  
  await expect(page.locator('text=测试项目')).toBeVisible();
});
```

---

## 9. 部署方案

### 9.1 Netlify部署配置

**netlify.toml**:
```toml
[build]
  command = "echo 'No build required'"
  publish = "."
  
[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "no-referrer"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; img-src 'self' data: https:; connect-src 'self' https://zzyueuweeoakopuuwfau.supabase.co wss://zzyueuweeoakopuuwfau.supabase.co"
```

### 9.2 环境变量配置

在Netlify控制台设置:
```
PUBLIC_SUPABASE_URL=https://zzyueuweeoakopuuwfau.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

### 9.3 部署流程

1. **本地构建测试**
```bash
# 验证所有文件
ls -la

# 本地测试
python -m http.server 8000
```

2. **Git推送**
```bash
git add .
git commit -m "feat: complete implementation"
git push origin main
```

3. **Netlify自动部署**
- 自动触发构建
- 运行smoke测试
- 部署到生产环境

4. **部署验证**
- 访问生产URL
- 验证所有功能
- 检查性能指标

---

## 10. 风险管理

### 10.1 技术风险

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| Supabase服务中断 | 低 | 高 | 数据本地缓存、降级方案 |
| 实时数据延迟 | 中 | 中 | 数据缓冲、批量处理 |
| 浏览器兼容性 | 中 | 中 | Polyfill、优雅降级 |
| 大数据量性能 | 高 | 高 | 分页、虚拟滚动、数据分区 |
| 安全漏洞 | 中 | 高 | RLS策略、定期安全审计 |

### 10.2 项目风险

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| 需求变更 | 中 | 中 | 敏捷开发、版本迭代 |
| 人员流动 | 低 | 高 | 完整文档、知识传承 |
| 进度延期 | 中 | 中 | 缓冲时间、优先级管理 |
| 测试不充分 | 中 | 高 | TDD、自动化测试 |

---

## 11. 成功标准

### 11.1 功能完整性

- [x] 15个核心功能模块全部实现
- [ ] 所有用户场景测试通过
- [ ] 符合ISO 9934和ASTM E709标准

### 11.2 性能指标

- [ ] 界面加载时间 < 2秒
- [ ] API响应延迟 < 500ms
- [ ] 波形刷新率 ≥ 30 FPS
- [ ] 数据采集频率 ≥ 1000 Hz
- [ ] 系统可用性 ≥ 99.9%
- [ ] 支持≥50并发用户

### 11.3 质量指标

- [ ] 单元测试覆盖率 ≥ 85%
- [ ] 集成测试覆盖率 ≥ 70%
- [ ] E2E测试关键流程100%覆盖
- [ ] 代码质量评级 A（SonarQube）
- [ ] 安全测试通过（OWASP Top 10）

### 11.4 文档完整性

- [ ] API文档完整
- [ ] 用户手册（中英双语）
- [ ] 开发者指南
- [ ] 部署指南
- [ ] 故障排查文档

---

## 12. 后续优化

### 12.1 v1.1计划 (2026 Q1)

- AI缺陷识别算法优化
- 移动端适配（响应式优化）
- 离线模式支持（Service Worker）
- 多语言扩展（日语、德语）

### 12.2 v2.0计划 (2026 Q2)

- 多站点管理
- 高级数据分析（机器学习）
- 第三方系统集成（ERP、MES）
- 定制化报告模板编辑器

---

## 附录

### 附录A: 技术决策记录

| 决策ID | 日期 | 决策内容 | 理由 |
|--------|------|---------|------|
| TD-001 | 2025-10-08 | 使用纯HTML/CSS/JS | 最简单、最适合AI编程 |
| TD-002 | 2025-10-08 | 选择Supabase作为后端 | 后端无代码、完整BaaS |
| TD-003 | 2025-10-08 | 使用ECharts绘制波形 | 高性能Canvas渲染 |
| TD-004 | 2025-10-08 | 采用Netlify部署 | 简单、快速、免费 |

### 附录B: 参考资源

- [Supabase文档](https://supabase.com/docs)
- [ECharts官方文档](https://echarts.apache.org/)
- [ISO 9934标准](https://www.iso.org/standard/57520.html)
- [ASTM E709标准](https://www.astm.org/e0709-21.html)

---

**计划审批**:

- **制定人**: AI开发助手
- **审批人**: 项目负责人
- **审批日期**: 2025-10-08
- **计划状态**: ✅ 已批准

---

**版本历史**:

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|---------|------|
| v1.0.0 | 2025-10-08 | 初始版本创建 | AI开发助手 |

---

<div align="center">

**MagSpecKit技术实现计划 - 准备就绪，开始实施！**

[查看规格文档](spec.md) • [查看任务列表](tasks.md) • [查看数据模型](data-model.md)

</div>

