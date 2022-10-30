// packages/reactivity/src/effect.ts
function effect() {
}

// packages/shared/src/index.ts
function isObject(val) {
  return val !== null && typeof val === "object";
}

// packages/reactivity/src/baseHandlers.ts
var mutableHandles = {
  get(target, key, receiver) {
    if (key === "__v_isReactive" /* IS_REACTIVE */)
      return true;
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    return Reflect.set(target, key, value, receiver);
  }
};

// packages/reactivity/src/reactive.ts
var ReactiveFlags = /* @__PURE__ */ ((ReactiveFlags2) => {
  ReactiveFlags2["IS_REACTIVE"] = "__v_isReactive";
  return ReactiveFlags2;
})(ReactiveFlags || {});
var reactiveMap = /* @__PURE__ */ new WeakMap();
function reactive(target) {
  if (!isObject(target)) {
    return target;
  }
  if (target["__v_isReactive" /* IS_REACTIVE */]) {
    return target;
  }
  const exisisProxy = reactiveMap.get(target);
  if (exisisProxy) {
    return exisisProxy;
  }
  const proxy = new Proxy(target, mutableHandles);
  reactiveMap.set(target, proxy);
  target["__v_isReactive" /* IS_REACTIVE */] = true;
  return proxy;
}
export {
  ReactiveFlags,
  effect,
  reactive
};
//# sourceMappingURL=reactivity.esm.js.map
