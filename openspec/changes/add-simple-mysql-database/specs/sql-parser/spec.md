## ADDED Requirements

### Requirement: SQL词法分析
系统 SHALL 能够将SQL语句分解为词法单元（tokens），识别关键字、标识符、字面量、操作符等基本元素。

#### Scenario: 解析基本SELECT语句
- **WHEN** 输入SQL语句 "SELECT id, name FROM users WHERE age > 18"
- **THEN** 返回词法单元序列：[SELECT, id, ',', name, FROM, users, WHERE, age, '>', 18]

#### Scenario: 识别字符串字面量
- **WHEN** 输入包含字符串的SQL "SELECT name FROM users WHERE name = 'John Doe'"
- **THEN** 正确识别字符串字面量 'John Doe' 为单个token

#### Scenario: 处理注释
- **WHEN** 输入包含注释的SQL "SELECT id /* user id */ FROM users -- get all users"
- **THEN** 忽略注释内容，返回有效的词法单元

### Requirement: SQL语法分析
系统SHALL能够将词法单元序列解析为抽象语法树（AST），验证SQL语法的正确性。

#### Scenario: 解析CREATE TABLE语句
- **WHEN** 输入 "CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(50) NOT NULL)"
- **THEN** 生成包含表名、列定义、约束信息的AST节点

#### Scenario: 解析复杂SELECT语句
- **WHEN** 输入 "SELECT u.name, COUNT(o.id) FROM users u JOIN orders o ON u.id = o.user_id GROUP BY u.name HAVING COUNT(o.id) > 5"
- **THEN** 生成包含连接、聚合、分组、过滤条件的完整AST

#### Scenario: 语法错误检测
- **WHEN** 输入语法错误的SQL "SELECT FROM users WHERE"
- **THEN** 抛出语法错误异常，包含错误位置和描述信息

### Requirement: 支持的SQL语句类型
系统SHALL支持基本的DDL和DML语句解析。

#### Scenario: DDL语句支持
- **WHEN** 输入CREATE TABLE、DROP TABLE、ALTER TABLE语句
- **THEN** 正确解析并生成相应的AST结构

#### Scenario: DML语句支持
- **WHEN** 输入SELECT、INSERT、UPDATE、DELETE语句
- **THEN** 正确解析并生成相应的AST结构

#### Scenario: 数据类型支持
- **WHEN** 定义列时使用INT、VARCHAR、CHAR、DATE、TIMESTAMP等类型
- **THEN** 正确识别数据类型并保存类型信息

### Requirement: 表达式解析
系统SHALL能够解析各种SQL表达式，包括算术表达式、比较表达式、逻辑表达式等。

#### Scenario: 算术表达式解析
- **WHEN** 输入 "SELECT price * quantity + tax FROM orders"
- **THEN** 正确解析算术表达式的运算符优先级和结合性

#### Scenario: 函数调用解析
- **WHEN** 输入 "SELECT COUNT(*), MAX(age), MIN(age) FROM users"
- **THEN** 正确识别聚合函数调用及其参数

#### Scenario: 子查询解析
- **WHEN** 输入 "SELECT * FROM users WHERE id IN (SELECT user_id FROM orders)"
- **THEN** 正确解析嵌套的子查询结构