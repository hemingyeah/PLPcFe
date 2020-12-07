/* mixin */
import taskFormSettingMixin from './../common/taskFormSettingMixin';
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';
/* util */
import * as FormUtil from '@src/component/form/util';

export default {
  name: 'task-form-setting-view',
  mixins: [taskFormSettingMixin],
  props: {
    templateId: {
      type: String,
      default: '07d7bd22-b277-4dbf-a147-154e88ab3136' // 暂时写死
    },
    templateName: {
      type: String,
      default: ''
    }
  },
  data(){
    return {
      mode: 'task'
    }
  },
  async mounted() {
    try {
      // 获取表单字段列表
      let fields = await TaskApi.getFields({ tableName: this.mode, typeId: this.templateId });
      let sortedFields = fields.sort((a, b) => a.orderId - b.orderId);

      // 工单自带的 attachment 字段需要特殊处理, 提交时需要将formType还原
      sortedFields.forEach(f => {
        if(f.formType == 'attachment' && f.isSystem == 1) {
          f.formType = 'taskAttachment'
        }
      })
      
      this.fields = FormUtil.toFormField(sortedFields);
      this.init = true;

    } catch (error) {
      console.log('task-form-setting-view: mounted -> error', error)
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
          item.tableName = 'task';
          item.orderId = index;
          
          // 还原工单表单的系统附件的formType
          if(item.formType == 'taskAttachment' && item.isSystem) {
            item.formType = 'attachment';
          }
        })
        
        // 表单字段格式校验
        let message = FormUtil.validate(fields);
        if(!FormUtil.notification(message, this.$createElement)) return;

        this.pending = true;

        let result = await TaskApi.taskSettingSave(fields);

        let isSuccess = result.status == 0;
        this.$platform.notification({
          type: isSuccess ? 'success' : 'error',
          title: `工单字段更新${isSuccess ? '成功' : '失败'}`,
          message: isSuccess ? null : result.message
        })

      } catch (error) {
        console.error(error)
      }

      this.pending = false;
    }
  }
}