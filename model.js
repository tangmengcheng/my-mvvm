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