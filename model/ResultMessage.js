class ResultMessage{
  constructor(status, message, data){
    //成功 - 0 失败 - 1
    this.status = status;
    this.message = message;

    if(data) this.data = data;
  }

  static succ(message, data){
    return new ResultMessage(0, message, data);
  }

  static fail(message, data){
    return new ResultMessage(1, message, data)
  }

  isSucc(){
    return this.status === 0;
  }
}

module.exports = ResultMessage;