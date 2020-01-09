从零手写一套基于Vue的完整的MVVM原理
作为前端面试官我面试必须问一下面试者：给我描述一下你对MVVM的理解？

接下来，我将从零实现一套基于Vue的完整的MVVM，提供给来年“金三银四”跳槽高峰期的小伙伴们阅读也详细梳理一下自己对MVVM的理解。

![图片alt](https://user-gold-cdn.xitu.io/2018/7/25/164cde63a9070a28?imageView2/0/w/1280/h/960/format/webp/ignore-error/1 '加油')

## MVVM是什么
在了解MVVM之前，我们来对MVC说明一下。MVC架构起初以及现在一直存在于后端。以Java为例，MVC分别代表后台的三层，M代表模型层、V代表视图层、C代表控制器层，这三层架构完全可以满足于绝大分部的业务需求开发。
![图片alt](https://user-gold-cdn.xitu.io/2017/11/3/24c32d90d20161bd813bc80e73aaae29?imageView2/0/w/1280/h/960/format/webp/ignore-error/1 'MVC模式')
> MVC & 三层架构

下面以Java为例，分别阐述下MVC和三层架构中各层代表的含义以及职责：

1. Model：模型层，代表着每一个JavaBean。其分为两类，一类称为数据承载Bean，一类称为业务处理Bean。
2. View：视图层，代表着对应的视图页面，与用户直接进行交互。
3. Controller：控制层，该层是Model和View的“中间人”，用于将用户请求转发给相应的Model进行处理，并处理Model的计算结果向用户提供相应响应。

以登录为例，介绍一下三层之间的逻辑关系。当用户点击View视图页面的登录按钮时，系统会调取Controller控制层里的登录接口。一般在Controller层中不会写很多具体的业务逻辑代码，只会写一个接口方法，该方法具体的逻辑在Service层进行实现，然后service层里的具体逻辑就会调用DAO层里的Model模型，从而达到动态化的效果。
> MVVM 的描述

MVVM 设计模式，是由 MVC（最早来源于后端）、MVP 等设计模式进化而来。
1. M - 数据模型（Model），简单的JS对象
2. VM - 视图模型（ViewModel），连接Model与View
3. V - 视图层（View），呈现给用户的DOM渲染界面
![图片alt](https://user-gold-cdn.xitu.io/2018/5/7/16339e3e3f24873d?imageView2/0/w/1280/h/960/format/webp/ignore-error/1 'MVVM模式')
通过以上的MVVM模式图，我们可以看出最核心的就是ViewModel，它主要的作用：对View中DOM元素的监听和对Model中的数据进行绑定，当View变化会改动Modal中数据的改动，Model中数据的改动会触发View视图重新渲染，从而达到数据双向绑定的效果，该效果也是Vue最为核心的特性。

> 常见库实现数据双向绑定的做法：
- 发布订阅模式（Backbone.js）
- 脏值检查（Angular.js）
- 数据接触（Vue.js）

面试者在回答Vue的双向数据绑定原理时，几乎所有人都会说：Vue是采用数据劫持结合发布订阅模式，通过Object.defineProperty()来劫持各个属性的getter,setter, 在数据变动时发布消息给订阅者，触发相应的回调函数，从而实现数据双向绑定。但当继续深入问道：
- 实现一个MVVM里面需要那些核心模块？
- 为什么操作DOM要在内存上进行？
- 各个核心模块之间的关系是怎样的？
- 你自己手动完整的实现过一个MVVM吗？
- ...
![图片alt](https://user-gold-cdn.xitu.io/2020/1/9/16f8903d81d38466?w=223&h=223&f=jpeg&s=5750 'why?')

接下来，我将一步一步的实现一套完整的MVVM，当再次问道MVVM相关问题，完全可以在面试过程中脱颖而出。在开始编写MVVM之前，我们很有必要对核心API和发布订阅模式熟悉一下：
> 介绍一下 Object.defineProperty 的使用

Object.defineProperty(obj, prop, desc) 的作用就是直接在一个对象上定义一个新属性，或者修改一个已经存在的属性
1. obj: 需要定义属性的当前对象
2. prop: 当前需要定义的属性名
3. desc: 属性描述符

注意：一般通过为对象的属性赋值的情况下，对象的属性可以修改也可以删除，但是通过Object.defineProperty()定义属性，通过描述符的设置可以进行更精准的控制对象属性。
![图片alt](https://user-gold-cdn.xitu.io/2020/1/9/16f89758b3f2f7c7?w=484&h=263&f=png&s=5980 '属性描述符')
```
let obj = {}
Object.defineProperty(obj, 'name', {
    configurable: true,   // 默认为false，可配置的【删除】
    writable: true,       // 默认为false, 是否可写【修改】
    enumerable: true,     // 默认为false, 是否可枚举【for in 遍历】
    value: 'sfm',         // name属性的值
    get() {
        // 获取obj.name的值时会调用get函数
    },
    set(val) {
        // val就是重新赋值的值
        // 重新给obj.name赋值时会调用set函数
    }
})
```

注意：当出现get,set函数时，不能同时出现writable, enumerable属性，否则系统报错。并且该API不支持IE8以下的版本，也就是Vue不兼容IE8以下的浏览器。
> 介绍一下 发布订阅模式

发布者-订阅者模式也叫观察者模式。他定义了一种一对多的依赖关系，即当一个对象的状态发生改变时，所有依赖于他的对象都会得到通知并自动更新，解决了主体对象与观察者之间功能的耦合。
```
// 发布订阅模式  先有订阅后有发布
function Dep() {
    this.subs = [];
}
// 订阅
Dep.prototype.addSub = function(sub) {
    this.subs.push(sub);
}
Dep.prototype.notify = function() {
    this.subs.forEach(sub => sub.update());
}
// Watcher类，通过这个类创建的实例都有update方法
function Watcher(fn) {
    this.fn = fn;
}
Watcher.prototype.update = function() {
    this.fn();
}
let watcher1 = new Watcher(function() {
    console.log(123);
})
let watcher2 = new Watcher(function() {
    console.log(456);
})
let dep = new Dep();
dep.addSub(watcher1); // 将watcher放到了数组中
dep.addSub(watcher2);
dep.notify();

// 控制台输出：
// 123 456
```
![图片alt](https://user-gold-cdn.xitu.io/2020/1/10/16f8b3976358f886?w=240&h=227&f=gif&s=15826 '学不动了')

## 实现自己的 MVVM
> 在项目根目录创建一个index.html模板并引入自己手动创建的MVVM.js文件
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <div id="app">
        <input type="text" v-modal="obj.name">
        <span>{{ obj.name }}</span>
        <span>{{obj.age}}</span>
    </div>
    <script src="./MVVM.js"></script>
    <script>
        let vm = new Vue({
            el: '#app',
            data: {
                obj: {
                    name: 'tmc',
                    age: 25
                }
            }
        })
    </script>
</body>
</html>
```
### 数据劫持
通过Object.defineProperty()来劫持对象属性的setter和getter操作，在数据变动时触发相应的监听回调函数。
```
// 数据劫持
class Observer {
    constructor(data) {
        this.observer(data);
    }
    observer(data) {
        if(data && typeof data == 'object') {
            // 判断data数据存在 并 data是对象  才观察
            for(let key in data) {
                this.defineReactive(data, key, data[key]);
            }
        }
    }
    defineReactive(obj, key, value) {
        this.observer(value); // 如果value还是对象，还需要观察
        Object.defineProperty(obj, key, {
            get() {
                return value;
            },
            set:(newVal) => { // 设置新值
                if(newVal != value) { // 新值和就值如果一致就不需要替换了
                    this.observer(newVal); // 如果赋值的也是对象的话  还需要观察
                    value = newVal;
                }
            }
        })
    }
}
```
### 数据代理
数据代理就是让我们每次拿data里的数据时，不用每次都写一长串，如mvvm._data.a.b这种，我们其实可以直接写成mvvm.a.b这种显而易见的方式
### 模板编译
```
// 模板编译
class Compiler {
    /**
     * @param {*} el 元素 注意：el选项中有可能是‘#app’字符串也有可能是document.getElementById('#app')
     * @param {*} vm 实例
     */
    constructor(el, vm) {
        // 判断el属性  是不是一个元素  如果不是元素就获取
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        // console.log(this.el);拿到当前的模板
        this.vm = vm;
        // 把当前节点中的元素获取到  放到内存中  防止页面重绘
        let fragment = this.node2fragment(this.el);
        // console.log(fragment);内存中所有的节点

        // 1. 编译模板 用data中的数据编译
        this.compile(fragment);
        // 2. 把内存中的内容进行替换
        this.el.appendChild(fragment);
        // 3. 再把替换后的内容回写到页面中
    }
    /**
     * 判断是含有指令
     * @param {*} attrName 属性名 type v-modal
     */
    isDirective(attrName) {
        return attrName.startsWith('v-'); // 是否含有v-
    }
    /**
     * 编译元素节点
     * @param {*} node 元素节点
     */
    compileElement(node) {
        // 获取当前元素节点的属性；【类数组】NamedNodeMap; 也存在没有属性，则NamedNodeMap{length: 0}
        let attributes = node.attributes;
        [...attributes].forEach(attr => {
            // attr格式：type="text"  v-modal="obj.name"
            let {name, value: expr} = attr;
            // 判断是不是指令
            if(this.isDirective(name)) { // v-modal v-html v-bind
                // console.log('element', node); 元素
                let [, directive] = name.split('-'); // 获取指令名
                // 需要调用不同的指令来处理
                CompilerUtil[directive](node, expr, this.vm);
            }
        });
    }
    /**
     * 编译文本节点 判断当前文本节点中的内容是否含有 {{}}
     * @param {*} node 文本节点
     */
    compileText(node) {
        let content = node.textContent;
        // console.log(content, ‘内容’); 元素里的内容
        if(/\{\{(.+?)\}\}/.test(content)) { // 通过正则去匹配只需要含有{{}}大括号的，空的不需要 获取大括号中间的内容
            // console.log(content, ‘内容’); 只包含{{}} 不需要空的 和其他没有{{}}的子元素
            CompilerUtil['text'](node, content, this.vm);
        }
    }
    /**
     * 编译内存中的DOM节点
     * @param {*} fragmentNode 文档碎片
     */
    compile(fragmentNode) {
        // 从文档碎片中拿到子节点  注意：childNodes【之包含第一层，不包含{{}}等】
        let childNodes = fragmentNode.childNodes; // 获取的是类数组NodeLis
        [...childNodes].forEach(child => {
            // 是否是元素节点
            if (this.isElementNode(child)) {
                // console.log('element', child);
                this.compileElement(child);
                // 如果是元素的话  需要把自己传进去  再去遍历子节点   递归
                this.compile(child);
            } else {
                // 文本节点
                // console.log('text', child);
                this.compileText(child);
            }
        });
    }
    /**
     * 将节点中的元素放到内存中
     * @param {*} node 节点
     */
    node2fragment(node) {
        // 创建一个稳定碎片；目的是为了将这个节点中的每个孩子都写到这个文档碎片中
        let fragment = document.createDocumentFragment();
        let firstChild; // 这个节点中的第一个孩子
        while (firstChild = node.firstChild) {
            // appendChild具有移动性，每移动一个节点到内存中，页面上就会少一个节点
            fragment.appendChild(firstChild);
        }
        return fragment;
    }
    /**
     * 判断是不是元素
     * @param {*} node 当前这个元素的节点
     */
    isElementNode(node) {
        return node.nodeType === 1;
    }
}
```
### 发布订阅
发布订阅主要靠的就是数组关系，订阅就是放入函数，发布就是让数组里的函数执行
```
// 发布订阅
function Dep() { 
    this.subs = []
}
Dep.prototype.addSub = function(sub) {
    this.subs.push(sub)
}
Dep.prototype.notify = function() {
    this.subs.forEach(sub => sub.update())
}
// watcher
function Watcher(vm, exp, fn) { 
    this.fn = fn;
    this.vm = vm;
    this.exp = exp; // 添加到订约中
    Dep.target = this;
    let val = vm;
    let arr = exp.split('.');
    arr.forEach(function (k) { 
        val = val[k];
    })
    Dep.target = null;
}
Watcher.prototype.update = function() {
    let val = this.vm;
    let arr = this.exp.split('.');
    arr.forEach(function (k) { 
        val = val[k];
    })
    this.fn(val)
}
```
### 连接视图与数据
### 实现computed
```
function initComputed() {
    let vm = this;
    let computed = this.$options.computed;  // 从options上拿到computed属性   {sum: ƒ, noop: ƒ}
    // 得到的都是对象的key可以通过Object.keys转化为数组
    Object.keys(computed).forEach(key => {  // key就是sum,noop
        Object.defineProperty(vm, key, {
            // 这里判断是computed里的key是对象还是函数
            // 如果是函数直接就会调get方法
            // 如果是对象的话，手动调一下get方法即可
            // 如： sum() {return this.a + this.b;},他们获取a和b的值就会调用get方法
            // 所以不需要new Watcher去监听变化了
            get: typeof computed[key] === 'function' ? computed[key] : computed[key].get,
            set() {}
        });
    });
}
```
## 完整的仓库地址
> http://
## 总结
通过以下描述和核心代码的演示，相信小伙伴们对MVVM有重新的认识，面试中对面面试官的提问可以对答如流。
![图片alt](https://user-gold-cdn.xitu.io/2020/1/9/16f8630237583f32?w=780&h=519&f=jpeg&s=91038 '加油')
