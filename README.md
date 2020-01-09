从零手写一套基于Vue的完整的MVVM原理
作为前端面试官我面试必须问一下面试者：给我描述一下你对MVVM的理解？

接下来，我将从零实现一套基于Vue的完整的MVVM，提供给来年“金三银四”跳槽高峰期的小伙伴们阅读也详细梳理一下自己对MVVM的理解。

![图片alt](https://user-gold-cdn.xitu.io/2018/7/25/164cde63a9070a28?imageView2/0/w/1280/h/960/format/webp/ignore-error/1 '加油')

## MVVM是什么
在了解MVVM之前，我们来对MVC说明一下。MVC架构起初以及现在一直存在于后端，以Java为例。MVC分别代表后台的三层，M代表模型层、V代表视图层、C代表控制器层，这三层架构完全可以满足于绝大分部的业务需求开发。
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
1. obj 需要定义属性的当前对象
2. prop 当前需要定义的属性名
3. desc 属性描述符

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

注意：当出现get,set函数时，不能同时出现writable, enumerable属性，否则系统报错。
> 介绍一下 发布订阅模式
## 实现自己的 MVVM

### 数据劫持
### 数据代理
### 模板编译
### 发布订阅
### 连接视图与数据
### 实现computed

## 总结