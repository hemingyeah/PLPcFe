const common = {
  // 过滤特殊字符
  escape(value){
    return value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
};

export default common;