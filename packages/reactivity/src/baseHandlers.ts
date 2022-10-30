import { activeEffect, track } from './effect'
import { ReactiveFlags } from './reactive'
export const mutableHandles = {
  get(target, key, receiver) {
    // FIXME 会改变this指向
    // return target[key]
    // 可以通过此字段判断是否是被代理对象
    if (key === ReactiveFlags.IS_REACTIVE) return true
    // console.log('activeEffect', activeEffect, key)
    track(target, key)
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    return Reflect.set(target, key, value, receiver)
  }
}
