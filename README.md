# my-mvvm
从零实现一套基于Vue的MVVM原理
从零手写基于Vue的MVVM原理

MVVM 双向数据绑定  angular 脏值检测  vue 数据劫持+发布订阅
不兼容IE8以下的低版本  ES5里的Object.defineProperty()
https://upload-images.jianshu.io/upload_images/5016475-c1ff7e988c760ebc.png?imageMogr2/auto-orient/strip|imageView2/2/w/1200/format/webp
Object.defineProperty(obj, 'tmc', {
    configurable: true, // 默认为false，可配置的【删除】
    writable: true, // 默认为false, 是否可写【修改】
    enumerable: true, // 默认为false, 是否可枚举【for in 遍历】
    value: 'sfm', // tmc属性的值
    get() {
        // 获取obj.tmc的值时会调用get函数
    },
    set(val) {
        // val就是重新赋值的值
        // 重新给obj.tmc赋值时会调用set函数
    }
    // 注意：当出现get,set函数时，不能出现writable, enumerable属性
})