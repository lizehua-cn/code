import { track, trigger } from './effect'
import { ReactiveFlags } from './reactive'
export const mutableHandles = {
  get(target, key, receiver) {
    // FIXME 会改变this指向
    // return target[key]
    // 可以通过此字段判断是否是被代理对象
    if (key === ReactiveFlags.IS_REACTIVE) return true
    track(target, key)
    return Reflect.get(target, key, receiver)
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
