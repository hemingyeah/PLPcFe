import TaskOptions from "@model/types/setting/task/TaskOptions";
import BaseTaskConfig from "@model/types/setting/task/BaseTaskConfig";
import ReoportPrintSetting from "@model/types/setting/task/ReoportPrintSetting";

class TaskConfig {
    /**
     * 工单类型基础配置
     */
    config: BaseTaskConfig = new BaseTaskConfig();
    
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
}

export default TaskConfig;