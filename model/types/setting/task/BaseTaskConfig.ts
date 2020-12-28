class PhotoPositionExceptionConfig{
    /**
     * 启用拍照设置开关
     */
    attUploadLimitMobile: Boolean = false;

    /**
     * 启用照片水印开关
     */
    photoWatermark: Boolean = false;

    /**
     * 照片水印位置
     */
    watermarkPosition: String = "";

    /**
     * 照片水印展示信息
     */
    watermarkContent: String[] = [];

    /**
     * 位置异常提醒设置开关
     */
    positionExceptionFlag: Boolean = true;


    /**
     * 超出工单距离
     */
    exceptionRange: Number = 0.0;

    /**
     * 提示位置异常流程设置
     */
    exceptionFlagFlows: String[] = [];
}

class BaseTaskConfig {
    /**
     * 电子签名的最大数量
     */
    autographMaxCount?: Number;

    /**
     * 自定义颜色
     */
    color: String = 'rgb(115,127,124)';

    /**
     * 表单人员 (工单表单/回执表单中必填的人员字段) todo_zr: 审批下拉框需要表单人员
     */
    formUser: any = null;

    /**
     * 工单时间必填阶段 0无 1接受 2开始  默认 1
     */
    taskTimeState?: any = null;

    /**
     * 拍照 / 位置异常设置
     */
    positionExceptionConfig: PhotoPositionExceptionConfig = new PhotoPositionExceptionConfig();
}

export default BaseTaskConfig;