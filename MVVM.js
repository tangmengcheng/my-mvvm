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
// 编译
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

// 编译功能
CompilerUtil = {
    /**
     * 根据表达式取到对应的数据
     * @param {*} vm 
     * @param {*} expr 
     */
    getVal(vm, expr) {
        return expr.split('.').reduce((data, current) => {
            return data[current];
        }, vm.$data);
    },
    /**
     * 处理v-modal
     * @param {*} node 对应的节点
     * @param {*} expr 表达式
     * @param {*} vm 当前实例
     */
    modal(node, expr, vm) {
        // 给输入框赋予value属性 node.value = xxx
        let fn = this.updater['modalUpdater'];
        let value = this.getVal(vm, expr); // 返回tmc
        fn(node, value);
    },
    html() {
        // node.innerHTML = xxx
    },
    text(node, expr, vm) {
        let fn = this.updater['textUpdater'];
        let content = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
            return this.getVal(vm, args[1].trim());
        });
        console.log(content);
        fn(node, content);
    },
    updater: {
        // 把数据插入到节点中
        modalUpdater(node, value) {
            node.value = value;
        },
        htmlUpdater() {

        },
        // 处理文本节点
        textUpdater(node, value) {
            node.textContent = value;
        }
    }
}
// 基类
class Vue {
    constructor(options) {
        // 当new该类时，参数就会传到构造函数中 options就是el  data ...
        this.$el = options.el; // 创建一个当前实例$el
        this.$data = options.data;

        // 这个根元素存在<div id='app'></div>  编译模板
        if (this.$el) {

            // 把data里的数据 全部转化成用Object.defineProperty来定义
            new Observer(this.$data);
            new Compiler(this.$el, this);
        }
    }
}