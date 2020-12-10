<template>
    <base-modal
        title="新建工单类型"
        width="672px"
        @cancel="cancel"
        :show.sync="isShow"
        :mask-closeable="false">
        <div class="add-task-type">
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
            <el-row v-if="clickedTaskType === 'copy'" class="choose-copy-type" type="flex" >
                <label>工单类型</label>
                <el-select v-model="taskType" placeholder="请选择工单类型">
                    <el-option
                        v-for="item in taskTypeList"
                        :key="item.id"
                        :label="item.typeName"
                        :value="item.id">
                    </el-option>
                </el-select>
            </el-row>
            <el-button v-if="clickedTaskType === 'copy'" class="next-btn" type="primary" @click="gotoNext">下一步</el-button>
        </div>

        <!-- 选择行业模板弹窗 -->
        <choose-trade-dialog :visiable.sync="isShowChooseTradeDialog"/>
    </base-modal>
</template>

<script>
import taskTemplateBlank from "@src/assets/img/setting/task-template-blank.png";
import taskTemplateCopy from "@src/assets/img/setting/task-template-copy.png";
import taskTemplateTrade from "@src/assets/img/setting/task-template-trade.png";

import ChooseTradeDialog from './ChooseTradeDialog.vue';

export default {
    name:'add-task-type-dialog',
    props: {
        visiable: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        taskTemplateList() {
            return [
                {
                    type: 'blank',
                    title: '从空白模版创建',
                    desc: '全新定义专属工单模版',
                    bgImg: taskTemplateBlank
                },
                {
                    type: 'copy',
                    title: '从现有模版创建',
                    desc: '快速复制现有类型',
                    bgImg: taskTemplateCopy
                },
                {
                    type: 'trade',
                    title: '从行业模版创建',
                    desc: '丰富的模版供您选',
                    bgImg: taskTemplateTrade
                },
            ]
        }
    },
    data() {
        return {
            taskTypeList: [{
                id: 1,
                open: true, teamList: [],
                typeName: '默认工单类型标题',
                teams: '杭州市西湖团队',
                updateName: '张燕青',
                updateDate: '2020-10-20'
            },{
                id: 2,
                open: true, teamList: [],
                typeName: '默认工单类型字段超出一行可以换行，最多展示2行',
                teams: '杭州市西湖团队',
                updateName: '张燕青',
                updateDate: '2020-10-20'
            }],
            clickedTaskType: '',
            hoverTaskType: '',

            taskType: '',
            isShow: false,
            isShowChooseTradeDialog: false,
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
            if(type !== 'copy') {
                this.clickedTaskType = '';
            }
        },
        getCardActive(type) {
            return this.clickedTaskType === type || this.hoverTaskType === type;
        },
        cancel() {
            this.taskType = '';
            this.$emit('update:visiable', false);
        },
        chooseTypeTemplate(type) {
            this.clickedTaskType = type;

            switch(type) {
                case 'blank':  // 空白模板
                    this.$platform.openTab({
                        id: "task_flow_setting",
                        title: "工单流程设置",
                        url: `/setting/task/taskFormSet`,
                        reload: true
                    });
                    this.cancel();
                    break;
                case 'trade': // 行业模板
                    this.isShowChooseTradeDialog = true;
                    break;
                default: 
                    break;
            }
        },
        gotoNext() {
            if(!this.taskType) {
                this.$platform.alert('请选择工单类型');
                return;
            }
            this.$platform.openTab({
                id: "task_flow_setting",
                title: "工单流程设置",
                url: `/setting/task/taskFormSet?taskTypeId=${this.taskType}`,
                reload: true,
            });
            this.cancel();
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
            box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.08);
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

    .choose-copy-type{
        padding: 20px 20px 0 20px;
        line-height: 32px;
        label{
            margin-right: 36px;
        }
    }
    .next-btn{
        float: right;
    }
}
</style>