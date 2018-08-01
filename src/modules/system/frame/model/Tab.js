export default class Tab{
  constructor(options = {}){
    let closeable = options.close;
    //close closeable属性作用一样，但是closeable会覆盖close
    if(undefined !== options.closeable) closeable = options.closeable;
    //首页不允许关闭
    if(options.url == '/home') closeable = false;
  
    this.id = options.id || Math.random() * 10000000 >> 0;
    this.fromId = options.fromId;

    this.title = '正在加载...';
    this.originTitle = options.title;

    this.url = options.url || '';

    this.closeable = closeable !== false;
    this.show = options.show !== false;
    this.loading = true;
  }
}