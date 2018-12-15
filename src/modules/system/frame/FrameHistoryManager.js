/**
 * 当前应用中存在多个frame，为了保证每个frame能独立跳转，历史记录由单一分支，变成了多分支
 * 因此浏览器维护的历史堆栈不再适用。
 * 
 * 该对象设计用于维护多个frame的历史堆栈，
 * 根据frame的id维护一个历史记录的数组
 */
const FrameHistoryManager = {
  stack: {}, //历史记录堆栈 key为frame的id
  /** 根据frameid记录该frame的历史记录 */
  push(id, url){
    //初始化默认值
    if(!Array.isArray(this.stack[id])) this.stack[id] = [];
    //如果不是最后一条记录
    let index = this.stack[id].lastIndexOf(url);
    let length = this.stack[id].length;
    //数组中没有  或者  不是最后一个
    if(index < 0 || (index >= 0 && index < length - 1)){
      this.stack[id].push(url);
    }
  },
  /** 删除frame历史堆栈 */
  removeStack(id){
    delete this.stack[id];
  },
  /** 根据frameid获取上一条历史 */
  getReferrer(id){
    if(!Array.isArray(this.stack[id])) return null;

    let index = this.stack[id].length - 2;
    let url = null;
    if(index >= 0){
      url = this.stack[id][index];
      //删除历史记录
      this.stack[id].length = index + 1;
    }

    return url;
  }
};

export default FrameHistoryManager;