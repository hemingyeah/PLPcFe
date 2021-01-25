/* util */
import _ from 'lodash';
/* api */
import * as SettingTaskApi from '@src/api/SettingTaskApi';
import { parse } from '@src/util/querystring'
// components
import NoteSetDialog from './components/NoteSetDialog';
import DateSetDialog from './components/DateSetDialog';
export default {
  name: 'task_card_setting',
  data() {
    return {
      cardConfig: {},
      isShowNoteSetDialog:false,
      fieldsList:[],
      loading: false,
      taskCardId:'',
      cardName:''
    }
  },
  mounted(){
    let query = parse(window.location.search) || {};
    this.taskCardId = query.cardId;

    this.getTaskCardNameReq();
    this.initCardView();
  },
  methods: {
    // 保存用时记录
    onSaveSetSubmit(value, type) {
      this.fieldsList.forEach((field, item )=> {
        if(field.fieldId == value.fieldId ){
          field.displayName = value.displayName;
          field.isNull = value.isNull;
        } 
      })

      this.saveCardConfigReq();
      if(type == 'dateSet'){
        this.$refs.dateSetDialog.onClose();
      }else{
        this.$refs.noteSetDialog.onClose();
      }
    },

    onSetChange() {
      this.saveCardConfigReq();
    },

    // 点击设置
    onSet(setType, field) {
      if(setType == 'noteSet') {
        this.$refs.noteSetDialog.openDialog()
        this.$refs.noteSetDialog.field = _.cloneDeep(field);
      }else{
        this.$refs.dateSetDialog.openDialog()
        this.$refs.dateSetDialog.field = field;
      }
    },
    // 初始化表单字段
    initCardView() {
      SettingTaskApi.getCardConfig({id: this.taskCardId}).then(res=>{
        const { status, data } = res;
        if(status == 0){
          this.fieldsList = data.cardFieldList;
          this.cardConfig = JSON.parse(data.card.config);
        }
      }).catch(error=>({}))

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
    // 保存工时记录配置
    saveCardConfigReq() {
      let configParams = JSON.parse(JSON.stringify(this.cardConfig));
      configParams.maxTime = configParams.maxTime != '' ? Number(configParams.maxTime) : '';
      const params = {
        cardId: this.taskCardId, 
        config: JSON.stringify(configParams), 
        cardFieldList: this.fieldsList
      }

      SettingTaskApi.saveCardConfig(params).then(res=>{
        const { status, message } = res;
        if(status == 0){
          this.$message.success('设置成功')
        }else{
          this.$message.warning(message)
        }
      }).catch(error=>({}))
    },
    // 获取组件名称
    getTaskCardNameReq() {
      SettingTaskApi.getTaskCardName({id: this.taskCardId}).then(res=>{
        const { status, message, data } = res;
        if(status == 0){
          this.cardName = data.name;
        }else{
          this.$message.warning(message);
        }
      }).catch(error=>({}))
    },
  },
  components: {
    [NoteSetDialog.name]: NoteSetDialog,
    [DateSetDialog.name]: DateSetDialog
  },
}