import Preson from "@model/types/setting/task/Preson";

class TaskOverTimeSetting {
    /** 流程节点 */
    overTimeState: String = '';

    /** 超时提醒时间前后设置 */
    isAhead: Number = 0;

    /** 超时提醒时间设置(分钟) */
    minutes: Number = 0;

    /** 超时提醒类型 */
    remindType: Number = 0;

    /** 提醒指定人员 */
    reminders: Preson[] = [];
    
    constructor(overTimeState?: string) {
        this.overTimeState = overTimeState || '';
    }
}

export default TaskOverTimeSetting;