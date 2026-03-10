# skeleton-animation-core Specification

## Purpose
TBD - created by archiving change add-2d-skeleton-animation. Update Purpose after archive.
## Requirements
### Requirement: 骨骼系统基础

系统 SHALL 支持创建和管理骨骼树结构。

#### Scenario: 用户创建一个有 3 个骨骼的骨架
- **WHEN** 用户创建新的骨骼系统
- **THEN** 系统支持创建、删除、重命名骨骼
- **AND** 系统支持设置骨骼的父子关系
- **AND** 系统维护骨骼的树形层级结构

### Requirement: 骨骼变换

系统 SHALL 支持骨骼的位置、旋转、缩放变换。

#### Scenario: 用户调整骨骼的旋转
- **WHEN** 用户修改骨骼的变换属性
- **THEN** 每个骨骼必须有本地位置（x, y）、旋转（弧度）、缩放（x, y）
- **AND** 这些属性必须可以在任何时间修改
- **AND** 变换必须立即反映到骨骼的世界坐标中

### Requirement: 正向动力学（FK）

系统 SHALL 支持级联变换计算。

#### Scenario: 父骨骼旋转时，子骨骼跟随旋转
- **WHEN** 用户修改父骨骼的变换
- **THEN** 子骨骼的世界变换必须基于父骨骼的世界变换计算
- **AND** 更改父骨骼必须自动更新所有子骨骼
- **AND** 世界变换必须使用矩阵计算（TRS 分解）

### Requirement: 动画数据结构

系统 SHALL 支持多个动画和关键帧。

#### Scenario: 创建一个 "idle" 动画，有 60 帧，骨骼在 0 帧和 60 帧有关键帧
- **WHEN** 用户创建动画
- **THEN** 一个骨架可以有多个动画
- **AND** 每个动画可以有多个轨道（每个骨骼一个）
- **AND** 每个轨道可以有多个关键帧

### Requirement: 关键帧插值

系统 SHALL 支持在关键帧之间进行插值。

#### Scenario: 插值两个骨骼位置的中点
- **WHEN** 系统需要在关键帧之间计算中间值
- **THEN** 系统必须支持线性插值
- **AND** 系统必须支持步进插值（无过渡）
- **AND** 系统必须正确处理旋转的角度插值

### Requirement: 动画播放

系统 SHALL 支持播放、暂停、停止动画。

#### Scenario: 用户播放动画，调整速度，然后停止
- **WHEN** 用户控制动画播放
- **THEN** 系统必须支持播放动画
- **AND** 系统必须支持暂停动画
- **AND** 系统必须支持停止并重置时间为 0
- **AND** 系统必须支持调整播放速度

