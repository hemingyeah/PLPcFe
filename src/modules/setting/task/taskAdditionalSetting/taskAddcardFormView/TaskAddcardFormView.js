/* mixin */
import fieldMixin from '@src/mixins/fieldMixin';
import FormDesignMixin from '@src/mixins/formDesign';
/* api */
import * as SettingTaskApi from '@src/api/SettingTaskApi';
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
      cloneName:'',
      cardName:'',
      mode: 'task_card',
      taskCardId:'',
      fields:[]
    }
  },
  mounted(){
    let query = parse(window.location.search) || {};
    this.taskCardId = query.cardId;

    this.getTaskCardNameReq();
    this.initFieldsData();
  },
  methods: {
    // 初始化表单字段
    async initFieldsData() {
      try {
        // 获取表单字段列表
        let fields = await SettingTaskApi.getAddCardFields({ cardId: this.taskCardId, isFromSetting: true });
        let sortedFields = fields.sort((a, b) => a.orderId - b.orderId);
        
        this.fields = FormUtil.toFormField(sortedFields);
        this.loading = false;
      } catch (error) {
        this.loading = false;
      }
    },
    // 返回
    back(){
      let fromId = window.frameElement.getAttribute('fromid');
      let id = window.frameElement.dataset.id
      this.$platform.closeTab(id)

      this.$platform.openTab({
        id: 'M_SYSTEM',
        title: '附加组件设置',
        url: '/setting/task/cardManage',
        reload: true,
        close: true,
        fromId
      });
    },
    /** 
    * @description 提交表单字段设置
    */
    async submit() {
      try {
        if(this.cardName !== this.cloneName ){
          let res = await SettingTaskApi.updateTaskCardName({id: this.taskCardId, name: this.cardName});
          if(res.status !== 0){
            return this.$message.warning(res.message);
          }
        }
        let fields = FormUtil.toField(this.fields);
        fields.forEach((field, index) => {
          field.cardId = this.taskCardId;
          field.orderId = index;    
        });

        let message = FormUtil.validate(fields);
        if(!FormUtil.notification(message, this.$createElement)) return;

        this.pending = true;
        let result = await SettingTaskApi.taskCardFieldsSave(fields);

        let isSuccess = result.status == 0;
        this.$platform.notification({
          type: isSuccess ? 'success' : 'error',
          title: `附加组件表单更新${isSuccess ? '成功' : '失败'}`,
          message: isSuccess ? null : result.message
        })
        if(isSuccess){
          this.initFieldsData();
        }

      } catch (error) {
        console.error(error)
      }

      this.pending = false;
    },
    
    // 获取组件名称
    getTaskCardNameReq() {
      SettingTaskApi.getTaskCardName({id: this.taskCardId}).then(res=>{
        const { status, message, data } = res;
        if(status == 0){
          this.cloneName = data.name;
          this.cardName = data.name;
        }
      }).catch(error=>{
        console.log(error)
      })
    },

    // 更新组件名称
    updateTaskCardName() {
      SettingTaskApi.updateTaskCardName({id: this.taskCardId, name: this.cardName}).then(res=>{
        const { status, message, data } = res;
        if(status != 0){
          this.$message.error(message);
        }
      }).catch(error=>({}))
    }
  }
}