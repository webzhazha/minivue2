//  watcher 观察者模式  将compiler和observer建立连接
// 当数据发生变化时, 更新dom, 完成双向数据绑定
class Watcher {
  constructor(vm, attrValue, cb){
    // vm整个vue实例   attrValue 获取添加watcher方法的属性, 便于监听其数据  cb 触发更新dom操作
    this.vm = vm
    this.attrValue = attrValue
    this.cb = cb
    // 当实例watcher时, 将实例watcher存到在dep对象中, 然后当做订阅者收集
    Dep.target = this
    // 获取旧值
     this.oldValue = this.getValue(vm, attrValue)
     // 清空Dep.target
     Dep.target = null
  } 
  // update 更新操作  当数据改变 触发回调函数cb   在compiler传入回调, 在observer中触发
  update(){
    let oldValue = this.oldValue
    let newValue = this.getValue(this.vm, this.attrValue)
    // 如果新旧值不同, 则触发cb回调  更新dom
    if(oldValue!=newValue){
      this.cb(newValue)
    }
  }  
  // 获取对象数据
  getValue(vm, attrValue){
      // 循环获取
      // 变成 car color // 遍历
      let arr = attrValue.split('.')
      let data = vm.$data
      arr.forEach(item=>{
        data = data[item]
      })
    return data
  }
}

// dep  发布订阅模式   收集订阅者, 当数据发生改变, 通知所有订阅者
class Dep {
  constructor(){
    this.sub = []
  }
  // 收集
  addSub(sub){
    this.sub.push(sub)
  }
  // 通知所有订阅者
  notify(){
    this.sub.forEach(item=>{
      item.update()
    })
  }
}