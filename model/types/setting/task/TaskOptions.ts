class TaskOptions {
    /**
     * 允许工单负责人修改工单折扣费 - 修改单品价格
     */
    public editUnitPrice: Boolean = false;

    /**
     * 允许工单负责人修改工单折扣费 - 修改工单总折扣价
     */
    public showDiscountCost: Boolean = false;

    /**
     * 服务报告使用系统模板开关
     */
    public srSysTemplate: Boolean = false;

    /**
     * 打印使用系统模板开关
     */
    public ptSysTemplate: Boolean = false;

}

export default TaskOptions;