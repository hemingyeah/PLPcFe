/* mixin */
import taskFormSettingMixin from './../common/taskFormSettingMixin';

export default {
  name: 'task-receipt-form-setting-view',
  mixins: [taskFormSettingMixin],
  data() {
    return {
      templateId: '1',
      templateName: '默认工单',
      tenantId: '7416b42a-25cc-11e7-a500-00163e12f748'
    }
  },
  async mounted(){
    try {
      // TODO: 修改参数
      let fields = await TaskApi.getFields({ tableName: 'task_receipt', typeId: '1' });
      let sortedFields = fields.sort((a, b) => a.orderId - b.orderId);
      
      this.fields = FormUtil.toFormField(sortedFields);
      this.init = true;
      
    } catch (error) {
      console.log('task-receipt-fields-setting-view: mounted -> error', error)
    }
  },
  methods: {
    async submit(_obj) {
      try {
        let fields = FormUtil.toField(this.fields);
        let index = 0;
        fields.forEach(item => {
          item.tableName = 'task_receipt';
          item.orderId = index++;
          item.tenantId = this.tenantId;
          item.templateId = this.templateId;
          item.templateName = this.templateName;
        });

        let message = FormUtil.validate(fields);
        if(!FormUtil.notification(message, this.$createElement)) return;

        this.pending = true;

        let result = await TaskApi.taskSettingSave(fields);

        if(_obj.clickType) {
          this.$refs.otherSetting.didShowSystemPanel();
        }else{
          if(result.status == 0){
            this.$platform.notification({
              type: 'success',
              title: '成功',
              message: '工单回执表单更新成功'
            })
            return window.location.reload()
          }else{
            this.$platform.notification({
              type: 'error',
              title: '工单回执表单更新失败',
              message: result.message
            })
          }
        }

      } catch (error) {
        console.error(error)
      }
      this.pending = false;
    }
  }
}