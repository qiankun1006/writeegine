/**
 * 骨骼动画系统核心模块导出
 * @author skeleton-animation-system
 */

// 几何类型
export * from './geom';

// 数据模型
export * from './data';

// 对象系统
export * from './object';

// 骨骼系统（将在后续任务中实现）
export { TransformObject } from './bone/TransformObject';
export { Bone } from './bone/Bone';

// 骨架系统（将在后续任务中实现）
export { Armature } from './armature/Armature';
export { Slot } from './armature/Slot';

// 动画系统（将在后续任务中实现）
export { AnimationState } from './animation/AnimationState';
export { Animation } from './animation/Animation';

// 工厂系统（将在后续任务中实现）
export { BaseFactory } from './factory/BaseFactory';

