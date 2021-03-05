import TaskApprover from "@model/types/setting/task/TaskApprover";

class TaskFlow extends TaskApprover{
    /** 启用状态 */
    state: Boolean = false;

    /** 工单表单或回执表单的模板id */
    ttid: String = '';

    /** 超时提醒（小时）*/
    overTime: Number = 0;

    /** 审批设置 */
    approveSetting: TaskApprover = new TaskApprover();

    /** 转派时也审批 */
    reallotAppr?: Boolean = false;
}

export default TaskFlow;