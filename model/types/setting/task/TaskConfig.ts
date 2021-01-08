import TaskOptions from "@model/types/setting/task/TaskOptions";
import BaseTaskConfig from "@model/types/setting/task/BaseTaskConfig";
import ReoportPrintSetting from "@model/types/setting/task/ReoportPrintSetting";
import TaskFlowSetting from "@model/types/setting/task/TaskFlowSetting";
import TaskOverTimeSetting from "@model/types/setting/task/TaskOverTimeSetting";
import PlanRemindSetting from "@model/types/setting/task/PlanRemindSetting";

import TaskApprover from "@model/types/setting/task/TaskApprover";
import Preson from "@model/types/setting/task/Preson";

class TaskConfig {
    /**  工单类型id */
    id: String = '';

    /**
     * 工单类型名称
     */
    name: String = '';

    /**
     * 工单类型描述
     */
    description: String = '';

    /**
     * 标签（只用于行业模板库中的记录）
     */
    labels: any[] = [];

    /** 工单类型启用状态 */
    enabled: Boolean = false;

    /**
     * 工单类型基础配置
     */
    config: BaseTaskConfig = new BaseTaskConfig();

    /** 工单流程设置 */
    flowSetting: TaskFlowSetting =  new TaskFlowSetting();
    
    /**
     * 高级设置
     */
    options: TaskOptions = new TaskOptions();

    /**
     * 服务报告设置
     */
    reportSetting: ReoportPrintSetting = new ReoportPrintSetting();

    /**
     * 打印模板设置
     */
    printSetting: ReoportPrintSetting = new ReoportPrintSetting();

    /** 短信延迟发送开关 */
    delayBack: Boolean = false;

    /** 延迟发送时间 */
    delayBackMin: Number = 0;

    /** 自动回访开关 */
    autoReviewState: Boolean = false;

    /** 工单流程超时设置 */
    taskOverTimeModels: TaskOverTimeSetting[] = [
        new TaskOverTimeSetting('allot'),
        new TaskOverTimeSetting('accept'),
        new TaskOverTimeSetting('start'),
        new TaskOverTimeSetting('finish'),
    ];
    
    /** 计划时间提醒设置 */
    planRemindSetting: PlanRemindSetting = new PlanRemindSetting();

    /** 计划时间提醒类型 */
    noticeLeader: String = '';

    /** 计划时间提醒指定人员 */
    noticeUsers: Preson[] = [];

    /** 暂停工单开关 */
    allowPause: Boolean = false;

    /** 暂停工单审批设置 */
    pauseApproveSetting: TaskApprover = new TaskApprover();

    /** 取消工单开关 */
    allowCancel: Boolean = false;

    /** 取消工单审批设置 */
    cancelApproveSetting: TaskApprover = new TaskApprover();

    /** 可用团队设置 */
    tags: any[] = [];
}

export default TaskConfig;