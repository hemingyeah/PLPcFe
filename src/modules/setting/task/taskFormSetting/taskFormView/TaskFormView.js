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
      default: ''
    }
  },
  data(){
    return {
      templateName: '默认工单',
      tenantId: '7416b42a-25cc-11e7-a500-00163e12f748',
    }
  },
  async mounted() {
    try {
      // TODO: 修改参数
      let fields = await TaskApi.getFields({ tableName: 'task', typeId: 'c5e6f3de-06d8-45a9-aee4-f3946ace2aed' });
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
    async submit() {
      try {
        let fields = FormUtil.toField(this.fields);
        console.log(fields, 88888)
        let index = 0;
        fields.forEach(item => {
          item.tableName = 'task';
          item.orderId = index++;
          item.tenantId = this.tenantId;
          item.templateId = this.templateId;
          item.templateName = this.templateName;
          if(item.formType == 'taskAttachment' && item.isSystem) {
            item.formType = 'attachment';
          }
        });

        let message = FormUtil.validate(fields);
        if(!FormUtil.notification(message, this.$createElement)) return;

        this.pending = true;

        let result = await TaskApi.taskSettingSave(fields);
        
        if(result.status == 0){
          this.$platform.notification({
            type: 'success',
            title: '成功',
            message: '工单字段更新成功'
          })
          window.location.href = "/setting/task/field/taskReceipt";
        }else{
          this.$platform.notification({
            type: 'error',
            title: '工单字段更新失败',
            message: result.message
          })
        }

      } catch (error) {
        console.error(error)
      }
      this.pending = false;
    }
  }
}