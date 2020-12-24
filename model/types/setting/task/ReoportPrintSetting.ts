class AttachmentFields {
    /**
     *  多选附加组件附件
     */
    multipleCardInfoAttachments: String[] = [];

    /**
     *  回执附件
     */
    receiptAttachments: String[] = [];

    /**
     *  单选附加组件附件
     */
    singleCardInfoAttachments: String[] = [];

    /**
     *  工单附件
     */
    taskAttachments: String[] = [];
} 

class ReoportPrintSetting {
    /**
     * 公司信息选中字段
     */
    tenantFields: String[] = [];

     /**
     * 客户信息选中字段
     */
    customerFields: String[] = [];

    /**
     * 工单信息选中字段
     */
    taskFields: String[] = [];

    /**
     * 回执信息选中字段
     */
    receiptFields: String[] = [];

    /**
     * 附加组件信息选中字段
     */
    cardFields: String[] = [];

    /**
     * 附件信息选中字段
     */
    attachmentFields: AttachmentFields = new AttachmentFields();

    /**
     * 个人模板
     */
    templates: any[] = [];
}

export default ReoportPrintSetting;