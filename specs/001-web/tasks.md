# Tasks: 石油用防爆工业磁检测仪器界面软件系统

**功能编号**: 001-web  
**创建日期**: 2025-10-08  
**版本**: 1.0.0  
**输入文档**: `specs/001-web/spec.md`, `specs/001-web/plan.md`  

---

## 📋 概述

### 任务组织方式

任务按**用户故事**（User Story）组织，确保每个故事可以：
- ✅ 独立实现
- ✅ 独立测试
- ✅ 独立部署

### 格式说明

- **[P]**: 可并行执行（不同文件，无依赖关系）
- **[Story]**: 任务所属用户故事（如 US1, US2, US3）
- 所有路径使用项目根目录的相对路径

### 测试策略

根据项目规则，所有测试将在**全部开发完成后统一执行**，而不是在开发过程中穿插进行。

---

## 用户故事映射

| 编号 | 用户故事 | 优先级 | 阶段 |
|------|---------|--------|------|
| US-001 | 工业风格界面复现 | P1 | Phase 3 |
| US-002 | 实时波形显示 | P1 | Phase 4 |
| US-003 | 项目管理 | P2 | Phase 5 |
| US-004 | 参数配置 | P2 | Phase 6 |
| US-006 | 自动保存数据 | P2 | Phase 7 |
| US-005 | 报告生成 | P3 | Phase 8 |
| US-007 | 数据导出 | P3 | Phase 9 |

---

## Phase 1: Setup（项目初始化）

**目的**: 建立项目基础结构和依赖

- [x] **T001** [P] 创建项目文件夹结构 ✅
  - 路径: `src/`, `public/`, `public/css/`, `public/js/`, `public/images/`, `tests/`
  - 创建 `public/index.html` 作为主入口
  - 创建 `public/css/main.css` 作为主样式表
  - 创建 `public/js/app.js` 作为主应用脚本

- [x] **T002** [P] 配置Tailwind CSS ✅
  - 通过CDN方式引入 Tailwind CSS 3.4+
  - 在 `public/index.html` 中添加 Tailwind CDN链接
  - 创建自定义配置：工业橙色主题（#FF6B35）、深灰色（#2D2D2D）、黑色（#000000）

- [x] **T003** [P] 配置ECharts ✅
  - 通过CDN方式引入 ECharts 5.5+
  - 在 `public/index.html` 中添加 ECharts CDN链接
  - 创建 `public/js/charts.js` 封装图表初始化函数

- [x] **T004** [P] 创建环境配置文件 ✅
  - 复制 `env.template` 为 `.env`
  - 填入Supabase连接信息（URL和ANON_KEY）
  - 创建 `public/js/config.js` 加载环境变量

- [x] **T005** [P] 配置部署文件 ✅
  - 创建 `netlify.toml` 配置文件
  - 设置构建命令和发布目录（`public/`）
  - 配置重定向规则和安全头部

- [x] **T006** 创建package.json（可选，用于开发依赖） ✅
  - 初始化npm项目
  - 添加开发依赖：`pnpm`（如需本地开发服务器）

**Checkpoint**: 项目结构完成，可以在浏览器中打开 `public/index.html`

---

## Phase 2: Foundational（基础架构）

**目的**: 建立核心基础设施，所有用户故事的前置依赖

**⚠️ 关键**: 此阶段必须100%完成后，才能开始任何用户故事开发

### 数据库设置

- [ ] **T007** 应用Supabase数据库迁移 ⏸️ 待执行
  - 执行命令: `supabase link --project-ref zzyueuweeoakopuuwfau`
  - 执行命令: `supabase db push`
  - 验证所有9个表创建成功：`mag_users`, `mag_projects`, `mag_detection_data`, `mag_defects`, `mag_configurations`, `mag_files`, `mag_reports`, `mag_audit_logs`, `mag_alerts`
  - 验证视图 `project_summary` 创建成功
  - 验证RLS策略已启用

- [ ] **T008** 插入种子数据 ⏸️ 待执行
  - 执行命令: `supabase db seed`
  - 验证用户数据（3个用户）
  - 验证项目数据（2个示例项目）
  - 验证检测数据（100条数据点）
  - 验证缺陷数据（4条缺陷记录）

### 核心服务层

- [x] **T009** [P] 创建Supabase客户端 ✅
  - 文件: `public/js/services/supabase-client.js`
  - 初始化Supabase客户端，使用环境变量中的URL和KEY
  - 导出单例实例供其他模块使用
  - 包含错误处理和重连机制

- [x] **T010** [P] 创建认证服务 ✅
  - 文件: `public/js/services/auth.js`
  - 实现登录函数 `login(email, password)`
  - 实现登出函数 `logout()`
  - 实现获取当前用户 `getCurrentUser()`
  - 实现会话检查 `checkSession()`
  - 添加认证状态监听器

- [x] **T011** [P] 创建项目服务 ✅
  - 文件: `public/js/services/projects.js`
  - 实现 `createProject(data)` - 创建新项目
  - 实现 `getProjects(filters)` - 获取项目列表
  - 实现 `getProjectById(id)` - 获取项目详情
  - 实现 `updateProject(id, data)` - 更新项目
  - 实现 `deleteProject(id)` - 删除项目

- [x] **T012** [P] 创建检测数据服务 ✅
  - 文件: `public/js/services/detection-data.js`
  - 实现 `insertDetectionData(data)` - 插入检测数据
  - 实现 `getDetectionData(projectId, filters)` - 获取检测数据
  - 实现 `subscribeToDetectionData(projectId, callback)` - 实时订阅
  - 实现批量插入 `batchInsertDetectionData(dataArray)`

- [x] **T013** [P] 创建缺陷服务 ✅
  - 文件: `public/js/services/defects.js`
  - 实现 `createDefect(data)` - 创建缺陷记录
  - 实现 `getDefects(projectId)` - 获取项目缺陷列表
  - 实现 `updateDefect(id, data)` - 更新缺陷
  - 实现 `deleteDefect(id)` - 删除缺陷

### 工具库和常量

- [x] **T014** [P] 创建常量定义文件 ✅
  - 文件: `public/js/utils/constants.js`
  - 定义颜色常量（工业橙、深灰、黑色）
  - 定义设备状态枚举
  - 定义缺陷类型枚举（crack, corrosion, inclusion, other）
  - 定义严重程度枚举
  - 定义国际标准常量（ISO 9934、ASTM E709、EN 1290）

- [x] **T015** [P] 创建工具函数库 ✅
  - 文件: `public/js/utils/helpers.js`
  - 实现日期格式化函数 `formatDate(date, format)`
  - 实现数据单位转换 `convertUnit(value, from, to)`
  - 实现防抖函数 `debounce(func, delay)`
  - 实现节流函数 `throttle(func, limit)`
  - 实现深拷贝函数 `deepClone(obj)`
  - 实现表单验证函数 `validateForm(data, rules)`

- [x] **T016** [P] 创建数据处理工具 ✅
  - 文件: `public/js/utils/data-processor.js`
  - 实现信号滤波函数 `filterSignal(rawData, filterType)`
  - 实现信号归一化 `normalizeSignal(data)`
  - 实现峰值检测 `detectPeaks(signal, threshold)`
  - 实现统计计算（均值、方差、标准差）

- [x] **T017** [P] 创建UI组件工具 ✅
  - 文件: `public/js/utils/ui-helpers.js`
  - 实现通知提示 `showNotification(message, type)`
  - 实现加载指示器 `showLoading()` 和 `hideLoading()`
  - 实现确认对话框 `showConfirm(message, onConfirm)`
  - 实现模态框 `showModal(content, options)`

**Checkpoint**: 基础架构完成，Supabase连接成功，服务层可用

---

## Phase 3: User Story 1 - 工业风格界面复现（P1）🎯 MVP

**目标**: 实现与DOPPLER NOVASCAN硬件设备一致的工业风格Web界面

**用户故事**: 
> 作为检测工程师，我希望看到与原硬件设备一致的操作界面，以便无需额外培训即可上手操作。

**独立测试标准**:
- ✅ 界面与参考图片 `image/磁检测界面.jpg` 的视觉相似度≥95%
- ✅ 橙黑配色准确（橙色 #FF6B35，深灰 #2D2D2D，黑色 #000000）
- ✅ 左侧工具栏和右侧快捷栏位置正确
- ✅ 响应式布局支持1024×768到4K分辨率
- ✅ 触摸屏按钮热区≥44×44像素

### 实现任务

- [x] **T018** [P] [US1] 创建主页面HTML结构 ✅
  - 文件: `public/index.html`
  - 实现页面基本框架：`<header>`, `<main>`, `<footer>`
  - 添加左侧工具栏容器 `<aside id="left-toolbar">`
  - 添加右侧快捷栏容器 `<aside id="right-toolbar">`
  - 添加中央显示区域 `<section id="main-display">`
  - 添加顶部状态栏 `<div id="status-bar">`
  - 添加底部导航栏 `<nav id="bottom-nav">`

- [x] **T019** [P] [US1] 实现工业风格CSS样式 ✅
  - 文件: `public/css/main.css`
  - 定义CSS变量：`--color-orange: #FF6B35`, `--color-dark-gray: #2D2D2D`, `--color-black: #000000`
  - 实现橙色边框效果（`border: 2px solid var(--color-orange)`）
  - 实现工业质感阴影（`box-shadow: 0 4px 6px rgba(0,0,0,0.3)`）
  - 实现金属质感渐变背景
  - 实现按钮悬停和激活状态样式

- [x] **T020** [US1] 实现左侧垂直工具栏 ✅
  - 文件: `public/js/components/left-toolbar.js`
  - 创建播放按钮（▶ 图标，橙色）
  - 创建上传按钮（⬆ 图标）
  - 创建DISP按钮（显示切换）
  - 创建主按钮（Main）
  - 创建GATE按钮（闸门设置）
  - 创建VPA按钮（VPA模式）
  - 每个按钮尺寸：60×60像素，圆角10像素
  - 按钮间距：20像素
  - 添加按钮点击事件监听器（暂时为空实现）

- [x] **T021** [US1] 实现右侧垂直快捷栏 ✅
  - 文件: `public/js/components/right-toolbar.js`
  - 创建返回按钮（⬅ 图标）
  - 创建SAVE按钮（💾 图标）
  - 创建MENU按钮（☰ 图标）
  - 按钮样式与左侧工具栏一致
  - 添加按钮点击事件监听器

- [x] **T022** [US1] 实现顶部状态栏 ✅
  - 文件: `public/js/components/status-bar.js`
  - 显示设备名称：「DOPPLER NOVASCAN」
  - 显示当前时间（实时更新）
  - 显示连接状态指示器（绿色=已连接，红色=未连接）
  - 显示当前用户信息
  - 显示电池/存储空间状态
  - 使用Flexbox布局，左右分布

- [x] **T023** [US1] 实现底部导航栏 ✅
  - 文件: `public/js/components/bottom-nav.js`
  - 创建导航按钮：波形显示、数据列表、缺陷记录、参数配置、报告生成
  - 使用Flexbox均匀分布
  - 激活状态显示橙色背景
  - 添加页面切换逻辑

- [x] **T024** [US1] 实现中央主显示区域布局 ✅
  - 文件: `public/index.html` (已集成)
  - 包含多个页面视图：波形图、数据表格、缺陷列表、设置面板
  - 波形图区域：黑色背景，准备ECharts容器
  - 数据表格区域：深灰背景，橙色表头
  - 支持页面切换（通过底部导航）

- [x] **T025** [US1] 实现响应式布局 ✅
  - 文件: `public/css/main.css` (已集成)
  - 添加媒体查询：`@media (max-width: 1024px)` - 平板布局
  - 添加媒体查询：`@media (max-width: 768px)` - 手机布局
  - 调整按钮尺寸、字体大小、间距
  - 确保触摸屏热区≥44×44像素

- [x] **T026** [US1] 实现界面初始化脚本 ✅
  - 文件: `public/js/app.js`
  - 加载所有组件（工具栏、状态栏、导航栏）
  - 设置默认视图
  - 绑定全局事件监听器（窗口大小变化）
  - 应用工业主题样式

**Checkpoint**: 工业风格界面完成，视觉效果与原设备一致

---

## Phase 4: User Story 2 - 实时波形显示（P1）

**目标**: 实现实时磁信号波形图显示，支持多通道、缩放、标注

**用户故事**: 
> 作为检测工程师，我希望实时查看磁信号波形图，以便即时判断管道是否存在裂纹、腐蚀等缺陷。

**独立测试标准**:
- ✅ 波形刷新率≥10Hz（100ms刷新一次）
- ✅ 支持3通道（X、Y、Z轴）同时显示
- ✅ 支持时间轴缩放（1s, 5s, 10s, 30s）
- ✅ 支持幅值缩放（±1V, ±5V, ±10V）
- ✅ 支持波形暂停/恢复
- ✅ 支持缺陷位置标注（红色竖线）

### 实现任务

- [x] **T027** [P] [US2] 创建波形图容器组件 ✅
  - 文件: `public/js/components/waveform-chart.js`
  - 在主显示区域创建ECharts容器
  - 设置容器尺寸为100%宽度×高度自适应
  - 初始化ECharts实例
  - 实现窗口大小变化时重绘

- [x] **T028** [US2] 配置ECharts波形图实例 ✅
  - 文件: `public/js/components/waveform-chart.js`
  - 初始化ECharts实例
  - 配置图表选项：
    - 黑色背景（`backgroundColor: '#000000'`）
    - 橙色网格线（`splitLine: { lineStyle: { color: '#333333' } }`）
    - X轴：时间（ms）
    - Y轴：信号强度（mV）
  - 配置3条系列线：
    - X轴（红色）
    - Y轴（绿色）
    - Z轴（蓝色）
  - 实现数据缓冲区（最多保存1000个点）

- [x] **T029** [US2] 实现实时数据更新 ✅
  - 文件: `public/js/services/realtime-data.js`
  - 使用Supabase Realtime订阅 `mag_detection_data` 表
  - 监听INSERT事件
  - 解析JSON格式的 `raw_signal` 字段
  - 将新数据推送到波形图缓冲区
  - 触发图表刷新（使用 `chart.setOption()` 更新数据）

- [x] **T030** [P] [US2] 实现波形控制面板 ✅
  - 文件: `public/js/components/waveform-controls.js`
  - 创建控制按钮组：
    - 播放/暂停按钮（切换数据采集）
    - 清除按钮（清空波形数据）
    - 截图按钮（保存当前波形为PNG）
  - 创建时间轴缩放选择器（下拉菜单：1s, 5s, 10s, 30s）
  - 创建幅值缩放选择器（下拉菜单：±10mV, ±50mV, ±100mV, ±200mV）
  - 创建通道显示/隐藏复选框（X、Y、Z）
  - 绑定控制逻辑到波形图实例

- [x] **T031** [US2] 实现缺陷标注功能 ✅
  - 文件: `public/js/features/defect-marking.js`
  - 在波形图上点击时，弹出标注对话框
  - 对话框内容：
    - 缺陷类型选择（crack/corrosion/inclusion/other）
    - 严重程度选择（minor/moderate/severe/critical）
    - 备注文本框
  - 确认后，在波形图上添加红色竖线标记
  - 将标注信息保存到 `mag_defects` 表
  - 关联当前项目和检测数据ID

- [x] **T032** [US2] 实现波形导出功能 ✅
  - 文件: `public/js/components/waveform-controls.js` (已集成)
  - 实现导出为PNG图片：使用ECharts的 `getDataURL()` 方法
  - 实现导出为CSV数据：将缓冲区数据转为CSV格式
  - 添加导出按钮到控制面板
  - 触发浏览器下载

- [x] **T033** [US2] 实现波形数据模拟器（开发测试用） ✅
  - 文件: `public/js/utils/data-simulator.js`
  - 生成模拟的磁信号数据（正弦波+随机噪声）
  - 模拟缺陷信号（突增/突降）
  - 按20Hz频率推送到波形图
  - 仅在开发环境启用（检测 `window.location.hostname === 'localhost'`）

**Checkpoint**: ✅ 波形图实时显示正常，标注功能可用，性能满足要求

---

## Phase 5: User Story 3 - 项目管理（P2）

**目标**: 实现检测项目的创建、查看、编辑、删除（CRUD）功能

**用户故事**: 
> 作为检测工程师，我希望创建和管理检测项目，以便组织不同管道段的检测工作。

**独立测试标准**:
- ✅ 可以创建新项目（3步内完成）
- ✅ 可以查看项目列表（支持分页、搜索、筛选）
- ✅ 可以编辑项目信息（仅限进行中项目）
- ✅ 可以删除项目（需二次确认）
- ✅ 项目列表加载时间<2秒（100个项目内）

### 实现任务

- [ ] **T034** [P] [US3] 创建项目列表页面
  - 文件: `public/pages/projects.html`
  - 创建页面布局：顶部搜索栏 + 项目卡片网格
  - 添加「新建项目」按钮（橙色，右上角）
  - 添加筛选器：状态（进行中/已完成/已归档）、日期范围
  - 添加排序选项：最新、最旧、名称
  - 使用Grid布局显示项目卡片（3列）

- [ ] **T035** [US3] 实现项目卡片组件
  - 文件: `public/js/components/project-card.js`
  - 显示项目信息：
    - 项目名称（粗体，橙色）
    - 管道编号
    - 检测日期
    - 状态标签（进行中=绿色，已完成=蓝色，已归档=灰色）
  - 添加操作按钮：「查看」、「编辑」、「删除」
  - 悬停时显示完整信息预览

- [ ] **T036** [US3] 实现项目列表加载逻辑
  - 文件: `public/js/pages/projects-list.js`
  - 调用 `projects.getProjects()` 获取数据
  - 应用筛选和排序
  - 渲染项目卡片
  - 实现分页（每页12个项目）
  - 添加加载指示器
  - 处理空状态（无项目时显示提示）

- [ ] **T037** [P] [US3] 创建新建项目表单
  - 文件: `public/pages/new-project.html`
  - 步骤1：基本信息
    - 项目名称（必填，实时校验唯一性）
    - 管道编号/位置（必填）
    - 检测日期时间（日期时间选择器，默认当前）
  - 步骤2：管道信息
    - 管道材质选择器（碳钢/不锈钢/合金钢）
    - 管道外径（数字输入，单位：mm）
    - 管道壁厚（数字输入，单位：mm）
  - 步骤3：检测标准和人员
    - 检测标准选择器（ISO 9934-1/ASTM E709/EN 1290）
    - 检测人员（下拉列表，从用户表获取）
    - 备注（文本区域）
  - 进度指示器（1/3, 2/3, 3/3）
  - 「上一步」、「下一步」、「提交」按钮

- [ ] **T038** [US3] 实现新建项目表单逻辑
  - 文件: `public/js/pages/new-project-form.js`
  - 实现步骤切换逻辑
  - 实现表单验证（必填字段、格式检查）
  - 调用 `projects.createProject(data)` 提交数据
  - 提交成功后跳转到项目详情页
  - 提交失败显示错误提示

- [ ] **T039** [P] [US3] 创建项目详情页面
  - 文件: `public/pages/project-detail.html`
  - 顶部：项目名称 + 状态标签 + 操作按钮（编辑/删除/导出）
  - Tab切换：「基本信息」、「检测数据」、「缺陷记录」、「报告」
  - 基本信息Tab：以只读形式显示所有项目字段
  - 检测数据Tab：显示该项目的所有检测数据列表
  - 缺陷记录Tab：显示该项目的所有缺陷记录
  - 报告Tab：显示生成的报告列表

- [ ] **T040** [US3] 实现项目详情加载逻辑
  - 文件: `public/js/pages/project-detail.js`
  - 从URL参数获取项目ID
  - 调用 `projects.getProjectById(id)` 获取数据
  - 渲染项目信息
  - 调用 `detectionData.getDetectionData(projectId)` 获取检测数据
  - 调用 `defects.getDefects(projectId)` 获取缺陷记录
  - 实现Tab切换逻辑

- [ ] **T041** [US3] 实现项目编辑功能
  - 文件: `public/js/features/project-edit.js`
  - 点击「编辑」按钮时，将只读字段变为可编辑
  - 仅允许编辑状态为「进行中」的项目
  - 修改后显示「保存」和「取消」按钮
  - 调用 `projects.updateProject(id, data)` 保存修改
  - 更新成功后显示通知并刷新页面

- [ ] **T042** [US3] 实现项目删除功能
  - 文件: `public/js/features/project-delete.js`
  - 点击「删除」按钮时，弹出确认对话框
  - 对话框内容：「确定要删除项目『{项目名称}』吗？此操作不可恢复。」
  - 确认后调用 `projects.deleteProject(id)`
  - 删除成功后返回项目列表页

- [ ] **T043** [US3] 实现项目搜索和筛选
  - 文件: `public/js/features/project-filter.js`
  - 实现搜索框：按项目名称或管道编号模糊搜索
  - 实现状态筛选：下拉菜单选择状态
  - 实现日期范围筛选：日期选择器
  - 实现排序：下拉菜单选择排序方式
  - 使用防抖优化搜索性能（500ms延迟）
  - 筛选条件变化时重新加载列表

**Checkpoint**: 项目管理CRUD功能完整，可以独立创建、查看、编辑、删除项目

---

## Phase 6: User Story 4 - 参数配置（P2）

**目标**: 实现检测参数的配置和管理，包括增益、闸门、触发条件等

**用户故事**: 
> 作为检测工程师，我希望配置检测参数（增益、闸门、触发条件），以便适应不同材质和厚度的管道。

**独立测试标准**:
- ✅ 可以调整增益参数（0-100，步进1）
- ✅ 可以设置闸门（起始位置、宽度、高度）
- ✅ 可以设置触发条件（阈值、边沿）
- ✅ 参数修改后立即应用到波形显示
- ✅ 可以保存配置模板并快速加载

### 实现任务

- [ ] **T044** [P] [US4] 创建参数配置面板
  - 文件: `public/pages/settings.html`
  - 创建Tab切换：「检测参数」、「闸门设置」、「触发设置」、「配置模板」
  - 检测参数Tab：增益、频率、灵敏度、滤波器
  - 闸门设置Tab：闸门A、闸门B配置
  - 触发设置Tab：触发源、触发阈值、触发边沿
  - 配置模板Tab：保存/加载配置

- [ ] **T045** [US4] 实现检测参数控件
  - 文件: `public/js/components/detection-params.js`
  - 增益滑块：范围0-100，步进1，显示当前值
  - 频率滑块：范围50-500Hz，步进10
  - 灵敏度滑块：范围0.01-1.0，步进0.01
  - 滤波器选择器：无/低通/高通/带通
  - 每个控件变化时，触发 `onParamChange` 事件
  - 显示参数建议值（根据管道材质和厚度）

- [ ] **T046** [US4] 实现闸门设置控件
  - 文件: `public/js/components/gate-settings.js`
  - 闸门A配置：
    - 起始位置滑块（0-1000μs）
    - 宽度滑块（10-500μs）
    - 高度滑块（5-95%）
    - 颜色选择器（默认红色）
  - 闸门B配置：同上（默认绿色）
  - 在波形图上实时显示闸门位置（透明色块）
  - 支持在波形图上拖动调整闸门

- [ ] **T047** [US4] 实现触发设置控件
  - 文件: `public/js/components/trigger-settings.js`
  - 触发源选择：外部触发/内部触发/软件触发
  - 触发阈值滑块：范围-10V到+10V
  - 触发边沿选择：上升沿/下降沿/双边沿
  - 触发延迟滑块：0-1000μs
  - 触发指示器：显示当前触发状态（灰色=未触发，橙色=已触发）

- [ ] **T048** [US4] 实现参数应用逻辑
  - 文件: `public/js/services/param-manager.js`
  - 监听参数变化事件
  - 验证参数有效性
  - 将参数应用到波形显示（更新ECharts配置）
  - 将参数应用到数据采集（如果正在采集）
  - 显示应用成功/失败通知

- [ ] **T049** [P] [US4] 实现配置模板管理
  - 文件: `public/js/features/config-templates.js`
  - 创建「保存为模板」功能：
    - 弹出对话框，输入模板名称
    - 将当前所有参数保存到 `mag_configurations` 表
    - 关联当前项目ID
  - 创建「加载模板」功能：
    - 显示模板列表（下拉菜单）
    - 选择模板后，读取配置数据
    - 应用到所有参数控件
    - 触发参数应用逻辑
  - 创建「删除模板」功能
  - 创建「导出模板」功能（JSON文件）
  - 创建「导入模板」功能（上传JSON文件）

- [ ] **T050** [US4] 实现参数预设
  - 文件: `public/js/utils/param-presets.js`
  - 定义3种预设配置：
    - 碳钢管道预设（增益60，频率200Hz，灵敏度0.05）
    - 不锈钢管道预设（增益75，频率150Hz，灵敏度0.08）
    - 合金钢管道预设（增益80，频率180Hz，灵敏度0.06）
  - 在参数面板显示「应用预设」按钮
  - 点击后显示预设列表，选择后应用

- [ ] **T051** [US4] 实现参数锁定功能
  - 文件: `public/js/features/param-lock.js`
  - 添加「锁定参数」复选框
  - 锁定后，所有参数控件变为禁用状态
  - 防止误操作修改参数
  - 解锁时需要确认（输入当前用户密码）

**Checkpoint**: 参数配置功能完整，可以调整所有检测参数并实时应用

---

## Phase 7: User Story 6 - 自动保存数据（P2）

**目标**: 实现检测数据的自动保存，防止意外中断导致数据丢失

**用户故事**: 
> 作为检测工程师，我希望系统自动保存检测数据，以便意外中断时不会丢失数据。

**独立测试标准**:
- ✅ 数据采集时，每秒自动保存到Supabase
- ✅ 浏览器刷新或关闭前提示保存
- ✅ 系统崩溃后，可以恢复未保存的数据
- ✅ 自动保存不影响UI性能（异步操作）

### 实现任务

- [ ] **T052** [P] [US6] 创建自动保存服务
  - 文件: `public/js/services/auto-save.js`
  - 实现定时保存函数 `startAutoSave(interval)`
  - 默认间隔1秒（1000ms）
  - 每次保存时：
    - 收集当前缓冲区中的新数据点
    - 批量插入到 `mag_detection_data` 表
    - 标记已保存的数据点
  - 实现停止保存函数 `stopAutoSave()`
  - 使用 `setInterval` 实现定时器

- [ ] **T053** [US6] 实现浏览器关闭前保存
  - 文件: `public/js/features/before-unload.js`
  - 监听 `window.onbeforeunload` 事件
  - 检查是否有未保存的数据
  - 如果有，显示确认对话框：「您有未保存的数据，确定要离开吗?」
  - 如果用户选择留下，执行立即保存
  - 保存完成后允许离开

- [ ] **T054** [P] [US6] 实现本地缓存机制
  - 文件: `public/js/services/local-cache.js`
  - 使用 `localStorage` 存储未保存的数据
  - 数据结构：`{ projectId, timestamp, data: [...] }`
  - 实现写入缓存函数 `cacheData(projectId, data)`
  - 实现读取缓存函数 `getCachedData(projectId)`
  - 实现清除缓存函数 `clearCache(projectId)`
  - 缓存容量限制：最多5MB

- [ ] **T055** [US6] 实现数据恢复功能
  - 文件: `public/js/features/data-recovery.js`
  - 页面加载时，检查 `localStorage` 中是否有未保存数据
  - 如果有，显示恢复对话框：
    - 「检测到未保存的数据（{数据点数}个点），是否恢复？」
    - 「恢复」按钮：将缓存数据加载到波形图
    - 「丢弃」按钮：清除缓存数据
  - 恢复后，立即触发自动保存

- [ ] **T056** [US6] 实现保存状态指示器
  - 文件: `public/js/components/save-indicator.js`
  - 在状态栏显示保存状态图标
  - 3种状态：
    - 已保存（绿色勾号✓）
    - 保存中（橙色旋转图标⟳）
    - 未保存（红色感叹号⚠）
  - 显示最后保存时间：「上次保存：2分钟前」
  - 点击图标可手动触发立即保存

- [ ] **T057** [US6] 实现保存失败重试机制
  - 文件: `public/js/services/save-retry.js`
  - 当保存失败时（网络错误、服务器错误）：
    - 将失败的数据缓存到本地
    - 显示错误通知：「保存失败，将自动重试」
    - 启动重试定时器（指数退避：1s, 2s, 4s, 8s...）
    - 最多重试5次
  - 重试成功后：
    - 清除缓存
    - 显示成功通知：「数据已保存」
  - 重试失败后：
    - 提示用户手动保存或导出数据

**Checkpoint**: 自动保存功能正常，数据不会丢失，恢复功能可用

---

## Phase 8: User Story 5 - 报告生成（P3）

**目标**: 根据检测数据生成符合ISO 9934标准的检测报告

**用户故事**: 
> 作为质量主管，我希望查看符合ISO 9934标准格式的检测报告，以便向监管部门提交合规文档。

**独立测试标准**:
- ✅ 报告包含所有必需字段（项目信息、检测参数、缺陷记录、结论）
- ✅ 报告格式符合ISO 9934标准
- ✅ 支持导出为PDF格式
- ✅ 报告生成时间<10秒（包含100个缺陷的项目）

### 实现任务

- [ ] **T058** [P] [US5] 创建报告生成页面
  - 文件: `public/pages/report-generator.html`
  - 顶部：项目选择器（下拉列表）
  - 报告配置区域：
    - 报告名称（默认：「{项目名称}-检测报告-{日期}」）
    - 报告标准选择（ISO 9934-1/ASTM E709/EN 1290）
    - 是否包含波形图（复选框）
    - 是否包含缺陷图片（复选框）
    - 报告模板选择（标准/详细/简洁）
  - 预览区域：显示报告HTML预览
  - 操作按钮：「生成报告」、「导出PDF」、「保存草稿」

- [ ] **T059** [US5] 实现报告模板引擎
  - 文件: `public/js/services/report-template.js`
  - 定义报告模板（HTML + CSS）：
    - 标题页：项目名称、检测日期、检测人员、报告编号
    - 目录页：自动生成章节目录
    - 第1章：项目概述（项目信息、管道规格）
    - 第2章：检测方法（检测标准、参数配置）
    - 第3章：检测结果（缺陷统计、波形图、缺陷列表）
    - 第4章：结论与建议（合格/不合格判定、改进建议）
    - 附录：原始数据表格
  - 实现模板变量替换函数 `renderTemplate(template, data)`
  - 支持条件渲染（如：无缺陷时隐藏缺陷列表）

- [ ] **T060** [US5] 实现报告数据聚合
  - 文件: `public/js/services/report-data-aggregator.js`
  - 实现 `aggregateReportData(projectId)` 函数：
    - 获取项目基本信息
    - 获取所有检测数据
    - 获取所有缺陷记录
    - 计算统计数据：
      - 检测总时长
      - 数据点总数
      - 缺陷总数
      - 缺陷类型分布
      - 缺陷严重程度分布
    - 生成波形图截图（使用ECharts的 `getDataURL()`）
    - 返回完整的报告数据对象

- [ ] **T061** [US5] 实现PDF导出功能
  - 文件: `public/js/features/pdf-export.js`
  - 使用第三方库：`jsPDF` + `html2canvas`
  - 通过CDN引入：`<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>`
  - 实现 `exportToPDF(reportHTML)` 函数：
    - 将报告HTML转为Canvas（使用 `html2canvas`）
    - 将Canvas转为PDF（使用 `jsPDF`）
    - 设置PDF元数据（标题、作者、创建日期）
    - 触发下载：文件名「{报告名称}.pdf」
  - 显示导出进度条

- [ ] **T062** [P] [US5] 实现报告保存功能
  - 文件: `public/js/features/report-save.js`
  - 将报告内容保存到 `mag_reports` 表：
    - `project_id`: 关联项目ID
    - `report_name`: 报告名称
    - `report_content`: 报告HTML内容
    - `status`: 'draft'（草稿）或 'final'（最终版）
    - `metadata`: JSON格式，包含报告配置和统计数据
  - 保存成功后显示通知
  - 在项目详情页的「报告」Tab中显示

- [ ] **T063** [US5] 实现报告预览功能
  - 文件: `public/js/features/report-preview.js`
  - 实时渲染报告HTML
  - 在预览区域显示
  - 支持缩放（50%, 75%, 100%, 125%, 150%）
  - 支持打印预览（调用 `window.print()`）

- [ ] **T064** [US5] 实现报告模板管理
  - 文件: `public/js/features/report-template-manager.js`
  - 创建「管理模板」页面
  - 显示现有模板列表（标准/详细/简洁）
  - 支持创建自定义模板：
    - 模板名称
    - 模板HTML编辑器（使用简单的textarea）
    - 可用变量列表（如 `{{projectName}}`, `{{defectCount}}`）
  - 支持导入/导出模板（JSON格式）

**Checkpoint**: 报告生成功能完整，可以生成符合标准的PDF报告

---

## Phase 9: User Story 7 - 数据导出（P3）

**目标**: 支持将检测数据导出为CSV、Excel、PDF等格式

**用户故事**: 
> 作为数据分析师，我希望导出CSV/PDF格式的历史数据，以便进行外部分析。

**独立测试标准**:
- ✅ 支持导出为CSV格式（原始数据）
- ✅ 支持导出为Excel格式（带格式）
- ✅ 支持导出为PDF格式（可视化报表）
- ✅ 支持批量导出（选择多个项目）
- ✅ 导出时间<30秒（10000条记录）

### 实现任务

- [ ] **T065** [P] [US7] 创建数据导出页面
  - 文件: `public/pages/export.html`
  - 顶部：项目选择器（支持多选）
  - 数据范围选择：
    - 日期范围选择器
    - 数据类型复选框（检测数据/缺陷记录/报告）
  - 导出格式选择：CSV/Excel/PDF
  - 导出选项：
    - 是否包含表头（CSV/Excel）
    - 列分隔符（CSV）：逗号/分号/制表符
    - 日期格式：YYYY-MM-DD / MM/DD/YYYY / DD/MM/YYYY
  - 预览区域：显示前100行数据
  - 操作按钮：「预览」、「导出」

- [ ] **T066** [US7] 实现CSV导出功能
  - 文件: `public/js/features/csv-export.js`
  - 实现 `exportToCSV(data, options)` 函数
  - 将数据数组转为CSV格式：
    - 第一行：列名（如果包含表头）
    - 后续行：数据行，用分隔符分隔
    - 处理特殊字符（逗号、引号、换行符）
  - 创建Blob对象
  - 触发下载：文件名「{项目名称}-检测数据-{日期}.csv」
  - 编码：UTF-8（带BOM，确保Excel正确打开）

- [ ] **T067** [US7] 实现Excel导出功能
  - 文件: `public/js/features/excel-export.js`
  - 使用第三方库：`SheetJS` (xlsx)
  - 通过CDN引入：`<script src="https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js"></script>`
  - 实现 `exportToExcel(data, options)` 函数：
    - 创建工作簿（Workbook）
    - 创建工作表（Worksheet）
    - 添加数据到工作表
    - 设置列宽自适应
    - 设置表头样式（粗体、橙色背景）
    - 导出为`.xlsx`文件
  - 支持多工作表：检测数据、缺陷记录、统计汇总

- [ ] **T068** [US7] 实现PDF数据表导出
  - 文件: `public/js/features/pdf-data-export.js`
  - 使用 `jsPDF` + `jspdf-autotable` 插件
  - 实现 `exportDataToPDF(data, options)` 函数：
    - 创建PDF文档
    - 添加标题和页码
    - 使用 `autoTable` 插件生成表格
    - 表格样式：橙色表头、条纹行
    - 自动分页
    - 导出为`.pdf`文件

- [ ] **T069** [P] [US7] 实现批量导出功能
  - 文件: `public/js/features/batch-export.js`
  - 支持选择多个项目
  - 为每个项目生成单独的文件
  - 将所有文件打包为ZIP（使用 `JSZip` 库）
  - 通过CDN引入：`<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>`
  - 显示导出进度条（当前项目 X / 总项目数 Y）
  - 触发下载：文件名「检测数据导出-{日期}.zip」

- [ ] **T070** [US7] 实现导出历史记录
  - 文件: `public/js/features/export-history.js`
  - 在 `mag_files` 表中记录每次导出操作：
    - `file_name`: 导出的文件名
    - `file_type`: 'export'
    - `metadata`: JSON格式，包含导出配置（项目、日期范围、格式等）
  - 创建「导出历史」页面，显示历史记录列表
  - 支持重新下载历史导出文件（如果文件仍保存在存储中）
  - 支持重新执行历史导出配置

- [ ] **T071** [US7] 实现导出模板功能
  - 文件: `public/js/features/export-templates.js`
  - 支持保存导出配置为模板
  - 模板包含：
    - 模板名称
    - 数据类型选择
    - 列选择（哪些列导出）
    - 导出格式和选项
  - 支持加载模板，快速执行导出
  - 模板列表显示在导出页面顶部

**Checkpoint**: 数据导出功能完整，支持多种格式和批量操作

---

## Phase 10: 集成、优化和测试

**目的**: 完善跨功能集成，优化性能，执行全面测试

### 集成任务

- [ ] **T072** [P] 实现路由管理
  - 文件: `public/js/router.js`
  - 使用Hash路由（`#/projects`, `#/waveform`, `#/settings`等）
  - 监听 `hashchange` 事件
  - 根据路由加载对应页面
  - 实现页面切换动画（淡入淡出）

- [ ] **T073** [P] 实现全局状态管理
  - 文件: `public/js/store.js`
  - 创建简单的状态管理器（类Redux）
  - 管理全局状态：
    - 当前用户信息
    - 当前项目ID
    - 参数配置
    - UI状态（加载中、错误信息等）
  - 实现 `getState()`, `setState()`, `subscribe()` 方法

- [ ] **T074** [P] 实现用户认证集成
  - 文件: `public/js/features/auth-integration.js`
  - 创建登录页面（`public/pages/login.html`）
  - 登录成功后保存token到 `localStorage`
  - 在所有API请求中附加Authorization头
  - 实现登出功能
  - 实现受保护路由（未登录时跳转到登录页）

- [ ] **T075** 实现系统监控集成
  - 文件: `public/js/features/system-monitoring.js`
  - 在状态栏显示系统状态：
    - Supabase连接状态（心跳检测，每30秒）
    - 存储空间使用率（调用Supabase Storage API）
    - 当前在线用户数（通过Realtime Presence）
  - 异常时显示告警提示

- [ ] **T076** 实现错误边界和降级
  - 文件: `public/js/utils/error-boundary.js`
  - 全局捕获JavaScript错误（`window.onerror`）
  - 全局捕获Promise拒绝（`window.onunhandledrejection`）
  - 显示友好的错误页面（而不是空白页）
  - 记录错误到 `mag_audit_logs` 表
  - 提供「刷新页面」和「报告问题」按钮

### 优化任务

- [ ] **T077** [P] 性能优化：代码分割
  - 按页面拆分JavaScript文件
  - 使用动态import（`import()`）延迟加载非首屏代码
  - 优化ECharts加载（仅加载需要的组件）

- [ ] **T078** [P] 性能优化：图片优化
  - 压缩所有图片（使用工具如TinyPNG）
  - 为不同分辨率提供不同尺寸的图片（srcset）
  - 使用WebP格式（带JPEG/PNG降级）

- [ ] **T079** [P] 性能优化：缓存策略
  - 配置Service Worker（可选）
  - 设置静态资源缓存（CSS、JS、图片）
  - 设置API响应缓存（短期缓存，5分钟）

- [ ] **T080** [P] 可访问性优化
  - 添加ARIA标签（`aria-label`, `role`等）
  - 确保键盘导航可用（Tab、Enter、Esc）
  - 添加焦点指示器
  - 确保颜色对比度符合WCAG 2.1 AA标准

- [ ] **T081** [P] 国际化准备
  - 创建语言文件：`public/js/i18n/zh-CN.js`, `public/js/i18n/en-US.js`
  - 提取所有硬编码文本到语言文件
  - 实现语言切换函数
  - 在设置页面添加语言选择器

### 测试任务（全部开发完成后执行）

- [ ] **T082** 编制详细测试用例文档
  - 文件: `tests/TEST_CASES.md`
  - 按功能模块组织测试用例
  - 每个用户故事至少10个测试用例
  - 包含：测试目标、前置条件、操作步骤、预期结果

- [ ] **T083** 执行功能测试（手动）
  - 按测试用例逐一执行
  - 测试所有用户故事功能
  - 测试边界条件和异常情况
  - 记录测试结果到 `tests/FUNCTIONAL_TEST_RESULTS.md`

- [ ] **T084** 执行性能测试
  - 测试首页加载时间（目标<3秒）
  - 测试波形刷新率（目标≥10Hz）
  - 测试大数据量查询（10000条记录，目标<5秒）
  - 测试并发用户（50个用户同时操作）
  - 记录测试结果到 `tests/PERFORMANCE_TEST_RESULTS.md`

- [ ] **T085** 执行兼容性测试
  - 测试浏览器：Chrome 90+, Edge 90+, Firefox 88+, Safari 14+
  - 测试分辨率：1024×768, 1920×1080, 2560×1440, 3840×2160
  - 测试设备：桌面、平板、触摸屏
  - 记录测试结果到 `tests/COMPATIBILITY_TEST_RESULTS.md`

- [ ] **T086** 执行安全测试
  - 测试SQL注入防护
  - 测试XSS防护
  - 测试CSRF防护
  - 测试认证和授权
  - 测试RLS策略
  - 记录测试结果到 `tests/SECURITY_TEST_RESULTS.md`

- [ ] **T087** 修复测试中发现的所有问题
  - 按优先级修复bug
  - 重新测试修复后的功能
  - 确认所有测试用例通过

### 文档和部署

- [ ] **T088** [P] 更新README.md
  - 添加项目截图
  - 更新功能列表
  - 更新安装和运行说明
  - 添加使用指南
  - 添加API文档链接

- [ ] **T089** [P] 创建用户手册
  - 文件: `docs/USER_MANUAL.md`
  - 每个功能模块的详细使用说明
  - 包含截图和操作步骤
  - 常见问题解答（FAQ）

- [ ] **T090** [P] 创建开发者文档
  - 文件: `docs/DEVELOPER_GUIDE.md`
  - 项目架构说明
  - 代码结构说明
  - 如何添加新功能
  - 如何调试和测试

- [ ] **T091** 准备部署到Netlify
  - 确认 `netlify.toml` 配置正确
  - 设置环境变量（Supabase URL和KEY）
  - 连接Git仓库到Netlify
  - 触发首次部署
  - 验证生产环境功能正常

- [ ] **T092** 配置自定义域名（可选）
  - 在Netlify设置自定义域名
  - 配置DNS记录
  - 启用HTTPS（Let's Encrypt自动证书）

**Checkpoint**: 全部功能开发完成，测试通过，文档齐全，已部署到生产环境

---

## 依赖关系和执行顺序

### 阶段依赖

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← 必须100%完成才能继续
    ↓
Phase 3-9 (User Stories) ← 可并行开发
    ↓
Phase 10 (Integration & Testing)
    ↓
Deployment
```

### 用户故事依赖

- **US-001 (界面)**: 无依赖，可最先开始
- **US-002 (波形)**: 依赖US-001（需要界面容器）
- **US-003 (项目管理)**: 依赖Foundational，独立于其他故事
- **US-004 (参数配置)**: 依赖US-002（参数应用到波形）
- **US-006 (自动保存)**: 依赖US-002（保存波形数据）
- **US-005 (报告生成)**: 依赖US-003（需要项目数据）
- **US-007 (数据导出)**: 依赖US-003（需要项目数据）

### 阶段内任务顺序

- **Setup (Phase 1)**: 所有[P]任务可并行
- **Foundational (Phase 2)**: T007-T008顺序执行，T009-T017可并行
- **User Story实现**: 每个故事内部，[P]标记的任务可并行
- **Integration (Phase 10)**: T072-T076顺序执行，T077-T081可并行，T082-T087顺序执行

---

## 并行执行示例

### Setup阶段（Phase 1）

```bash
# 可同时启动的任务：
T001: 创建项目文件夹结构
T002: 配置Tailwind CSS
T003: 配置ECharts
T004: 创建环境配置文件
T005: 配置部署文件
```

### Foundational阶段（Phase 2）

```bash
# 数据库设置（顺序）：
T007: 应用Supabase数据库迁移
T008: 插入种子数据

# 服务层（并行）：
T009: 创建Supabase客户端
T010: 创建认证服务
T011: 创建项目服务
T012: 创建检测数据服务
T013: 创建缺陷服务

# 工具库（并行）：
T014: 创建常量定义文件
T015: 创建工具函数库
T016: 创建数据处理工具
T017: 创建UI组件工具
```

### User Story 1（Phase 3）

```bash
# 可并行的任务：
T018: 创建主页面HTML结构
T019: 实现工业风格CSS样式

# 然后并行：
T020: 实现左侧垂直工具栏
T021: 实现右侧垂直快捷栏
T022: 实现顶部状态栏
T023: 实现底部导航栏
T024: 实现中央主显示区域布局
T025: 实现响应式布局

# 最后：
T026: 实现界面初始化脚本
```

---

## 实施策略

### MVP优先（User Story 1 + 2）

如果时间紧张，可以先完成MVP：

1. ✅ **Phase 1**: Setup（1天）
2. ✅ **Phase 2**: Foundational（2-3天）
3. ✅ **Phase 3**: US-001 工业界面（3-4天）
4. ✅ **Phase 4**: US-002 波形显示（4-5天）
5. ✅ **测试和部署**（2天）

**总计**: 12-15天，可交付一个能显示实时波形的工业界面。

### 完整版（所有用户故事）

1. **Week 1-2**: Setup + Foundational + US-001 + US-002
2. **Week 3**: US-003 项目管理 + US-006 自动保存
3. **Week 4**: US-004 参数配置
4. **Week 5**: US-005 报告生成 + US-007 数据导出
5. **Week 6-7**: Integration + Optimization
6. **Week 8**: Testing + Documentation + Deployment

**总计**: 8周，完整功能上线。

### 团队并行策略

如果有3名开发者：

- **Developer A**: US-001 界面 → US-002 波形 → US-004 参数
- **Developer B**: US-003 项目管理 → US-006 自动保存 → US-005 报告
- **Developer C**: Foundational基础设施 → US-007 数据导出 → Integration集成

---

## 验收标准总览

### 功能完整性

- [ ] 所有7个用户故事100%实现
- [ ] 所有功能需求（FR-*）验收标准通过
- [ ] 所有非功能需求（性能、安全、可用性）达标

### 质量标准

- [ ] 代码审查通过（无严重bug）
- [ ] 所有测试用例通过（功能、性能、兼容性、安全）
- [ ] 文档齐全（README、用户手册、开发者文档）

### 部署标准

- [ ] 成功部署到Netlify生产环境
- [ ] 所有环境变量配置正确
- [ ] HTTPS启用，自定义域名配置（如需要）
- [ ] 生产环境验证通过（所有功能正常）

---

## 任务统计

| 阶段 | 任务数 | 预计工时 |
|------|--------|----------|
| Phase 1: Setup | 6 | 1天 |
| Phase 2: Foundational | 11 | 2-3天 |
| Phase 3: US-001 界面 | 9 | 3-4天 |
| Phase 4: US-002 波形 | 7 | 4-5天 |
| Phase 5: US-003 项目管理 | 10 | 4-5天 |
| Phase 6: US-004 参数配置 | 8 | 3-4天 |
| Phase 7: US-006 自动保存 | 6 | 2-3天 |
| Phase 8: US-005 报告生成 | 7 | 4-5天 |
| Phase 9: US-007 数据导出 | 7 | 3-4天 |
| Phase 10: Integration & Testing | 21 | 7-10天 |
| **总计** | **92** | **33-43天** |

---

## 风险和注意事项

### 高风险任务

- **T007-T008**: Supabase数据库迁移 - 如果失败会阻塞所有后续任务
- **T028**: ECharts波形图配置 - 性能关键，需要仔细调优
- **T061**: PDF导出 - 第三方库依赖，可能有兼容性问题

### 缓解措施

- 优先完成高风险任务
- 为第三方库准备备选方案
- 及时测试，及早发现问题

---

## 下一步行动

1. **立即执行**: T001-T006 Setup阶段（1天内完成）
2. **然后执行**: T007-T008 数据库迁移（参考 `docs/SUPABASE_SETUP.md`）
3. **并行执行**: T009-T017 Foundational基础服务层
4. **开始开发**: T018+ User Story实现

**准备好开始了吗？** 🚀

执行命令: `/implement` 开始实施第一个任务！

---

**任务列表版本**: v1.0.0  
**最后更新**: 2025-10-08  
**维护人**: 开发团队

