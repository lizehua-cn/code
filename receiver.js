let person = {
  name: 'aa',
  get aliseName() {
    return `**${this.name}**`
  }
}
const proxy = new Proxy(person, {
  get(target, key, receiver) {
    console.log('key', key)
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    target[key] = value
    return Reflect.set(target, key, value, receiver)
  }
})

// console.log('person', person.aliseName)
console.log('proxy', proxy.aliseName)
