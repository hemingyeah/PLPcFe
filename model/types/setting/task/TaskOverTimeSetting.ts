import Preson from "@model/types/setting/task/Preson";

class TaskOverTimeSetting {
    /** 流程节点 */
    overTimeState: String = '';

    /** 超时提醒时间前后设置 */
    overTimeBeforeOrAfter: Number = 0;

    /** 超时提醒时间设置(分钟) */
    overTime: Number = 0;

    /** 超时提醒类型 */
    overTimeTypeUser: Number = 0;

    /** 提醒指定人员 */
    overTimeUsers: Preson[] = [];
    
    constructor(overTimeState?: string) {
        this.overTimeState = overTimeState || '';
    }
}

export default TaskOverTimeSetting;