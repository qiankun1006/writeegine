# constraint-system Specification

## Purpose
TBD - created by archiving change create-skeleton-animation-system. Update Purpose after archive.
## Requirements
### Requirement: IK反向动力学
系统SHALL提供IK反向动力学求解功能。

#### Scenario: 单链IK约束
- **WHEN** 开发者创建IK约束
- **THEN** 系统应提供 IKConstraint 类
- **AND** 支持目标位置和求解参数配置

```typescript
const ikConstraint = new IKConstraint("arm_ik");
ikConstraint.bone = forearmBone;
ikConstraint.target = handTarget;
ikConstraint.bendPositive = true;
ikConstraint.iterations = 10;

// 添加到骨架
armature.addConstraint(ikConstraint);

// 更新时自动求解IK
ikConstraint.update();
```

#### Scenario: 复杂链IK约束
- **WHEN** 需要处理多骨骼IK链
- **THEN** 系统应支持复杂IK求解
- **AND** 提供极向量控制功能

```typescript
const complexIK = new ComplexIKConstraint("leg_ik");
complexIK.addBone(thighBone);
complexIK.addBone(calfBone);
complexIK.addBone(footBone);
complexIK.target = footTarget;
complexIK.poleTarget = kneeTarget; // 极向量目标

// 设置约束参数
complexIK.iterations = 20;
complexIK.tolerance = 0.01;
complexIK.weight = 1.0;
```

### Requirement: 路径约束
系统SHALL提供骨骼沿路径运动的约束功能。

#### Scenario: 路径定义
- **WHEN** 开发者定义运动路径
- **THEN** 系统应提供 PathConstraint 类
- **AND** 支持路径点和跟随模式设置

```typescript
const pathConstraint = new PathConstraint("path_follow");

// 定义路径点
const pathPoints = [
    new Point(0, 0),
    new Point(100, 50),
    new Point(200, 0),
    new Point(300, 100)
];

pathConstraint.setPath(pathPoints);
pathConstraint.bone = followerBone;
pathConstraint.followMode = PathFollowMode.XAxis; // X轴跟随
```

#### Scenario: 路径动画
- **WHEN** 骨骼沿路径运动
- **THEN** 系统应根据进度计算位置
- **AND** 支持循环和速度控制

```typescript
// 骨骼沿路径运动
pathConstraint.progress = 0.0; // 起始位置

// 动画更新
function updatePathAnimation(deltaTime) {
    pathConstraint.progress += deltaTime * 0.5; // 速度控制
    if (pathConstraint.progress > 1.0) {
        pathConstraint.progress = 0.0; // 循环
    }
    pathConstraint.update();
}
```

### Requirement: 变换约束
系统SHALL提供骨骼间的变换关系约束。

#### Scenario: 复制变换约束
- **WHEN** 需要骨骼跟随其他骨骼变换
- **THEN** 系统应提供 TransformConstraint 类
- **AND** 支持选择性复制变换分量

```typescript
const copyTransform = new TransformConstraint("copy_transform");
copyTransform.sourceBone = sourceBone;
copyTransform.targetBone = targetBone;
copyTransform.copyX = true;
copyTransform.copyY = true;
copyTransform.copyRotation = true;
copyTransform.copyScale = false;

// 设置影响权重
copyTransform.weight = 0.8; // 80% 复制源骨骼变换
```

#### Scenario: 限制变换约束
- **WHEN** 需要限制骨骼变换范围
- **THEN** 系统应提供 LimitTransformConstraint 类
- **AND** 支持旋转和缩放范围限制

```typescript
const limitTransform = new LimitTransformConstraint("limit_rotation");
limitTransform.bone = rotatingBone;
limitTransform.minRotation = -45; // 最小旋转角度
limitTransform.maxRotation = 45;  // 最大旋转角度
limitTransform.minScale = 0.5;    // 最小缩放
limitTransform.maxScale = 2.0;    // 最大缩放
```

### Requirement: 物理约束
系统SHALL提供物理效果模拟约束。

#### Scenario: 重力约束
- **WHEN** 需要模拟重力效果
- **THEN** 系统应提供 GravityConstraint 类
- **AND** 支持重力向量和阻尼设置

```typescript
const gravityConstraint = new GravityConstraint("gravity");
gravityConstraint.bone = hairBone;
gravityConstraint.gravity = new Point(0, 9.8); // 重力向量
gravityConstraint.damping = 0.1; // 阻尼系数

// 添加到物理世界
physicsWorld.addConstraint(gravityConstraint);
```

#### Scenario: 弹簧约束
- **WHEN** 需要模拟弹簧效果
- **THEN** 系统应提供 SpringConstraint 类
- **AND** 支持刚度、阻尼和静止长度设置

```typescript
const springConstraint = new SpringConstraint("spring_hair");
springConstraint.bone = hairBone;
springConstraint.anchor = hairRoot; // 锚点
springConstraint.stiffness = 0.8;   // 刚度
springConstraint.damping = 0.2;      // 阻尼
springConstraint.restLength = 50;    // 静止长度
```

### Requirement: 约束求解器
系统SHALL提供高效的约束求解算法。

#### Scenario: 迭代求解
- **WHEN** 求解多个约束
- **THEN** 系统应使用迭代算法
- **AND** 支持可配置的迭代次数

```typescript
class ConstraintSolver {
    private constraints: Array<Constraint> = [];
    private iterations: number = 10;

    public addConstraint(constraint: Constraint): void {
        this.constraints.push(constraint);
    }

    public solve(): void {
        for (let i = 0; i < this.iterations; i++) {
            for (const constraint of this.constraints) {
                constraint.update();
            }
        }
    }
}
```

#### Scenario: 并行求解优化
- **WHEN** 处理大量约束
- **THEN** 系统应支持并行求解
- **AND** 提高求解性能

```typescript
// 将约束分组，独立约束可以并行求解
const independentGroups = constraintAnalyzer.groupIndependentConstraints(constraints);

for (const group of independentGroups) {
    // 并行处理独立约束组
    parallelExecute(() => {
        for (const constraint of group) {
            constraint.update();
        }
    });
}
```

### Requirement: 约束权重和混合
系统SHALL提供约束权重控制和混合功能。

#### Scenario: 约束权重动画
- **WHEN** 需要动态调整约束影响
- **THEN** 系统应支持权重动画
- **AND** 提供平滑的权重过渡

```typescript
const ikConstraint = new IKConstraint("arm_ik");
ikConstraint.weight = 0.0; // 初始权重为0

// 动画控制权重
const weightTimeline = new ConstraintTimelineData("ik_weight");
weightTimeline.addKeyFrame(0, 0.0);
weightTimeline.addKeyFrame(30, 1.0); // 30帧内权重从0到1

// 播放权重动画
weightTimeline.applyTo(ikConstraint);
```

#### Scenario: 约束优先级
- **WHEN** 多个约束影响同一骨骼
- **THEN** 系统应根据优先级处理
- **AND** 确保重要约束优先求解

```typescript
// 设置约束优先级
ikConstraint.priority = 10;     // 高优先级
pathConstraint.priority = 5;    // 中优先级
gravityConstraint.priority = 1; // 低优先级

// 求解器按优先级顺序处理约束
solver.solveByPriority(constraints);
```

### Requirement: 约束调试
系统SHALL提供约束可视化和调试工具。

#### Scenario: 约束可视化
- **WHEN** 开发者调试约束
- **THEN** 系统应提供可视化工具
- **AND** 显示约束关系和求解结果

```typescript
const constraintDebugger = new ConstraintDebugger();

// 显示IK约束
constraintDebugger.showIKChain(ikConstraint);
constraintDebugger.showTarget(ikConstraint.target);

// 显示路径约束
constraintDebugger.showPath(pathConstraint.path);
constraintDebugger.showProgress(pathConstraint.progress);

// 显示物理约束
constraintDebugger.showGravity(gravityConstraint.gravity);
constraintDebugger.showSpring(springConstraint);
```

#### Scenario: 约束性能分析
- **WHEN** 分析约束性能
- **THEN** 系统应提供性能分析工具
- **AND** 生成详细的性能报告

```typescript
const constraintProfiler = new ConstraintProfiler();
constraintProfiler.startProfiling();

// 运行一段时间
for (let i = 0; i < 1000; i++) {
    solver.solve();
}

// 获取性能报告
const report = constraintProfiler.getReport();
console.log(`Average solve time: ${report.averageTime}ms`);
console.log(`Constraint count: ${report.constraintCount}`);
console.log(`Most expensive constraint: ${report.mostExpensive.name}`);

