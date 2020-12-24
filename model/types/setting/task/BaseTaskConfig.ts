
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
     * 工单类型名称
     */
    name: String ='';

    /**
     * 电子签名的最大数量
     */
    autographMaxCount?: Number;

    /**
     * 自定义颜色
     */
    color: String = 'rgb(115,127,124)';

    /**
     * formUser ???
     */
    formUser?: any = null;

    /**
     * 拍照 / 位置异常设置
     */
    positionExceptionConfig: PhotoPositionExceptionConfig = new PhotoPositionExceptionConfig();
}

export default BaseTaskConfig;