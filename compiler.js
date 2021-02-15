// 模板解析器   将模板中的指令和差值表达式进行解析, 赋予不同的操作
class Compiler {
  constructor(el, vm){
    this.el = typeof el === 'string' ? document.querySelector(el):el
    // vm new Vue的实例
    this.vm = vm
    // 创建fragement对象(创建一个空白文档, 便于整体替换较方便)  写到通用的方法中  并解析赋值到其中
    let fragment = this.nodeFragment(this.el)
    // 将fragment赋值到el中
    this.el.appendChild(fragment)
  }
  // 创建fragement  createdocumentFragment  创建虚拟的节点对象
  nodeFragment(node){
    // 创建fragment 
    let fragment = document.createDocumentFragment()
    // 获取app的元素, 并遍历添加 appendChild
    let childNodes = node.childNodes
    // 转化为数组 赋值到文档对象
    this.toArray(childNodes).forEach(node=>{
      // fragment.appendChild(item)
      // 判断是否哪个节点, 解析并赋值
      if(this.isTestNode(node)){
        // 解析文本
        this.compilerText(node)
      }
      if(this.isElementNode(node)){
        // 解析元素
        this.compilerElement(node)
      }
      // 如果子节点还有子节点, 则递归解析
      if(node.childNodes && node.childNodes.length>0){
        this.nodeFragment(node)
      }
    })
    return fragment
  }
  // 解析html标签  v-
  compilerElement(node){
    // 获取所有属性
    let attributes = node.attributes
    // 遍历 如果是v-开头 解析 然后判断是何种指令
    this.toArray(attributes).forEach(attr=>{
      let attrName = attr.name
      if(this.isDirective(attrName)){
        // 判断指令类型
        let type = attrName.slice(2)
        let attrValue = attr.value
        // 解析事件 
        if(this.isEvent(type)){
          let event = type.split(':')[1]
          // 绑定事件
          compilerUtil['events'](event, node, this.vm, attrValue)
        }else {
          compilerUtil[type](node, this.vm, attrValue)
        }
      }
    })
  }
  // 解析文本节点
  compilerText(node){
    let nodeValue = node.textContent
    // 使用正则判断
    let reg = /\{\{(.+)\}\}/
    if(reg.test(nodeValue)){
      let val = RegExp.$1
      node.textContent = nodeValue.replace(reg,compilerUtil.getValue(this.vm, val))
      // 创建watcher 存放到dep中, 作为订阅者
      new Watcher(this.vm, val, newValue=>{
        // 当时数据更新后, 回调函数会触发, 更新dom
        node.textContent = nodeValue.replace(reg,newValue)
      })
    }
  }
  toArray(linkarr){
    return Array.from(linkarr)
  }
  // 判断文本节点
  isTestNode(node){
    return node.nodeType === 3
  }
  // 判断元素节点
  isElementNode(node){
    return node.nodeType === 1
  }
  // 判断指令
  isDirective(attrName){
    return attrName.startsWith('v-')
  }
  // 判断事件
  isEvent(type){
    return type.split(':')[0]==='on'
  }
}


// 封装解析html的操作
let compilerUtil = {
  text(node, vm, attrValue){
    node.innerText = this.getValue(vm, attrValue)
    // 创建watcher 存放到dep中, 作为订阅者
    new Watcher(vm, attrValue, newValue=>{
      // 当时数据更新后, 回调函数会触发, 更新dom
      node.innerText = newValue
    })
  },
  html(node, vm, attrValue){
    node.innerHTML = this.getValue(vm, attrValue)
    new Watcher(vm, attrValue, newValue=>{
      // 当时数据更新后, 回调函数会触发, 更新dom
      node.innerHTML = newValue
    })
  },
  model(node, vm, attrValue){
    let that = this
    node.value = this.getValue(vm, attrValue)
    // 表单元素, 增加视图到数据的联动, 双向数据绑定  
    node.addEventListener('input',function(){
      that.setValue(vm, attrValue, this.value)
    })
    new Watcher(vm, attrValue, newValue=>{
      // 当时数据更新后, 回调函数会触发, 更新dom
      node.value = newValue
    })
  },
  events(event, node, vm, attrValue){
    let fn = vm.$methods[attrValue].bind(vm)
    node.addEventListener(event,fn)
  },
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
  },
  // 设置对象数据
  setValue(vm, attrValue, value){
    // attrValue可能是对象  car.color
    // 遍历 判断是不是最后一个
    let data = vm.$data
    let arr = attrValue.split('.')
    arr.forEach((item,index)=>{
      // 如果是最后一个直接赋值
      if(index<arr.length-1){
        data = data[item]
      }else {
        data[item] = value
      }

    })
  }
}