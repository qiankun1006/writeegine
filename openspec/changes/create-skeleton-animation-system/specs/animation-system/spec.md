# 动画系统规范

## ADDED Requirements

### Requirement: 时间轴系统
系统SHALL提供动画时间轴和关键帧管理功能。

#### Scenario: 创建时间轴数据
- **WHEN** 开发者创建时间轴数据
- **THEN** 系统应提供 BoneTimelineData 类
- **AND** 支持添加关键帧数据

```typescript
const timelineData = new BoneTimelineData("bone1");
const frameData = new TranslateFrameData();
frameData.position = 0;
frameData.x = 0;
frameData.y = 0;
timelineData.addFrame(frameData);
```

#### Scenario: 关键帧插值
- **WHEN** 动画播放到两个关键帧之间
- **THEN** 系统应进行线性插值计算
- **AND** 生成平滑的动画过渡

```typescript
// 在第0帧和第30帧之间插值
const frame1 = new TranslateFrameData();
frame1.position = 0;
frame1.x = 0;
frame1.y = 0;

const frame2 = new TranslateFrameData();
frame2.position = 30;
frame2.x = 100;
frame2.y = 50;

timelineData.addFrame(frame1);
timelineData.addFrame(frame2);

// 在第15帧时，应该插值为 x=50, y=25
```

### Requirement: 曲线编辑器
系统SHALL提供贝塞尔曲线编辑和插值功能。

#### Scenario: 贝塞尔曲线定义
- **WHEN** 开发者定义曲线动画
- **THEN** 系统应支持贝塞尔曲线控制点
- **AND** 提供非线性插值功能

```typescript
const curveFrame = new CurveFrameData();
curveFrame.position = 0;
curveFrame.curve = [0.25, 0.1, 0.25, 1.0]; // 贝塞尔曲线控制点
curveFrame.value = 0;

const endFrame = new CurveFrameData();
endFrame.position = 30;
endFrame.value = 100;
```

#### Scenario: 曲线插值计算
- **WHEN** 使用贝塞尔曲线进行插值
- **THEN** 系统应根据曲线计算进度
- **AND** 生成自然的动画效果

```typescript
// 使用贝塞尔曲线进行非线性插值
const progress = 0.5; // 50% 进度
const curvedProgress = calculateBezierCurve(progress, curve);
const finalValue = startValue + (endValue - startValue) * curvedProgress;
```

### Requirement: 动画状态机
系统SHALL提供动画状态管理和转换功能。

#### Scenario: 动画状态创建
- **WHEN** 开发者创建动画状态
- **THEN** 系统应提供 AnimationState 类
- **AND** 支持播放次数、淡入时间等配置

```typescript
const animationState = new AnimationState("walk", animationData, armature);
animationState.timeScale = 1.0;
animationState.playTimes = -1; // 无限循环
animationState.fadeInTime = 0.3;
```

#### Scenario: 动画状态转换
- **WHEN** 切换不同动画
- **THEN** 系统应支持平滑过渡
- **AND** 提供淡入淡出效果

```typescript
// 播放行走动画
const walkState = animation.playConfig("walk", -1, 0.3);

// 平滑切换到跑步动画
const runState = animation.playConfig("run", -1, 0.2);
walkState.fadeOut(0.2); // 同时淡出行走动画
```

### Requirement: 动画混合
系统SHALL提供多个动画的混合和叠加功能。

#### Scenario: 动画权重混合
- **WHEN** 同时播放多个动画
- **THEN** 系统应根据权重进行混合
- **AND** 生成自然的复合动画效果

```typescript
const walkState = animation.playConfig("walk");
const aimState = animation.playConfig("aim");

// 设置不同动画的权重
walkState.weight = 0.7;  // 70% 行走
aimState.weight = 0.3;   // 30% 瞄准

// 系统自动混合两个动画的效果
```

#### Scenario: 分层动画
- **WHEN** 需要独立控制身体部位
- **THEN** 系统应支持动画分层
- **AND** 各层可以独立播放和混合

```typescript
// 下半身播放行走动画
const lowerBodyLayer = animation.addLayer("lowerBody");
lowerBodyLayer.playConfig("walk");

// 上半身播放射击动画
const upperBodyLayer = animation.addLayer("upperBody");
upperBodyLayer.playConfig("shoot");

// 两个层独立控制，自动混合
```

### Requirement: 动画事件
系统SHALL提供动画事件定义和触发机制。

#### Scenario: 关键帧事件
- **WHEN** 动画播放到特定帧
- **THEN** 系统应触发定义的事件
- **AND** 支持自定义事件数据

```typescript
const eventFrame = new EventFrameData();
eventFrame.position = 15;
eventFrame.eventName = "footstep";
eventFrame.data = { sound: "footstep.wav", volume: 0.8 };

animationData.addEventFrame(eventFrame);
```

#### Scenario: 事件监听和处理
- **WHEN** 事件被触发
- **THEN** 系统应通知所有监听器
- **AND** 支持事件数据的传递

```typescript
armature.addEventListener("footstep", (event) => {
    const soundSystem = getSoundSystem();
    soundSystem.playSound(event.data.sound, event.data.volume);
});

// 当动画播放到第15帧时，自动触发footstep事件
```

### Requirement: 动画缓存
系统SHALL提供动画计算结果缓存以提高性能。

#### Scenario: 时间轴缓存
- **WHEN** 重复播放相同动画
- **THEN** 系统应缓存计算结果
- **AND** 减少重复计算开销

```typescript
class TimelineCache {
    private _cache: Map<number, Transform> = new Map();
    private _maxCacheSize: number = 100;

    public getTransform(frame: number): Transform | null {
        return this._cache.get(frame) || null;
    }

    public setTransform(frame: number, transform: Transform): void {
        if (this._cache.size >= this._maxCacheSize) {
            // 清理最旧的缓存
            const oldestFrame = Math.min(...this._cache.keys());
            this._cache.delete(oldestFrame);
        }
        this._cache.set(frame, transform.clone());
    }
}
```

#### Scenario: 动画状态缓存
- **WHEN** 频繁切换相同动画
- **THEN** 系统应预加载和缓存动画状态
- **AND** 提供快速切换能力

```typescript
// 缓存常用动画状态
const walkStateCache = new AnimationStateCache();
walkStateCache.preload("walk", animationData);

// 快速获取预加载的动画状态
const cachedState = walkStateCache.getCachedState("walk");
if (cachedState) {
    animation.addState(cachedState);
}
```

### Requirement: 动画控制器
系统SHALL提供高级动画控制接口。

#### Scenario: 动画队列
- **WHEN** 需要按顺序播放多个动画
- **THEN** 系统应提供动画队列功能
- **AND** 支持自动切换和过渡

```typescript
const animationQueue = new AnimationQueue(armature);
animationQueue.add("walk", { duration: 2.0, fadeIn: 0.3 });
animationQueue.add("run", { duration: 1.5, fadeIn: 0.2 });
animationQueue.add("jump", { duration: 0.8, fadeIn: 0.1 });

animationQueue.play(); // 按顺序播放动画队列
```

#### Scenario: 条件动画
- **WHEN** 根据条件选择动画
- **THEN** 系统应支持条件判断
- **AND** 自动选择最合适的动画

```typescript
const conditionalAnimation = new ConditionalAnimation(armature);
conditionalAnimation.addRule({
    condition: () => player.health < 30,
    animation: "hurt",
    priority: 10
});

conditionalAnimation.addRule({
    condition: () => player.isMoving,
    animation: "walk",
    priority: 5
});

// 系统自动根据条件选择合适的动画
conditionalAnimation.update();
```

### Requirement: 动画调试
系统SHALL提供动画调试和可视化工具。

#### Scenario: 动画时间轴可视化
- **WHEN** 开发者调试动画
- **THEN** 系统应提供可视化工具
- **AND** 显示时间轴、骨骼变换和事件标记

```typescript
const debugVisualizer = new AnimationDebugVisualizer();
debugVisualizer.showTimeline(animationState);
debugVisualizer.showBoneTransforms(armature);
debugVisualizer.showEventMarkers(animationData);
```

#### Scenario: 性能监控
- **WHEN** 监控动画性能
- **THEN** 系统应提供性能分析工具
- **AND** 生成详细的性能报告

```typescript
const performanceMonitor = new AnimationPerformanceMonitor();
performanceMonitor.startMonitoring(armature);

// 获取性能报告
const report = performanceMonitor.getReport();
console.log(`Animation update time: ${report.updateTime}ms`);
console.log(`Cache hit rate: ${report.cacheHitRate}%`);

