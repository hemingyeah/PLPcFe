<template>
    <base-modal
        :title="title"
        width="672px"
        @cancel="cancel"
        :show.sync="isShow"
        :mask-closeable="false">
        <div v-if="!clickTaskType" class="add-task-type">
            <el-row type="flex" justify="space-between">
                <el-card
                    class="choose-type-box"
                    :class="getCardActive(item.type) && 'active'"
                    :style="{'background-image': 'url(' + item.bgImg + ')'}"
                    v-for="item in taskTemplateList"
                    :key="item.type"
                    shadow="hover"
                    @click.native="chooseTypeTemplate(item.type)"
                    @mouseenter.native="enterCard(item.type)"
                    @mouseleave.native="hoverTaskType = ''"
                >
                    <div class="choose-type-box-content">
                        <h2>{{item.title}}</h2>
                        <p class="task-type-desc">{{item.desc}}</p>
                    </div>
                </el-card>
            </el-row>
        </div>
        <el-form v-else :model="form" :rules="rules" ref="form" label-width="100px" class="add-task-form">
            <el-form-item v-if="clickTaskType === 'exist'" label="工单类型" prop="templetId">
                <el-select v-model="form.templetId" placeholder="请选择工单类型" class="w-360">
                    <el-option
                        v-for="item in taskTypeList"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="名称" prop="typeName">
                <el-input class="w-360" v-model="form.typeName" placeholder="显示的名称[最多20个字]"></el-input>
            </el-form-item>
            <el-form-item>
                <ul class="statecolor">
                    <li
                        v-for="color in taskTypeColor"
                        :key="color"
                        @click="form.color = color"
                        :style="{ background: color}">
                        <i class="el-icon-check" v-if="color === form.color"></i>
                    </li>
                </ul>
            </el-form-item>
        </el-form>

        <div v-if="clickTaskType" slot="footer">
            <el-button @click="cancel">取消</el-button>
            <el-button :loading="pedding" type="primary" @click="createTaskType">确定</el-button>
        </div>

        <!-- 选择行业模板弹窗 -->
        <choose-trade-dialog :visiable.sync="isShowChooseTradeDialog" @select="selectTemplate"/>
    </base-modal>
</template>

<script>
/** api */
import * as SettingApi from "@src/api/SettingApi";
// assets
import taskTemplateBlank from "@src/assets/img/setting/task-template-blank.png";
import taskTemplateCopy from "@src/assets/img/setting/task-template-copy.png";
import taskTemplateTrade from "@src/assets/img/setting/task-template-trade.png";

// components
import ChooseTradeDialog from './ChooseTradeDialog.vue';

const TASK_TYPE_COLOR = [
    'rgb(115,127,124)',
    'rgb(38,111,255)',
    'rgb(82,85,255)',
    'rgb(133,82,255)',
    'rgb(188,82,255)',
    'rgb(255,82,212)',
    'rgb(255,149,38)',
    'rgb(110,207,64)',
    'rgb(0,184,213)',
    'rgb(11,161,148)'
];

export default {
    name:'add-task-type-dialog',
    props: {
        visiable: {
            type: Boolean,
            default: false
        },
        taskTypeList: {
            type: Array,
            default: () => []
        }
    },
    data() {
        let validateTypeName = (rule, value, callback) => {
            if (value === '') return callback(new Error('请输入密码'));
            if(value.length > 20) callback(new Error('名称不能超过20个字'));
            if(!/^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(value)) return callback(new Error('请输入中文、字母、数字'));

            callback();
        };

        return {
            hoverTaskType: '',
            clickTaskType: '',

            form: {
                typeName: '',
                taskTypeId: '',
                templetId: '',
                color: 'rgb(115,127,124)'
            },
            rules: {
                taskType: [{ required: true, message: '请选择工单类型', trigger: 'blur' }],
                typeName: [
                    { required: true, message: '请输入工单类型名称', trigger: 'blur' },
                    { validator: validateTypeName, trigger: 'blur' }
                ]
            },
            
            pedding: false,
            isShow: false,
            isShowChooseTradeDialog: false,
        }
    },
    computed: {
        taskTypeColor() {
            return TASK_TYPE_COLOR;
        },
        title() {
            return this.clickTaskType ? 
                this.taskTemplateList.find(item => item.type === this.clickTaskType).title
                : '新建工单类型';
        },
        taskTemplateList() {
            return [
                {
                    type: 'blank',
                    title: '从空白模版创建',
                    desc: '全新定义专属工单模版',
                    bgImg: taskTemplateBlank
                },
                {
                    type: 'exist',
                    title: '从现有模版创建',
                    desc: '快速复制现有类型',
                    bgImg: taskTemplateCopy
                },
                {
                    type: 'template',
                    title: '从行业模版创建',
                    desc: '丰富的模版供您选',
                    bgImg: taskTemplateTrade
                },
            ]
        }
    },
    watch: {
        visiable(newVal){
            this.isShow = newVal;
        }
    },
    methods: {
        enterCard(type) {
            this.hoverTaskType = type;
        },
        getCardActive(type) {
            return this.hoverTaskType === type;
        },
        cancel() {
            let _this = this;
            this.$emit('update:visiable', false);
            setTimeout(() => {
                Object.assign(this.$data, this.$options.data());
                _this.$refs.form.resetFields();
            }, 100)
        },
        selectTemplate({taskTypeId, typeName}) {
            this.clickTaskType = 'template';
            this.form = {
                ...this.form,
                typeName,
                taskTypeId
            }
        },
        chooseTypeTemplate(type) {
            if(type === 'template') {
                return this.isShowChooseTradeDialog = true;
            }

            this.clickTaskType = type;
        },
        /**
         * 创建工单
         */
        createTaskType() {
            this.$refs.form.validate(valid => {
                if(valid) {
                    // 从行业模板创建
                    if(this.taskType === 'template') {
                        this.pedding = true;
                        SettingApi.importTaskType(this.form).then(res => {
                            if(res.status == 0){
                                window.location.href = "/setting/task/taskFormSet?taskTypeId="+res.data+"&new=true";
                            }else{
                                this.$message.error(res.message);
                            }
                        }).catch(err => {
                            console.error(err);
                        }).finally(() => {
                            this.pedding = false;
                        });
                        return;
                    }

                    // 从空白模板/现有工单类型创建
                    this.pedding = true;
                    SettingApi.createTaskType(this.form).then(res => {
                        if(res.status == 0){
                            window.location.href = "/setting/task/taskFormSet?taskTypeId="+res.data+"&new=true";
                        }else{
                            this.$message.error(res.message);
                        }
                    }).catch(err => {
                        console.error(err);
                    }).finally(() => {
                        this.pedding = false;
                    });
                }
            })
        }
    },
    components: {
        [ChooseTradeDialog.name]: ChooseTradeDialog
    }
}
</script>

<style lang="scss" scoped>
.add-task-type{
    max-height: 403px;
    padding: 40px 40px 20px 40px;
    overflow: hidden;
    .choose-type-box{
        cursor: pointer;
        position: relative;
        width: 183px;
        height: 244px;
        border-radius: 10px;

        background-repeat: no-repeat;
        background-position: center center;
        background-size: cover;

        &.active{
            .choose-type-box-content{
                transform: translateY(0);
                p{
                    opacity: 1;
                }
            }
        }

        .choose-type-box-content{
            position: absolute;
            left: 16px;
            bottom: 17px;
            color: #FFFFFF;
            transform: translateY(22px);
            transition: all .5s ease;

            h2{
                margin-bottom: 5px;
                font-size: 16px;
            }
            p{
                margin-bottom: 0;
                font-size: 12px;
                opacity: 0;
                transition: all .5s ease;
            }

        }
    }
}

.add-task-form{
    padding: 20px;
    ul.statecolor{
        padding: 0;
        line-height: 22px;
        li{
            list-style: none;
            display: inline-block;
            cursor: pointer;
            margin-right: 4px;
            width: 32px;
            height: 22px;
            vertical-align: middle;
            i{
                position: relative;
                font-weight: bold;
                left: 9px;
                color: #fff;
            }
        }
    }
}

.w-360{
    width: 360px;
}
</style>