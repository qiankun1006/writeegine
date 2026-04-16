# 骨骼素材生成 Agent 项目 - 面试指南

> 定位：**AI Agent 多步骨骼素材生成系统**，面向游戏资产制作场景，设计并落地了一套可观测、可降级的多模型协同流水线。

---

## 一、30秒电梯演讲（开场必备）

> "我做了一个游戏角色骨骼素材自动生成系统。它接受一张参考图或一段文本描述，自动走完图层分解、边缘精修、去背、骨骼绑定全流程，最终输出可直接导入 Spine / DragonBones 的骨骼动画包。
> 架构上我设计了两条流水线路径（FROM_REFERENCE / FROM_SCRATCH），每条路径的 6~7 个步骤全部持久化到 MySQL，前端实时轮询步骤状态，类似 CI/CD 的流水线可视化。"

---

## 二、系统架构亮点

### 2.1 双路径 Agent 架构

```
请求
 │
 ├── mode=FROM_REFERENCE（参考图转骨骼）
 │    步骤1: see-through 图层分解（主分割）
 │    步骤2: SAM2 精修图层边缘（辅助精修）
 │    步骤3: RMBG-2.0 逐层去背
 │    步骤4: OpenPose 关键点识别
 │    步骤5: 骨骼绑定数据生成
 │    步骤6: 打包输出（Spine/DragonBones）
 │
 └── mode=FROM_SCRATCH（从零生成）
      步骤1: OpenPose T-pose 骨骼线图
      步骤2: Flux.1-dev 高清生成（ControlNet+IP-Adapter合并入参）
      步骤3: see-through 图层分解
      步骤4: SAM2 精修边缘
      步骤5: RMBG-2.0 逐层去背
      步骤6: 骨骼绑定数据生成
      步骤7: 打包输出
```

**关键设计决策**：
- `mode` 作为路由字段，Controller 层做入参校验，Service 层做路由分发
- 两条路径共用辅助方法（`refineLayers`、`removeBackgroundPerLayer`），避免重复
- 步骤常量分组命名：`REF_STEP_*` vs `SCR_STEP_*`，一眼看出属于哪条路径

### 2.2 步骤模板方法 + Lambda 消除样板代码

核心抽象：`runImageStep` 和 `runDataStep`，统一处理：
- 进度更新 → stepStart → 执行业务逻辑 → 持久化中间产物 → stepSuccess/stepFailed

```java
// 每个步骤只需一行声明
String skeletonLine = runImageStep(taskId, SCR_STEP_SKELETON_LINE,
    2, "步骤1/7: 生成T-pose骨骼线图...", 8, "骨骼线图生成完成",
    "_step1_skeleton_line.png",
    () -> generateSkeletonLineImage(request.getTemplate()));
```

> 面试关键词：**Template Method Pattern + Functional Interface + Supplier Lambda**

### 2.3 步骤状态持久化（可观测性）

```
skeleton_pipeline_task   ← 主任务表（taskId、status、progress）
skeleton_pipeline_step   ← 步骤表（stepNo、status、startedAt、durationMs、outputImageUrl、dataJson）
```

- 内存 Map（`ConcurrentHashMap`）与 DB 双写，保持向后兼容
- 步骤耗时自动记录（`stepStartTimeMap`）
- 前端轮询分两个接口：`getStepsLight`（轻量，含状态不含图片URL）和 `getStepsFull`（完整）

### 2.4 降级策略（Graceful Degradation）

```
see-through.isAvailable() == true  → 调 see-through 微服务做图层分解
              false                 → 降级到 SAM2 纯肢体分割
SAM2 精修失败                       → 保留 see-through 原始图层（非致命）
RMBG-2.0 单层去背失败              → 保留原图，记录 warn，不中断流水线
```

> 面试关键词：**Fallback 模式、非致命错误隔离、多级降级**

---

## 三、面试官高频问题 & 答法

### Q1：你为什么要把步骤持久化到 MySQL？内存不够用吗？

**答**：
持久化的核心目的不是"存储量"，而是**可观测性和可恢复性**：
1. 服务重启后任务状态不丢失，前端不会看到"任务凭空消失"
2. 每步的耗时、中间图片 URL 记录在 DB，方便 debug 和性能分析
3. 后续可扩展"断点续跑"：某步失败后可以从失败步骤重跑，而不是整体重来

### Q2：`@Async` 异步任务，如果服务崩了怎么办？

**答**：
当前方案是**轻量级实现**，重启后内存 Map 丢失但 DB 有记录，前端轮询会返回"任务不存在"。
**更完整的方案**（可聊扩展点）：
- 引入消息队列（RocketMQ / Kafka），任务提交写 MQ，消费端处理，天然支持重试
- 或使用 `@Scheduled` 定期扫描 DB 中 PROCESSING 超时的任务做重试

### Q3：步骤数量在两条路径不一样（6步/7步），你怎么处理前端显示？

**答**：
后端在任务创建时按 mode 初始化对应数量的 `PENDING` 步骤记录写入 DB。前端拿到步骤列表后动态渲染，不硬编码步骤数——这是"数据驱动 UI"的设计。

### Q4：see-through 和 SAM2 的职责划分是怎么思考的？

**答**：
- **see-through**：语义理解型分割，能区分"盔甲""盾牌""头发"等语义图层，是主力
- **SAM2**：几何精度型分割，擅长精确边缘，用作 see-through 之后的精修手段
- 两者不是替代关系，是**粗分割 → 细精修**的流水线关系

### Q5：为什么去背要放在图层分解**之后**？

**答**：
这是架构调整中最关键的顺序问题：
- 原方案是"先整图去背再分割"，导致去背时背景信息已损失，影响边缘分割质量
- 正确顺序：先用 see-through 在**原始图**上分割出语义图层，再对每个图层单独去背
- 这样每层去背的输入图更干净，背景与前景对比度更高，RMBG-2.0 效果更好

---

## 四、扩展方向（面试加分项，告诉面试官你还想做什么）

### 4.1 引入 LangChain4j Agent 框架

**现状**：步骤调度是手写的 if-else 路由 + 顺序执行

**改进方向**：

```
用 LangChain4j 的 AiService + @Tool 注解重构为 Agent 模式

@AiService
interface SkeletonAgent {
    @SystemMessage("你是一个骨骼素材生成专家，根据请求选择合适的工具完成任务")
    String generateSkeleton(String userRequest);
}

@Tool("图层分解工具，输入原始图片Base64，输出图层列表")
LayerDecompositionResult decomposeLayer(String imageBase64) { ... }

@Tool("SAM2精修工具")
Map<String, String> refineLayers(...) { ... }
```

**优势**：LLM 可以根据上下文动态决定是否跳过某步骤，比如输入图层已经很干净时自动跳过 SAM2 精修。

### 4.2 引入路由 Agent（Router Agent）

```
用户请求
    │
    ▼
Router Agent（LLM判断）
    ├── 识别到参考图 → 派发给 ReferenceSkeletonAgent
    ├── 只有文字描述 → 派发给 ScratchSkeletonAgent
    └── 识别到已有骨骼文件 → 派发给 SkeletonEditAgent（新增）
```

替代现有的 `mode` 字段硬编码，改为 LLM 根据输入内容**自动路由**。

### 4.3 拆分子 Agent（Multi-Agent 协作）

```
SkeletonOrchestrator（协调者）
    ├── LayerDecompositionAgent   ← 专注图层分解，可独立部署
    ├── BackgroundRemovalAgent    ← 专注去背，可水平扩展
    ├── KeypointDetectionAgent    ← 专注关键点识别
    └── BindingGenerationAgent    ← 专注骨骼绑定数据生成
```

**与当前架构的映射**：当前这些都在 `EnhancedSkeletonAssetService` 里的方法中，改成独立 Agent 后：
- 每个 Agent 有自己的工具集和 System Prompt
- Orchestrator 通过消息传递协调，而不是方法调用
- 某个 Agent 升级不影响其他

### 4.4 引入记忆系统（Memory）

```
短期记忆：当前任务的步骤链（已经做了什么、中间产物是什么）
长期记忆：用户历史偏好（常用风格 anime、常用模板 openpose_25）
         ↓ 存入向量数据库（如 Milvus）
         ↓ 下次生成时 RAG 检索，自动带入偏好参数
```

**实现方式**：
- `ChatMemory`（LangChain4j 内置）存当前会话的步骤上下文
- 向量数据库存用户画像，减少重复配置

### 4.5 流式输出（Streaming）

将轮询模式升级为 SSE（Server-Sent Events）：

```
当前：前端每 2s 轮询 /enhanced-status/{taskId}
改进：后端步骤完成时主动推送 SSE 事件，前端订阅
```

---

## 五、技术关键词 Checklist（简历/面试必提）

| 类别 | 关键词 |
|------|--------|
| **架构模式** | 双路径 Agent、Pipeline 模式、Template Method、策略路由 |
| **AI 模型集成** | Flux.1-dev、ControlNet、IP-Adapter、SAM2、RMBG-2.0、see-through、OpenPose |
| **可靠性** | 降级策略（Fallback）、非致命错误隔离、步骤状态持久化 |
| **并发** | `@Async`、`ConcurrentHashMap`、线程池 `portraitTaskExecutor` |
| **可观测性** | 步骤耗时记录、中间产物 URL 存储、DB 双写 |
| **前后端** | 异步任务模式（202 Accepted + 轮询）、Vue3 Composition API、Pinia |
| **扩展方向** | LangChain4j、Router Agent、Multi-Agent、RAG 记忆系统、SSE 流式输出 |

---

## 六、面试官可能的追问 & 陷阱

| 问题 | 注意点 |
|------|--------|
| "你的 Agent 和普通微服务有什么区别？" | 强调：Agent 有**自主性**，可以根据中间结果决定下一步；普通微服务是被动调用 |
| "see-through 开源还是自研？" | 如实说是基于 [shitagaki-lab/see-through](https://github.com/shitagaki-lab/see-through) 做的服务集成，重点说集成策略和降级设计 |
| "ConcurrentHashMap 内存 Map 是不是有内存泄漏风险？" | 是的，应该加 TTL 清理，`cleanExpiredTasks()` 方法是留的扩展口，下一步用 Guava Cache 或 Caffeine 替换 |
| "为什么不用 Spring Batch？" | Spring Batch 适合批量数据处理，这里是单任务多步骤，每步有 AI 调用和 IO，不是数据批处理场景 |
| "LangChain4j 和直接调 API 有什么优势？" | 工具调用自动化（Tool Calling）、Prompt 管理、Memory 抽象、多模型切换（一套代码换 LLM）|

