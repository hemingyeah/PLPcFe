import TaskFlow from "@model/types/setting/task/TaskFlow";

class TaskFlowSetting {
    /** 新建工单 */
    create: TaskFlow = new TaskFlow();

    /** 指派工单 */
    allot: TaskFlow = new TaskFlow();

    /** 接受工单 */
    accept: TaskFlow = new TaskFlow();

    /** 开始工单 */
    start: TaskFlow = new TaskFlow();

    /** 完成工单 */
    finish: TaskFlow = new TaskFlow();

    /** 结算工单 */
    cost: TaskFlow = new TaskFlow();

    /** 回访工单 */
    review: TaskFlow = new TaskFlow();

    /** 关闭工单 */
    close: TaskFlow = new TaskFlow();
}

export default TaskFlowSetting;