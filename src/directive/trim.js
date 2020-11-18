/**
 * 控件值去掉前后空格
 * 组件已经监听重复事件，该指令不会生效  
 * 
 * 目前： 支持el-input
 * @author zhuoer
 */
const directive = {
  bind(el, binding, vnode){
    let eventName = binding.arg;
    let instance = vnode.componentInstance;

    debugger;
    if(!!instance.$listeners[eventName]){
        return;
    }

    instance.$on(eventName, function(e) {
        this.$emit('input', this.value.trim());
    })
  },
};

export default directive;

/** exmaple */
{/* <el-input v-model="value" v-trim:blur> */}

