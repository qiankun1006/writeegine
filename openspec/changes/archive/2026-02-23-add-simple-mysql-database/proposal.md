# Change: 实现简易MySQL数据库系统

## Why
当前项目缺乏数据库存储能力。为了深入理解数据库内部机制和提供完整的数据存储解决方案，需要实现一个包含MySQL核心特性的简易数据库系统。这将帮助学习和掌握数据库的核心概念，包括事务管理、并发控制、索引优化等关键技术。

## What Changes
- **新增** SQL解析器：支持基本的DDL和DML语句解析
- **新增** 查询优化器：基于规则和成本的查询优化
- **新增** 存储引擎：支持页式存储和聚簇索引
- **新增** 事务管理系统：支持ACID特性和多版本并发控制(MVCC)
- **新增** 日志系统：包含Undo Log、Redo Log和Binary Log
- **新增** 索引系统：B+树聚簇索引和二级索引
- **新增** 缓冲池管理：内存页面管理和LRU淘汰策略
- **新增** 锁管理器：行级锁和表级锁支持
- **新增** 网络协议层：基于MySQL协议的客户端连接支持

## Impact
- 影响的规范: 将创建多个新的capability规范
  - sql-parser: SQL语句解析能力
  - query-optimizer: 查询优化能力
  - storage-engine: 存储引擎能力
  - transaction-manager: 事务管理能力
  - logging-system: 日志系统能力
  - index-system: 索引系统能力
  - buffer-pool: 缓冲池管理能力
  - lock-manager: 锁管理能力
  - network-protocol: 网络协议能力
- 影响的代码: 这是一个全新的数据库系统实现
  - 核心包结构: com.example.writemyself.database.*
  - 主要模块: parser, optimizer, storage, transaction, logging, index, buffer, lock, network
- **BREAKING**: 无，这是全新功能的添加