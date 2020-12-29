<template>
  <base-modal
    :show.sync="show"
    width="990px"
    class="creat-card-dialog"
    @closed="onClose"
  >
    <div slot="title">
      <span class="el-dialog__title">添加组件</span>
    </div>
    <div class="base-modal-content">
      <div class="base-card-heard">
        <div class="base-card-msg"><i class="el-icon-warning"></i> <span> 选择一种附加组件，来管理工单上的辅助性数据，您可以从已经使用的附加组件中选择，也可以直接在模板库中选择一个使用。</span></div>
        <div class="radio-type">
          <el-radio v-model="selectRadio" label="exist">从已添加的组件库选择</el-radio>
          <el-radio v-model="selectRadio" label="stock">从模版库中选择</el-radio>
        </div>

      </div>
      <!-- start 从已添加的组件库选择 -->
      <el-table
        v-if="selectRadio == 'exist'"
        ref="multipleTable"
        :data="tableCardData"
        style="width: 100%"
        class="page-table"
        :highlight-current-row="false"
        header-row-class-name="page-table-header"
        stripe
        tooltip-effect="dark"
      >
        <el-table-column type="index" :index="indexMethod" label="序号"></el-table-column>
        <el-table-column prop="name" label="名称"></el-table-column>
        <el-table-column prop="description" label="说明">
          <template slot-scope="scope">{{htmlUnEscape(scope.row.description)}}</template>
        </el-table-column> 
        <el-table-column prop="checked" label="启用" width="100px">
          <template slot-scope="scope">
            <el-checkbox v-model="scope.row.checked"></el-checkbox>
          </template>
        </el-table-column>
      </el-table>
      <!-- end 从已添加的组件库选择 -->

      <!-- start从模版库中选择-->
      <div v-if="selectRadio == 'stock'">
        <template-library :card-sys-list="cardSysList" @saveImport="saveImport"></template-library>
      </div>
      <!-- start 从模版库中选择-->
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" @click="onSubmit">确 定</el-button>
    </div>
  </base-modal>
</template>
<script>
// api
import * as SettingTaskApi from '@src/api/SettingTaskApi';
import { uniqBy, cloneDeep } from 'lodash';
// util
import { isShowCardWorkTime } from '@src/util/version.ts'
// components
import templateLibrary from './templateLibrary';

export default {
  name: 'creat-card-dialog',
  props: {
    taskCardList: {
      type: Array,
      default: () => [],
    },
    taskTypeId: {
      type: String,
    },
    visiable: {
      type: Boolean,
    },
  },
  data() {
    return {
      cardSysList:[],
      selectRadio:'exist',
      tableCardData:[],
      roleList:[],
      show: false, 
    };
  },
  computed: {
    isShowCardWorkTime() {
      return isShowCardWorkTime()
    }
  },
  watch: {
    visiable(newValue) {
      this.show = newValue;
      if (newValue) {
        this.selectRadio = 'exist';
        this.getEnabledListReq();
        this.initCardSysList();  
      }
    },
  },
  methods: {
    saveImport(cardSelected){
      this.$emit('updateImport', cardSelected)
    },
    onClose() {
      this.$emit('onClose');
    },
    onSubmit() {
      if(this.selectRadio == 'exist'){
        // 新增组件
        this.saveCardChecked();
      }else{
        // 关闭
        this.onClose();
      }
     
    },
    indexMethod(index) {
      return index + 1;
    },
    // 获取已添加的组件库列表
    getEnabledListReq() {
      SettingTaskApi.getEnabledList()
        .then((res) => {
          const { status, message, data } = res;
          if(status == 0){
            let cardLists = data;
            this.mergeSelect(cardLists)
          }

        })
        .catch((error) => {
          console.log(error);
        });
    },

    /** 
    * @description 已存在组件选中
    * 存在相同数据 则checked为true 不同则checked为false
    */
    mergeSelect(cardLists) {
      for(let i = 0;i < cardLists.length; i++){
        let card = cardLists[i];

        let index = -1;
        for(let j = 0; j < this.taskCardList.length; j++){
          if(card.id == this.taskCardList[j].id){
            index = j;
            card.checked = true;
            break;
          }
        }
        if(index < 0){
          card.checked = false;
        }
      }
      this.tableCardData = cardLists;

    },
    // 创建附加组件
    saveCardChecked() {
      let cardChecked = [];
      this.tableCardData.forEach(item=>{
        let cardSelected = {};
        if(item.checked){
          cardSelected.id = item.id;
          cardSelected.inputType = item.inputType;
          cardSelected.name = item.name;
          cardSelected.specialfrom = item.specialfrom ? item.specialfrom : '';
          cardChecked.push(cardSelected)
        }
      });
      this.$emit('update', cardChecked)
    },

    // 修改附加组件
    onUpdateCardReq() {
      const params = {
        description: this.form.description,
        id: this.form.id,
        name: this.form.name,
      };
      SettingTaskApi.onUpdateCard(params)
        .then((res) => {
          const { status, message, data } = res;
          if (status == 0) {
            this.$message.success('修改成功');
            location.reload();
          } else {
            this.$message.error(message);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },

    // 获取附加组件的信息
    getCardInfoReq() {
      SettingTaskApi.getCardInfo({ id: this.form.id })
        .then((res) => {
          const { status, message, data } = res;
          if (status == 0) {
            this.form = data;
          }
        })
        .catch((error) => ({}));
    },
    /** 
    * @description 获取组件库列表
    * 1.工时记录灰度控制 isShowCardWorkTime true显示 false隐藏
    */
    initCardSysList() {
      SettingTaskApi.getCardSysList().then(res=>{
        const { status, message, data } = res;
        if(status == 0){
          let cardList = data || [];
          
          if(!this.isShowCardWorkTime) {
            cardList = cardList.filter(function(card) {
              return card.cardName !== '工时记录';
            })
          }
          let cardSysList = [];
          let cardAll = cardList.slice();
          let wuliu = []
          let zhiliang = []
          let chanpin = []
          let shichang = []
          let kesu = []
          let feiyong = []
          let gongshi = []
          if(cardAll && cardAll.length > 0){
            cardAll.forEach((item=>{
              if(item.cardName == '发货记录' || item.cardName == '退货登记'){
                item['type'] = '物流'
                wuliu.push(item)
              }else if(item.cardName == '产品故障记录' || item.cardName == '质检登记'){
                item['type'] = '质量'
                zhiliang.push(item)
              }else if(item.cardName == '设备信息记录' || item.cardName == '配置信息'){
                item['type'] = '产品'
                chanpin.push(item)
              }else if(item.cardName == '礼品邮寄' || item.cardName == '市场活动' || item.cardName == '访问调查'){
                item['type'] = '市场'
                shichang.push(item)
              }else if(item.cardName == '质量投诉'){
                item['type'] = '客诉'
                kesu.push(item)
              }else if(item.cardName == '费用备注'){
                item['type'] = '费用'
                feiyong.push(item)
              }else if(item.cardName == '工时记录'){
                item['type'] = '工时'
                gongshi.push(item)
              }
            }))
          }
          cardSysList.push({name:'全部', list:cardAll}, {name:'物流', list:wuliu}, {name:'质量', list:zhiliang}, {name:'产品', list:chanpin}, {name:'市场', list:shichang}, {name:'客诉', list:kesu}, {name:'费用', list:feiyong}, {name:'工时', list:gongshi})
          if(!this.isShowCardWorkTime){
            this.cardSysList = cardSysList.filter(item=>item.name !== '工时') 
          }else{
            this.cardSysList = cardSysList;
          }        
        }else{
          this.$message.error(message);
        }
      }).catch(error=>{
        console.log(error)
      })
    },
    htmlUnEscape(value){
      if(!value) return '';
      return value.replace( /&lt;/g, '<').replace(/&gt;/g, '>');
    }
  },
  components: {
    [templateLibrary.name]: templateLibrary   
  },
};
</script>
<style lang="scss">
.creat-card-dialog {
  .base-modal-header {
    display: flex;
    justify-content: space-between;
    .el-dialog__title {
      font-size: 18px;
    }
    .el-tooltip {
      color: #999;
    }
  }
  .base-modal-body {
    padding: 20px;
  }
  .base-modal-content {
    .base-card-heard{
      width: 880px;
      .base-card-msg{
        height: 40px;
        line-height: 40px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.65);
        background: #E6F7FF;
        border-radius: 2px;
        border: 1px solid #91D5FF;
        margin-bottom: 21px;
        .el-icon-warning{
          color: $color-primary;
          margin-left: 17px;
        }
      }
      .radio-type{
        margin-bottom: 9px;
      }
    }
    .page-table{
      padding: 0;
    }
  }
}
</style>