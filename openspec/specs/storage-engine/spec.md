# storage-engine Specification

## Purpose
TBD - created by archiving change add-simple-mysql-database. Update Purpose after archive.
## Requirements
### Requirement: 页式存储管理
系统SHALL使用固定大小的页面作为存储的基本单位，实现高效的磁盘IO操作。

#### Scenario: 页面分配
- **WHEN** 创建新表或插入数据需要新页面
- **THEN** 分配16KB大小的页面，更新页面目录信息

#### Scenario: 页面读取
- **WHEN** 查询需要访问特定页面的数据
- **THEN** 从磁盘读取完整页面到内存，验证页面校验和

#### Scenario: 页面写入
- **WHEN** 数据修改需要持久化到磁盘
- **THEN** 计算页面校验和，将完整页面写入磁盘文件

### Requirement: 聚簇索引存储
系统SHALL使用聚簇索引作为主要的数据存储方式，数据行按主键顺序存储。

#### Scenario: 主键聚簇索引
- **WHEN** 创建表时指定主键
- **THEN** 创建B+树聚簇索引，叶子节点存储完整数据行

#### Scenario: 按主键查询
- **WHEN** 使用主键查询数据 "SELECT * FROM users WHERE id = 123"
- **THEN** 通过聚簇索引直接定位数据行，无需额外IO

#### Scenario: 范围查询优化
- **WHEN** 执行主键范围查询 "SELECT * FROM users WHERE id BETWEEN 100 AND 200"
- **THEN** 利用聚簇索引的有序性，顺序扫描叶子节点

### Requirement: 数据行格式
系统SHALL定义紧凑的数据行存储格式，支持变长字段和NULL值。

#### Scenario: 定长字段存储
- **WHEN** 存储INT、CHAR等定长字段
- **THEN** 按固定偏移量存储，提高访问效率

#### Scenario: 变长字段存储
- **WHEN** 存储VARCHAR、TEXT等变长字段
- **THEN** 使用长度前缀 + 数据内容的格式存储

#### Scenario: NULL值处理
- **WHEN** 字段值为NULL
- **THEN** 在NULL位图中标记，不占用数据存储空间

### Requirement: 表空间管理
系统SHALL管理表的磁盘文件，支持表的创建、删除和空间分配。

#### Scenario: 表文件创建
- **WHEN** 执行CREATE TABLE语句
- **THEN** 创建对应的.ibd文件，初始化表空间头部信息

#### Scenario: 空间扩展
- **WHEN** 表数据增长超过当前文件大小
- **THEN** 自动扩展文件大小，分配新的页面区间

#### Scenario: 空间回收
- **WHEN** 删除大量数据后有空闲页面
- **THEN** 标记空闲页面供后续使用，必要时进行碎片整理

### Requirement: 数据完整性保护
系统SHALL提供数据完整性检查机制，防止数据损坏。

#### Scenario: 页面校验和
- **WHEN** 读取页面时
- **THEN** 验证页面校验和，检测数据损坏

#### Scenario: 双写缓冲
- **WHEN** 写入页面可能被部分写入（torn page）
- **THEN** 使用双写缓冲机制确保页面写入的原子性

#### Scenario: 崩溃恢复验证
- **WHEN** 数据库启动时
- **THEN** 验证关键页面的完整性，检测未完成的写入操作

