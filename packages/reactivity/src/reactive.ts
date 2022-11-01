import { isObject } from '@vue/shared'
import { mutableHandles } from './baseHandlers'
export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}
export function isReactive(target) {
  return !!(target && target[ReactiveFlags.IS_REACTIVE])
}
const reactiveMap = new WeakMap()
export function reactive(target) {
  // 判断是不是对象
  if (!isObject(target)) {
    return target
  }
  // 判断如果已经是被代理对象, 直接返回
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target
  }
  // 判断target有没有注册为响应式对象
  const exisisProxy = reactiveMap.get(target)
  if (exisisProxy) {
    return exisisProxy
  }

  const proxy = new Proxy(target, mutableHandles)
  // 缓存
  reactiveMap.set(target, proxy)
  target[ReactiveFlags.IS_REACTIVE] = true
  return proxy
}
