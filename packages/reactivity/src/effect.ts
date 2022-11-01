export let activeEffect
function cleanupEffect(effect) {
  // 执行依赖收集之前, 清理当前 effect 对应的依赖
  let { deps } = effect
  // 因为deps的每个key都有set引用, 所以要循环
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect)
  }
  effect.deps.length = 0
}
export class ReactiveEffect {
  public active = true
  public deps = []
  public parent = undefined
  constructor(public fn, private scheduler) {}
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
      // 为什么第一次收集属性的时候, 需要让当前 effect 记录 dep,
      // 原因需要在收集前删除对应依赖
      cleanupEffect(this)
      // fn 内如果有响应式属性, 则触发响应式get方法(依赖收集)
      return this.fn()
    } finally {
      // 执行完fn, 清理effect(如果有嵌套获取父级effect)
      activeEffect = this.parent
      this.parent = undefined
    }
  }
  stop() {
    // effect 手动失活
    if (this.active) {
      // 先将依赖清除, 然后把active变为失活
      cleanupEffect(this)
      this.active = false
    }
  }
}
export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  _effect.run() // 默认执行一次
  // bind call 除了传参区别外
  // bind 返回原函数
  // call 返回原函数的返回值
  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
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
  trackEffect(dep)
}
export function trackEffect(dep) {
  let shouldTrack = !dep.has(activeEffect)
  if (shouldTrack) {
    dep.add(activeEffect)
    // effect 记录依赖的属性
    activeEffect.deps.push(dep)
  }
}
// 触发更新
export function trigger(target, key, val, oldVal) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    // 如果是在effect外设置响应属性 直接return
    return
  }
  const dep = depsMap.get(key)
  triggerEffects(dep)
}

export function triggerEffects(dep) {
  if (dep) {
    // 防止清理依赖时死循环
    const effects = [...dep]
    // 使deps里的每一项都重新执行 run(fn) 方法
    effects.forEach(effect => {
      // 这个判断是为了阻止在effect中设置属性从而触发更新,造成死循环
      if (effect !== activeEffect) {
        // FIXME 每次run 都要重新收集
        if (effect.scheduler) {
          effect.scheduler()
        } else {
          effect.run()
        }
      }
    })
  }
}
