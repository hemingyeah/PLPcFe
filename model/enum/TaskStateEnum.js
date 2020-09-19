/** 工单状态枚举 */
import BaseEnum from "./BaseEnum";

/**
 * cv: rgba 色值
 */
class TaskStateEnum extends BaseEnum {
  constructor() {
    super();

    this.CREATED = {
      name: "待指派",
      value: "created",
      cv: "250, 140, 22",
      color: '#FA8C16'
    };

    this.ALLOCATED = {
      name: "已指派",
      value: "allocated",
      cv: "250, 174, 20",
      color: '#FAAE14'
    };

    this.TASK_POOL = {
      name: "工单池",
      value: "taskPool",
      cv: "19, 194, 194",
      color: '#13C2C2'
    };

    this.ACCEPTED = {
      name: "已接受",
      value: "accepted",
      cv: "250, 174, 20",
      color: '#FAAE14'
    };

    this.PROCESSING = {
      name: "进行中",
      value: "processing",
      cv: "250, 174, 20",
      color: '#FAAE14'
    };

    this.FINISHED = {
      name: "已完成",
      value: "finished",
      cv: "103, 194, 58",
      color: '#67C23A'
    };

    this.REFUSED = {
      name: "已拒绝",
      value: "refused",
      cv: "245, 108, 108",
      color: '#F56C6C'
    };

    this.COSTED = {
      name: "已结算",
      value: "costed",
      cv: "103, 194, 58",
      color: '#67C23A'
    };

    this.CLOSED = {
      name: "已关闭",
      value: "closed",
      cv: "153, 153, 153",
      color: '#999'
    };

    this.OFFED = {
      name: "已取消",
      value: "offed",
      cv: "153, 153, 153",
      color: '#999'
    };

    this.PSUSED = {
      name: '暂停中',
      value: 'paused',
      cv: '245, 108, 108',
      color: '#F56C6C'
    };
  }

  setColor(value, key) {
    for (let prop in this) {
      let o = this[prop];
      o[key] = key === "colorText" ? `rgba(${o.cv}, 1)` : `rgba(${o.cv}, .2)`;
      if (o.value == value) return o[key];
    }
  }

  // 获取背景颜色
  getColor(value) {
    return this.setColor(value, "color");
  }

  // 获取字体颜色
  getColorText(value) {
    return this.setColor(value, "colorText");
  }

  getNameForTask(task = {}) {
    if (task.isPaused) return this.PSUSED.name;

    let { state } = task;

    return this.getName(state);
  }

  getColorForTask(task = {}) {
    let { state } = task;
    if (task.isPaused) state = this.PSUSED.value;

    return {
      color: this.getColorText(state),
      bgColor: this.getColor(state)
    }
  }

  getValueForTask(task = {}) {
    if(task.isPaused) return this.PSUSED.value;

    let { state } = task;
    
    return this.getValue(state);
  }
}

export default new TaskStateEnum();
