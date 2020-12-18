/* mixin */
import taskFormSettingMixin from './../common/taskFormSettingMixin';
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';
/* util */
import * as FormUtil from '@src/component/form/util';

export default {
  name: 'task-receipt-form-setting-view',
  mixins: [taskFormSettingMixin],
  props: {
    templateId: {
      type: String,
      default: '3021d20b-e2a1-4740-9c68-068a88019921' // 暂时写死
    },
    templateName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      mode: 'task_receipt',
    }
  },
  async mounted(){
    try {
      // 获取表单字段列表
      let fields = await TaskApi.getFields({ tableName: this.mode, typeId: this.templateId });
      let sortedFields = fields.sort((a, b) => a.orderId - b.orderId);
      
      this.fields = FormUtil.toFormField(sortedFields);
      this.init = true;
      
    } catch (error) {
      console.log('task-receipt-fields-setting-view: mounted -> error', error)
    }
  },
  methods: {
    /** 
    * @description 提交表单字段设置
    */
    async submit() {
      try {
        let fields = FormUtil.toField(this.fields);

        fields.forEach((item, index) => {
          item.templateId = this.templateId;
          item.templateName = this.templateName;
          item.tableName = this.mode;
          item.orderId = index;
        });

        let message = FormUtil.validate(fields);
        if(!FormUtil.notification(message, this.$createElement)) return;

        this.pending = true;

        let result = await TaskApi.taskSettingSave(fields);

        let isSuccess = result.status == 0;
        this.$platform.notification({
          type: isSuccess ? 'success' : 'error',
          title: `工单回执表单更新${isSuccess ? '成功' : '失败'}`,
          message: isSuccess ? null : result.message
        })

      } catch (error) {
        console.error(error)
      }

      this.pending = false;
    }
  }
}