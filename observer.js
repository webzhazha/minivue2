// observer 数据监听器 将data中的数据对象都加上 setter和getter方法   进行数据劫持
class Observer {
  constructor(data){
    this.data = data
    // 添加walk方法  设置get set
    this.walk(data)
  }
  walk(data){
    if (!data || typeof data != "object") {
      return
    }
    // 遍历 
    Object.keys(data).forEach(key=>{
      // 设置defineProperty
      this.defineActive(data, key, data[key])
      // 如果是对象, 递归设置
      if(typeof data[key] === 'object'){
        this.walk(data[key])
      }
    })
  }
  //  绑定的具体方法
  defineActive(data, key, value){
    let that = this
    let dep = new Dep()
    Object.defineProperty(data,key, {
      enumerable: true, // 可遍历
      configurable: true, // 能够继续设置
      get(){
        // 获取时, 说明有个元素需要该值, 需要添加一个订阅者
        Dep.target && dep.addSub(Dep.target)
        return value
      },
      set(newValue){
        if(value === newValue){
          return
        }
        value = newValue
        // 如果设置了对象, 要增加劫持
        if(typeof newValue === 'object'){
          that.walk(newValue)
        }
        // 触发通知订阅者
        dep.notify()
      }
    })
  }

}
