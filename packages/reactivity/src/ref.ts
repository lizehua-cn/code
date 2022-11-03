import { isObject } from '@vue/shared'
import { activeEffect, trackEffect, triggerEffects } from './effect'
import { isReactive, reactive } from './reactive'
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
export class ObjectRefImpl {
  __v_isRef = true
  constructor(public _object, public _key) {}
  get value() {
    return this._object[this._key]
  }
  set value(val) {
    this._object[this._key] = val
  }
}
export function toRef(target, key) {
  return new ObjectRefImpl(target, key)
}

export function toRefs(target) {
  const result = {}
  for (let i in target) {
    result[i] = toRef(target, i)
  }
  return result
}
function isRef(ref) {
  return !!(ref && ref.__v_isRef === true)
}
function unref(ref) {
  return isRef(ref) ? ref.value : ref
}
export function proxyRefs(ObjectWithRefs) {
  // 返回一个 proxy, 结果为ref.value
  return isReactive(ObjectWithRefs)
    ? ObjectWithRefs
    : new Proxy(ObjectWithRefs, {
        get: (target, key, receiver) =>
          unref(Reflect.get(target, key, receiver)),
        set: (target, key, value, receiver) => {
          const oldValue = target[key]
          if (isRef(oldValue) && !isRef(value)) {
            oldValue.value = value
            return true
          }
          return Reflect.set(target, key, value, receiver)
        }
      })
}
