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
    };

    this.ALLOCATED = {
      name: "已指派",
      value: "allocated",
      cv: "250, 174, 20",
    };

    this.TASK_POOL = {
      name: "工单池",
      value: "taskPool",
      cv: "19, 194, 194",
    };

    this.ACCEPTED = {
      name: "已接受",
      value: "accepted",
      cv: "250, 174, 20",
    };

    this.PROCESSING = {
      name: "进行中",
      value: "processing",
      cv: "250, 174, 20",
    };

    this.FINISHED = {
      name: "已完成",
      value: "finished",
      cv: "103, 194, 58",
    };

    this.REFUSED = {
      name: "已拒绝",
      value: "refused",
      cv: "245, 108, 108",
    };

    this.COSTED = {
      name: "已结算",
      value: "costed",
      cv: "103, 194, 58",
    };

    this.CLOSED = {
      name: "已关闭",
      value: "closed",
      cv: "103, 194, 58",
    };

    this.OFFED = {
      name: "已取消",
      value: "offed",
      cv: "153, 153, 153",
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
}

export default new TaskStateEnum();
