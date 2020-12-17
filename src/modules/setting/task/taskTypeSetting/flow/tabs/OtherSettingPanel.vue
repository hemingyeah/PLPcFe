<template>
    <div class="other-setting-panel">
        <div class="other-setting-main">
            <!--S 生成服务报告 -->
            <div class="setting-service-report">
                <h2>
                    生成服务报告
                    <el-switch class="ml-16"/>
                </h2>
                可在PC端或移动端针对完成的工单生成电子服务报告
                <div class="mt-8">
                    <el-radio-group v-model="radio">
                        <el-radio :label="0" class="mr-50">
                            使用系统模
                            <el-button 
                                :type="radio === 0 ? 'primary': 'default'" 
                                :disabled="radio === 1" 
                                plain 
                                size="small"
                                @click="openTemplateDialog('reportSetting')">
                                设置
                            </el-button>
                        </el-radio>
                        <el-radio :label="1">
                            上传个人模板
                            <el-button 
                                :type="radio === 1 ? 'primary': 'default'" 
                                :disabled="radio === 0" 
                                plain
                                @click="importPresonTemplate('report')"
                                size="small">
                                设置
                            </el-button>
                        </el-radio>
                    </el-radio-group>
                </div>
                <p class="mt-8">
                    电子服务报告显示浮现【服务完成】的水印
                    <el-switch />
                </p>
            </div>
            <!--E 生成服务报告 -->

            <!--S 启用打印功能 -->
            <div class="setting-photo">
                <h2>
                    启用打印功能
                    <el-switch class="ml-16" />
                </h2>
                可以在PC端打印工单信息
                <div class="mt-8">
                    <el-radio-group v-model="radio">
                        <el-radio :label="0" class="mr-50">
                            使用系统模板
                            <el-button 
                                :type="radio === 0 ? 'primary': 'default'" 
                                :disabled="radio === 1" 
                                plain 
                                size="small"
                                @click="openTemplateDialog('printSetting')">
                                设置
                            </el-button>
                        </el-radio>
                        <el-radio :label="1">
                            上传个人模板
                            <el-button 
                                :type="radio === 1 ? 'primary': 'default'" 
                                :disabled="radio === 0" 
                                plain 
                                @click="importPresonTemplate('print')"
                                size="small">
                                设置
                            </el-button>
                        </el-radio>
                    </el-radio-group>
                </div>
                
            </div>
            <!--E 启用打印功能 -->

            <!--S 启用拍照设置 -->
            <div class="setting-photo">
                <h2>
                    启用拍照设置
                    <el-switch
                        class="ml-16"
                        v-model="cameraForm.attUploadLimitMobile"/>
                </h2>
                开启后，上传照片时只可现场拍摄上传，将不能够在相册选择并进行上传
            </div>
            <!--E 启用拍照设置 -->

            <!--S 照片水印设置 -->
            <div class="setting-water-mark" v-if="cameraForm.attUploadLimitMobile">
                <h2>
                    照片水印设置
                    <el-switch class="ml-16" v-model="cameraForm.photoWatermark"/>
                </h2>
                开启后，照片将在
                <el-select
                    v-model="cameraForm.watermarkPosition"
                    placeholder="请选择水印位置">
                    <el-option
                        v-for="item in waterMarkDirection"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                自动浮现水印说明以下信息
                <div class="mt-8">
                    <el-select class="w-542" v-model="cameraForm.watermarkContent" multiple placeholder="请选择水印位置">
                        <el-option
                            v-for="item in photoInfoArr"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                </div>
            </div>
            <!--E 照片水印设置 -->

            <!--S 位置异常设置 -->
            <div class="setting-postion-exception">
                <h2>
                    位置异常提醒
                    <el-switch class="ml-16" v-model="cameraForm.positionExceptionFlag" />
                </h2>
                <p>
                    开启后，在以下节点时若负责人超出工单距离
                    <el-input class="w-120" v-model="cameraForm.exceptionRange" placeholder="请输入距离"></el-input>
                    公里
                </p>
                将在工单流程中提示位置异常
                <div class="mt-8">
                    <el-select class="w-542" v-model="cameraForm.exceptionFlagFlows" multiple placeholder="请选择">
                        <el-option
                            v-for="item in processArr"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>    
                    </el-select> 
                </div>
            </div>
            <!--E 位置异常设置 -->
        </div>

        <!-- 系统模板设置字段弹窗 -->
        <system-template-dialog :visiable.sync="isShowSystemModal" :type="templateType" :typeId="typeId"/>
        <!-- 导入模板设置弹窗 -->
        <template-upload-dialog :visiable.sync="isShowTemplateUploadModal" :type="templateType" :typeId="typeId" :templates.sync="templates">
        </template-upload-dialog>
    </div>
</template>

<script>
// api
import * as TaskApi from '@src/api/TaskApi.ts';
// components 
import SystemTemplateDialog from "../../components/SystemTemplateDialog";
import TemplateUploadDialog from "../../components/TemplateUploadDialog";

export default {
    name: 'other-setting-panel',
    data() {
        return {
            typeId: '41f136b6-0159-4257-8e77-dcfcee278f9c',

            radio: '',
            cameraForm : {
                attUploadLimitMobile : true,
                photoWatermark : true,
                watermarkPosition : "",
                watermarkContent : [],
                positionExceptionFlag : true,
                exceptionRange : "",
                exceptionFlagFlows : []
            },
            // todo_zr
            templates: [
                {
                    fileSize: "3.54KB",
                    filename: "2020-09-28计划任务数据 (1)-李超-2020-12-17.xlsx",
                    id: "0826c04a-e42d-433a-a099-8ffc7a0bb3e3",
                    url: "https://she-dev.oss-cn-hangzhou.aliyuncs.com/acs/newfiles/7416b42a-25cc-11e7-a500-00163e12f748/202012/78125110-0c10-47ad-9b09-012873ace143.xlsx"
                }
            ],

            isShowSystemModal : false,
            templateType: 'service',
            isShowUploadModal : false,
            isShowTemplateUploadModal: false,
        }
    },
    computed: {
        waterMarkDirection() {
            return [
                {label : "左上", value : "topLeft"},
                {label : "左下", value : "bottomLeft"},
                {label : "右上", value : "topRight"},
                {label : "右下", value : "bottomRight"},
            ]
        },
        photoInfoArr() {
            return [
                {label : "操作人姓名", value : "name"},
                {label : "拍摄时间", value : "time"},
                {label : "拍摄地点", value : "position"},
            ]
        },
        processArr() { 
            return  [
                {label : "开始", value : "start"},
                {label : "完成", value : "finish"}
            ]
        },
    },
    methods: {
        importPresonTemplate(type) {
            this.templateType = type;
            this.isShowTemplateUploadModal = true;
        },
        openTemplateDialog(type) {
            this.templateType = type;
            this.isShowSystemModal = true;
        },
    },
    mounted() {
    },
    components: {
        [SystemTemplateDialog.name]: SystemTemplateDialog,
        [TemplateUploadDialog.name]: TemplateUploadDialog
    }
}
</script>

<style lang="scss" scoped>
.other-setting-panel{
    width: 100%;
    height: calc(100vh - 48px);
    padding: 16px 12px 24px 12px;
    background: #F5F5F5;
    .other-setting-main{
        height: 100%;
        background: #FFFFFF;
        border-radius: 4px;
        padding: 20px 50px;
        & > div {
            font-size: 14px;
            color: #999999;
            h2{
                color: #333333;
                font-size: 16px;
                margin: 12px 0;
            }
            p{
                margin-bottom: 8px;
                color: #666666;
            }
        }
    }
}


.w-120{
    width: 120px;
}
.w-542{
    width: 542px;
}

.mr-50{
    margin-right: 50px;
}
.ml-16{
    margin-left: 16px;
}
.mt-8{
    margin-top: 8px;
}
</style>