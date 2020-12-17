<template>
    <base-modal
        :title="`设置${titleType}`"
        width="700px"
        @cancel="cancel"
        :show.sync="isShow"
        :mask-closeable="false">
        <div class="system-template-cnotainer">
            <!--S 公司信息 -->
            <!-- 名称、电话、地址、邮箱、自助门户(默认全选) -->
            <el-row>
                <h2>公司信息</h2>
                <el-checkbox-group v-model="tenantFields">
                    <el-checkbox
                        v-for="item in companyColumns"
                        :key="item.key"
                        :label="item.key">
                        {{item.label}}
                    </el-checkbox>
                </el-checkbox-group>
            </el-row>
            <!--E 公司信息 -->

            <!--S 客户信息 -->
            <!--名称、电话、地址、邮箱、自助门户(默认全选)-->
            <el-row>
                <h2>客户信息</h2>
                <el-checkbox-group v-model="customerFields">
                    <el-checkbox key="name" label="name">客户</el-checkbox>
                    <!-- 客户系统字段 -->
                    <template v-for="item in customerSysColumns">
                        <el-checkbox
                            v-if="customerField.setting && customerField.setting.customerOption[item.key]"
                            :key="item.key"
                            :label="item.key">
                            {{item.label}}
                        </el-checkbox>
                    </template>
                </el-checkbox-group>
            </el-row>
            <!--E 客户信息 -->

            <!--S 工单信息 -->
            <el-row>
                <h2>工单信息</h2>
                <el-checkbox-group v-model="taskFields">
                    <el-checkbox
                        v-for="item in taskColumns"
                        :key="item.key"
                        :label="item.key">
                        {{item.label}}
                    </el-checkbox>
                </el-checkbox-group>
            </el-row>
            <!--E 工单信息 -->

            <!--S 回执信息 -->
            <el-row>
                <h2>回执信息</h2>
                <el-checkbox-group v-model="receiptFields">
                    <el-checkbox
                        v-for="item in receiptColumns"
                        :key="item.key"
                        :label="item.key">
                        {{item.label}}
                    </el-checkbox>
                </el-checkbox-group>
            </el-row>
            <!--E 回执信息 -->

            <!--S 附加组件信息 -->
            <el-row v-for="(cardInfo, idx) in cardDetailList" :key="idx">
                <h2>附件组件: {{cardInfo.cardName}}</h2>
                <el-checkbox-group v-model="cardFields[cardInfo.cardId]">
                    <el-checkbox
                        v-for="item in cardInfo.fields"
                        :key="item.fieldName"
                        :label="item.fieldName">
                        {{item.displayName}}
                    </el-checkbox>
                    <!-- 附加组件系统字段 -->
                    <el-checkbox
                        v-for="item in cardSysColumns"
                        :key="item.key"
                        :label="item.key">
                        {{item.label}}
                    </el-checkbox>
                </el-checkbox-group>
            </el-row>
            <!--E 附加组件信息 -->

            <!--S 附件信息 --> 
            <el-row>
                <h2>附件信息</h2>
                <!-- 工单附件 -->
                <el-checkbox-group v-model="taskAttachments">
                    <el-checkbox
                        v-for="item in taskAttachmentColumns"
                        :key="item.fieldName"
                        :label="item.fieldName">
                        工单-{{item.displayName}}
                    </el-checkbox>
                </el-checkbox-group>
                <!-- 回执附件--> 
                <el-checkbox-group v-model="receiptAttachments">
                    <el-checkbox
                        v-for="item in receiptAttachmentColumns"
                        :key="item.fieldName"
                        :label="item.fieldName">
                        {{ item.fieldName === 'receiptAttachment' ? '回执-附件' : `回执-${item.displayName}` }}
                    </el-checkbox>
                </el-checkbox-group>
                <!-- 单次附件组件附件 -->
                <el-checkbox-group v-model="singleCardInfoAttachments">
                    <el-checkbox
                        v-for="item in singleCardInfoAttachmentColumns"
                        :key="item.fieldName"
                        :label="item.fieldName">
                        {{`${item.cardName}-${item.displayName}` }}
                    </el-checkbox>
                </el-checkbox-group>
                <!-- 多次附件组件附件 -->
                <el-checkbox-group v-model="multipleCardInfoAttachments">
                    <el-checkbox
                        v-for="item in multipleCardInfoAttachmentColumns"
                        :key="item.fieldName"
                        :label="item.fieldName">
                        {{`${item.cardName}-${item.displayName}` }}
                    </el-checkbox>
                </el-checkbox-group>
            </el-row>
            <!--E 附件信息 -->
        </div>
        <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="saveSystemTemplate" :loading="pedding">保 存</el-button>
        </div>
    </base-modal>
</template>

<script>
// columns 
import { companyColumns, customerSysColumns, taskColumns, receiptColumns, cardSysColumns} from "./columns";
// api
import * as TaskApi from '@src/api/TaskApi.ts';

export default {
    name: 'system-template-dialog',
    props: {
        visiable: {
            type: Boolean,
            default: false
        },
        type: {
            type: String,
            default: ''
        },
        typeId: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            isShow: false,
            pedding: false,

            taskTypeConfig: {}, // 当前工单类型配置详情(除了附加组件)
            cardDetailList: [], // 附加组件列表

            taskFieldList: [], // 工单表单字段
            receiptFieldList: [], // 回执表单字段

            // 勾选项
            tenantFields: [], // 公司字段
            customerFields: [], // 客户字段
            taskFields: [], // 工单字段
            receiptFields: [], // 回执字段
            cardFields: {}, // 组件字段

            taskAttachments: [], // 工单附件字段
            receiptAttachments: [], // 回执附件字段
            singleCardInfoAttachments: [], // 单次附加组件附件字段
            multipleCardInfoAttachments: [] // 多次附加组件附件字段
        }
    },
    computed: {
        titleType() {
            return this.type === 'reportSetting' ? '服务报告' : '打印模板';
        },
        customerField() {  // 工单表单过滤出来的客户控件字段
            return this.taskFieldList.find(item => item.formType == 'customer' && item.fieldName == 'customer') || {};
        },
        companyColumns() {
            return companyColumns;
        },
        customerSysColumns() {
            return customerSysColumns;
        },
        taskColumns() {
            return [
                ...this.taskFieldList.filter(item => {
                    return item.formType != 'attachment' && item.formType != 'customer' && item.enabled;
                }),
                ...taskColumns
            ];
        },
        receiptColumns() {
            return [
                ...receiptColumns,
                ...this.receiptFieldList.filter(item => {
                    return !['attachment','receiptAttachment','sparepart','serviceIterm','systemAutograph'].includes(item.formType);
                })
            ];
        },
        cardSysColumns() {
            return cardSysColumns;
        },
        taskAttachmentColumns() {
            return this.taskFieldList
                    .filter(item => item.formType === 'attachment')
                    .map(({displayName, fieldName}) => {
                        return {
                            displayName,
                            fieldName
                        }
                    });
        },
        receiptAttachmentColumns() {
            let receiptAttachmentColumns =  this.receiptFieldList
                    .filter(item => item.formType === 'attachment')
                    .map(({displayName, fieldName}) => {
                        return {
                            displayName,
                            fieldName
                        }
                    });

            if(this.showAttachment) {
                receiptAttachmentColumns.unshift(
                    {
                        displayName: '回执附件',
                        fieldName: 'receiptAttachment'
                    }
                )
            }

            return receiptAttachmentColumns;
        },
        showAttachment() {
            //  todo_zr: 缺少jsp页面的参数
            return true || taskType.options.showAttachment;
        },
        cardAttachmentColumns() {
            let cardAttachmentColumns = [];
            
            this.cardDetailList.forEach(cardInfo => {
                cardInfo.fields.forEach(field => {
                    if(field.formType === 'attachment') {
                        cardAttachmentColumns.push({
                            cardId: cardInfo.cardId,
                            cardName: cardInfo.cardName,
                            displayName: field.displayName,
                            fieldName: field.fieldName,
                            inputType: cardInfo.inputType
                        })
                    }
                });
            });

            return cardAttachmentColumns;
        },
        singleCardInfoAttachmentColumns() {
            return this.cardAttachmentColumns.filter(item => item.inputType ==='single');        },
        multipleCardInfoAttachmentColumns() {
            return this.cardAttachmentColumns.filter(item => item.inputType ==='multiple');
        }
    },
    watch: {
        visiable(val){
            this.isShow = val;
            if(val) {
                this.fetchTaskCardDetailList().then(() => {
                    // 控制接口调用顺序
                    this.fetchTasktype();
                })
                this.getFields('task');
                this.getFields('task_receipt');
            }

        }
    },
    methods:{
        cancel() {
            this.$emit('update:visiable', false);
        },
        /**
         * 将对象数组转化成字符串数组
         * 注: 因element-ui checkbox组件不支持对象数组, 故需要这样处理
         */
        convertArrayObjectToKey(arr, objKey) {
            if(!Array.isArray(arr)) {
                return [];
            }
            return arr.map(item => item[objKey]);
        },
        /**
         * 将字符串数组转化成对象数组
         */
        convertArrayKeyToObject(arr, objKey, options) {
            if(!Array.isArray(arr)) {
                return [];
            }
            
            return options.filter(item => arr.includes(item[objKey]));
        },
        /**
         * 获取工单设置的除组件外的其他信息
         */
        async fetchTasktype() {
            try {
                let params = {
                    id: this.typeId
                };
                let res = await TaskApi.getTaskType(params);
                this.taskTypeConfig = res.data;

                let {tenantFields,customerFields,taskFields,receiptFields,cardFields,attachmentFields} = res.data[this.type];
                cardFields = cardFields ||[];
                attachmentFields = attachmentFields || [];

                this.tenantFields = tenantFields ||[];
                this.customerFields = customerFields ||[];
                this.taskFields = taskFields ||[];
                this.receiptFields = receiptFields ||[];

                cardFields.forEach(item => {
                    this.cardFields[item.cardId] = item.fields;
                })

                this.taskAttachments = this.convertArrayObjectToKey(attachmentFields.taskAttachments, 'fieldName');
                this.receiptAttachments = this.convertArrayObjectToKey(attachmentFields.receiptAttachments, 'fieldName');
                this.singleCardInfoAttachments = this.convertArrayObjectToKey(attachmentFields.singleCardInfoAttachments, 'fieldName');
                this.multipleCardInfoAttachments = this.convertArrayObjectToKey(attachmentFields.multipleCardInfoAttachments, 'fieldName');
            
            
                if(JSON.stringify(res.data.reportSetting) == "{}"){
                    let reportSetting = {"tenantFields":["name","phone","email","address","portal"],"customerFields":["name","product","address","linkman"],"taskFields":["taskNo","planTime","executor"],"receiptFields":["sparepart","service","autograph"]}
                    let reportForm = {};
                    reportForm.id = this.typeId;
                    reportForm.reportSetting = reportSetting;


                    try {
                        let res = await TaskApi.saveSystemReport(reportForm);
                        if(res.status == 0){
                            console.log('默认回执报告设置已保存')
                        }
                    } catch (err) {
                        console.error('设置默认回执报告出错 => err', err);
                    }
                }
            } catch (err) {
                console.error('fetch Tasktype => err', err);
            }
        },
        /**
         * 获取工单表单/回执表单字段
         */
        async getFields(tableName) {
            try {
                let params = {
                    typeId: this.typeId,
                    tableName
                };
                let res = await TaskApi.getFields(params);

                res.map(item => {
                    item.label = item.displayName;
                    item.key = item.fieldName;
                    return item;
                });

                if(tableName === 'task') {
                    this.taskFieldList = res;
                }
                if(tableName === 'task_receipt'){
                    this.receiptFieldList = res;
                }
            } catch (err) {
                console.error('fetch TaskTypeFields => err', err);
            }
        },
        /**
         * 获取附加组件列表
         */
        async fetchTaskCardDetailList() {
            try {
                let res = await TaskApi.getTaskCardDetailList({typeId: this.typeId});
                this.cardDetailList = res || [];
                res.map(item => {
                    this.$set(this.cardFields, item.cardId,[]);
                })
            } catch (err) {
                console.error('fetch TaskCardDetailList => err', err);
            }
        },
        /**
         * 保存
         */
        async saveSystemTemplate() {
            let cardFields = Object.keys(this.cardFields).map(cardId => {
                return {
                    cardId,
                    fields: this.cardFields[cardId]
                }
            });

            let attachmentFields = {
                taskAttachments: this.convertArrayKeyToObject(this.taskAttachments,'fieldName', this.taskAttachmentColumns),
                receiptAttachments: this.convertArrayKeyToObject(this.receiptAttachments,'fieldName', this.receiptAttachmentColumns),
                singleCardInfoAttachments: this.convertArrayKeyToObject(this.singleCardInfoAttachments,'fieldName',this.singleCardInfoAttachmentColumns),
                multipleCardInfoAttachments: this.convertArrayKeyToObject(this.multipleCardInfoAttachments,'fieldName', this.multipleCardInfoAttachmentColumns)
            }

            let params = {
                id: this.typeId,
                [this.type]: {
                    tenantFields: this.tenantFields,
                    customerFields: this.customerFields,
                    taskFields: this.taskFields,
                    receiptFields: this.receiptFields,
                    cardFields,
                    attachmentFields
                }
            }

            let fetchFn = this.type === 'reportSetting' ? TaskApi.saveSystemReport : TaskApi.saveSystemPrint;
            
            this.pedding = true;

            try {
                let res = await fetchFn(params);
                if(res.succ) {
                    this.$notify.success('保存成功');
                }else{
                    this.$notify.error(res.message);
                }

                this.cancel();
            } catch (err) {
                console.error('saveSystemTemplate => err', err);
            } finally{
                this.pedding = false;
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.system-template-cnotainer{
    min-height: 500px;
    max-height: 700px;
    padding: 12px;
    overflow-y: auto;
    & > div {
        font-size: 14px;
        h2{
            font-size: 16px;
        }
    }
}
</style>