class TaskApprover{
    /** 审批层级 */
    level: Number = 0;

    /** 第一级审批类型 */
    leader: String = '';

    /** 第一级审批的指定人员 */
    approvers: any[] = [];

    /** 多级审批（二级以及以上层级审批） */
    multiApproverSetting: TaskApprover[] = [];
} 

export default TaskApprover;