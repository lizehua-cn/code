import { isObject } from '@vue/shared'
import { activeEffect, trackEffect, triggerEffects } from './effect'
import { reactive } from './reactive'
function toReactive(value) {
  return isObject(value) ? reactive(value) : value
}
export class RefImpl {
  dep = undefined
  _value
  __v_isRef = true
  constructor(public rawValue) {
    this._value = toReactive(rawValue)
  }
  get value() {
    // 依赖收集
    if (activeEffect) {
      trackEffect(this.dep || (this.dep = new Set()))
    }
    return this._value
  }
  set value(value) {
    // 每次拿原值跟设置的值对比
    if (value !== this.rawValue) {
      this._value = toReactive(value)
      this.rawValue = value
      // 触发更新
      triggerEffects(this.dep)
    }
  }
}
export function ref(value) {
  return new RefImpl(value)
}
