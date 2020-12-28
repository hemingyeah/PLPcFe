class PlanRemindSetting {
    /** 计划事件提醒开关 */
    state: Boolean = false;

    /** 提醒时间前后设置(0=前,1=后) */
    isAhead: Number =  0;

    /** 计划时间提醒分钟 */
    minutes: Number = 0;
}

export default PlanRemindSetting;