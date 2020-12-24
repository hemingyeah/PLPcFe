/* mixin */
import taskFormSettingMixin from '../common/taskFormSettingMixin';
/* api */
import * as SettingTaskApi from "@src/api/SettingTaskApi";
/* util */
import * as FormUtil from '@src/component/form/util';
import { parse } from '@src/util/querystring'

export default {
  name: 'task-receipt-form-setting-view',
  mixins: [taskFormSettingMixin],
  props: {
  },
  data() {
    return {
      cardName:'',
      mode: 'task_card',
      taskCardId:''
    }
  },
  async mounted(){
    let query = parse(window.location.search) || {};
    this.taskCardId = query.cardId;
    try {
      // 获取表单字段列表
      let fields = await SettingTaskApi.getAddCardFields({ cardId: this.taskCardId });
      let sortedFields = fields.sort((a, b) => a.orderId - b.orderId);
      
      this.fields = FormUtil.toFormField(sortedFields);
      this.init = true;
      
    } catch (error) {
      console.log('task-card-fields-setting-view: mounted -> error', error)
    }
  },
  methods: {
    //返回
    back(){
      window.parent.frameHistoryBack(window)
    },
    /** 
    * @description 提交表单字段设置
    */
    async submit() {
      try {
        let fields = FormUtil.toField(this.fields);
        fields.forEach((item, index) => {
          item.tableName = this.mode;
        });

        let message = FormUtil.validate(fields);
        if(!FormUtil.notification(message, this.$createElement)) return;

        this.pending = true;
        console.log("fields",fields)
        let result = await TaskApi.taskCardFieldsSave(fields);

        let isSuccess = result.status == 0;
        this.$platform.notification({
          type: isSuccess ? 'success' : 'error',
          title: `附加组件表单更新${isSuccess ? '成功' : '失败'}`,
          message: isSuccess ? null : result.message
        })

      } catch (error) {
        console.error(error)
      }

      this.pending = false;
    }
  }
}