export let activeEffect
export class ReactiveEffect {
  public active = true
  public deps = []
  public parent = undefined
  constructor(public fn) {}
  run() {
    // 如果不是激活的 直接执行
    if (!this.active) {
      return this.fn()
    }
    // 关联响应式属性和effect
    try {
      // 刚进来先获取parent
      this.parent = activeEffect
      activeEffect = this
      // fn 内如果有响应式属性, 则触发响应式get方法
      return this.fn()
    } finally {
      // 执行完fn, 清理effect(如果有嵌套获取父级effect)
      activeEffect = this.parent
      this.parent = undefined
    }
  }
}
export function effect(fn) {
  const _effect = new ReactiveEffect(fn)
  _effect.run() // 默认执行一次
}
// let map = weakMap{
//   target: map{
//     key: set(effect)
//   }
// }
// 设置map 关联对象的属性关联对应的effect
const targetMap = new WeakMap()
// 触发依赖收集
export function track(target, key) {
  // 如果没有在 effect 中取值
  if (!activeEffect) {
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  let shouldTrack = !dep.has(activeEffect)
  if (shouldTrack) {
    dep.add(activeEffect)
    // effect 记录依赖的属性
    activeEffect.deps.push(dep)
  }
}
