import { isObject } from '@vue/shared'
import { track, trigger } from './effect'
import { reactive, ReactiveFlags } from './reactive'
export const mutableHandles = {
  get(target, key, receiver) {
    // FIXME 会改变this指向
    // return target[key]
    // 可以通过此字段判断是否是被代理对象
    if (key === ReactiveFlags.IS_REACTIVE) return true
    track(target, key)
    // Reflect 保证this 是当前被代理对象
    const r = Reflect.get(target, key, receiver)
    if (isObject(r)) {
      // 如果是对象, 重新注册为响应式
      // 取值时才会触发, 性能优化
      return reactive(r)
    }
    return r
  },
  set(target, key, value, receiver) {
    let oldVal = target[key]
    // r 是一个 boolean
    let r = Reflect.set(target, key, value, receiver)
    // TODO oldVal 或者 value 是对象怎么办(也会触发)
    if (oldVal !== value) {
      trigger(target, key, value, oldVal)
    }
    return r
  }
}
