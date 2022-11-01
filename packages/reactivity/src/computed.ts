import { isFunction } from '@vue/shared'
import {
  activeEffect,
  ReactiveEffect,
  trackEffect,
  triggerEffects
} from './effect'
const noop = () => {}
class ComputedRefImpl {
  // dep: undefined // ts 类型
  // dep = undefined // ts 赋值操作
  dep = undefined
  effect
  __v_isRef = true // ref需要用.value来取值
  _dirty = true // ref需要用.value来取值
  _value // 缓存结果
  constructor(getter, public setter) {
    // 没有使用 effect(() => {}), effect 会立即执行run
    this.effect = new ReactiveEffect(getter, () => {
      // 值修改触发调度函数,将 dirty 变为脏的
      this._dirty = true
      triggerEffects(this.dep)
    })
  }
  get value() {
    if (activeEffect) {
      // 在 effect 中使用计算属性
      // 计算属性触发依赖收集
      trackEffect(this.dep || (this.dep = new Set()))
    }
    if (this._dirty) {
      // 当 dirty 为脏的时, 获取value
      this._value = this.effect.run()
      this._dirty = false // 取过值了 dirty 变为干净的
    }
    return this._value
  }
  set value(newValue) {
    this.setter(newValue)
  }
}

export function computed(getterOrOptions) {
  const isOnlyGetter = isFunction(getterOrOptions)
  let getter
  let setter
  if (isOnlyGetter) {
    getter = getterOrOptions
    setter = noop
  } else {
    getter = getterOrOptions.getter
    setter = getterOrOptions.setter || noop
  }

  return new ComputedRefImpl(getter, setter)
}
