# query-optimizer Specification

## Purpose
TBD - created by archiving change add-simple-mysql-database. Update Purpose after archive.
## Requirements
### Requirement: 查询计划生成
系统SHALL能够为SQL查询生成高效的执行计划。

#### Scenario: 单表查询优化
- **WHEN** 执行单表SELECT查询时
- **THEN** 选择最优的访问路径（全表扫描或索引扫描）

#### Scenario: 多表连接优化
- **WHEN** 执行多表JOIN查询时
- **THEN** 确定最优的连接顺序和连接算法（嵌套循环、哈希连接等）

#### Scenario: 子查询优化
- **WHEN** 查询包含子查询时
- **THEN** 尝试将子查询重写为连接操作或使用物化策略

### Requirement: 基于规则的优化
系统SHALL实现基于规则的查询优化器，应用常见的优化规则。

#### Scenario: 谓词下推
- **WHEN** 查询包含WHERE条件时
- **THEN** 将过滤条件尽早应用，减少中间结果集大小

#### Scenario: 投影下推
- **WHEN** 查询只需要部分列时
- **THEN** 在扫描阶段就只读取需要的列，减少IO开销

#### Scenario: 常量折叠
- **WHEN** 表达式包含常量运算时
- **THEN** 在编译时计算常量表达式的结果

### Requirement: 基于成本的优化
系统SHALL实现简单的基于成本的优化器，选择成本最低的执行计划。

#### Scenario: 访问路径选择
- **WHEN** 有多个索引可用时
- **THEN** 根据选择性和IO成本选择最优索引

#### Scenario: 连接顺序选择
- **WHEN** 多表连接时
- **THEN** 根据表大小和连接条件选择最优的连接顺序

#### Scenario: 成本模型计算
- **WHEN** 评估执行计划成本时
- **THEN** 考虑CPU成本、IO成本和网络传输成本

### Requirement: 执行计划表示
系统SHALL提供清晰的执行计划表示，支持查询分析和调优。

#### Scenario: 计划树结构
- **WHEN** 生成执行计划时
- **THEN** 构建树形结构表示操作的层次关系

#### Scenario: 操作符信息
- **WHEN** 展示执行计划时
- **THEN** 显示每个操作符的类型、成本估算和基数估算

#### Scenario: 执行统计
- **WHEN** 查询执行完成后
- **THEN** 提供实际的执行时间、处理行数等统计信息

### Requirement: 索引选择优化
系统SHALL智能选择查询中使用的索引。

#### Scenario: 单列索引选择
- **WHEN** WHERE条件涉及单个列时
- **THEN** 选择该列上最适合的索引

#### Scenario: 复合索引利用
- **WHEN** 查询条件涉及多个列时
- **THEN** 选择能够最大化利用的复合索引

#### Scenario: 索引覆盖检测
- **WHEN** 查询的所有列都在索引中时
- **THEN** 使用覆盖索引避免回表操作

