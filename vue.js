// vue 文件
class Vue {
  constructor(options={}){
    this.$el = options.el
    this.$data = options.data
    // 将方法绑定到vue实例
    this.$methods = options.methods
    // 绑定数据
    new Observer(this.$data)
    // 将data和methods中的数据和方法挂载到实例上   使用defineProperty  对象传this 代理data中的属性
    this.proxyData(this.$data)
    this.proxyData(this.$methods)
    // 编译模板
    if(this.$el){
      new Compiler(this.$el, this)
    }
    
  }
  proxyData(data){
    // 遍历上面的key
    Object.keys(data).forEach(key=>{
      Object.defineProperty(this,key, {
        enumerable: true,
        configurable: true,
        get(){
          return data[key]
        },
        set(newValue){
          if(newValue===data[key]){
            return
          }
          // 
          data[key] = newValue
        }
      })
    })
  }
}
