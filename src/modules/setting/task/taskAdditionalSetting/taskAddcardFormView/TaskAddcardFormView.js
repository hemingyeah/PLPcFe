/* mixin */
import fieldMixin from '@src/mixins/fieldMixin';
import FormDesignMixin from '@src/mixins/formDesign';
/* api */
import * as SettingTaskApi from "@src/api/SettingTaskApi";
/* util */
import * as FormUtil from '@src/component/form/util';
import { parse } from '@src/util/querystring'

export default {
  name: 'task_card_setting',
  mixins: [fieldMixin, FormDesignMixin],
  data() {
    return {
      init: false,
      loading: true,
      pending:false,
      cardName:'',
      mode: 'task_card',
      taskCardId:'',
      fields:[]
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
      this.loading = false;
    } catch (error) {
      this.loading = false;
      console.log('task-card-fields-setting-view: mounted -> error', error)
    }
    // this.getFieldsInfoReq()
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