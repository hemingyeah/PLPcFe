<template>
  <base-modal
    :show.sync="visible"
    width="542px"
    class="date-set-dialog"
    @closed="onClose('form')"
  >
    <div slot="title">
      <span class="el-dialog__title">设置</span>
    </div>
    <div class="base-modal-content">
      <div class="fields-name">
        <label>标题</label>
        <el-input v-model="placeholder" placeholder="请输入标题"></el-input>
      </div>
      <div class="fields-name">
        <label>选项</label>
        <div class="form-select-setting-list">
          <draggable tag="div" class="list-group" :list="options" v-bind="{ animation:380 }" handle=".handle">
            <div v-for="(option, index) in options" :key="index" class="form-select-setting-option">
              <button type="button" class="btn-text handle"> <i class="iconfont icon-tuozhuaipaixu"></i></button>
              <el-input type="text" v-model="option.value" @input="updateOption(option.value, option)" maxlength="100"></el-input>
              <button type="button" class="btn-text form-select-setting-delete" @click="delOption(option, index)"><i class="iconfont icon-minus-fill"></i></button>
            </div>
          </draggable> 
        </div>
        <div class="form-setting-group form-select-setting-operation form-select-setting-btnbox">
          <button type="button" class="btn-text" @click="addOption">增加选项</button>
        </div>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="onClose">取 消</el-button>
      <el-button type="primary" @click="onSubmit">确 定</el-button>
    </div>
  </base-modal>
</template>
<script>
import draggable from 'vuedraggable';
import _ from 'lodash';
import Platform from '@src/platform';
import { SELECT_OPTION_MAX } from '@src/component/form/config'
export default {
  name: 'date-set-dialog',
  data() {
    return {
      field: {},
      options:[],
      placeholder:'',
      visible: false,
      isNull:0
    };
  },
  methods: {
    openDialog() {
      this.visible = true;
      this.$nextTick(()=>{
        this.options = this.getOption();
        this.placeholder = this.field.displayName;
      })
    },

    onClose() {
      this.visible = false;
    },

    // 保存数据
    onSubmit() {
      let dataSource = this.options.map(item=>item.value);
      let settingOption = {dataSource}
      if(!this.placeholder) return Platform.alert('标题不能为空');
      if(this.options.some(item=>item.value == '')) return Platform.alert('请补全选项信息');
      for(let i = 0; i < dataSource.length; i++){
        let option = dataSource[i];
        if(dataSource.lastIndexOf(option) != i){
          Platform.alert(`选项[${ option }]存在重复项`);
          return;
        }
      }
      this.field = Object.assign(this.field, {displayName:this.placeholder}, {setting: settingOption})
      this.$emit('onSave', this.field)
    },
    
    // 添加选项
    addOption() {
      if(this.options.length >= SELECT_OPTION_MAX) return Platform.alert(`选项数量不能超过${SELECT_OPTION_MAX}`);

      this.options.push({
        value: '',
        isDefault: false
      })
    },

    // 获取配置项
    getOption() {
      let options = [];
      let setting = this.field && this.field.setting ? this.field.setting : {};
      let dataSource = setting.dataSource ? setting.dataSource : [];
      dataSource.map((value)=>{
        options.push({value, isDefault: false})
      })
      return options
    },

    // 删除选项
    delOption(option, index){
      if(this.options.length <= 1) return alert('至少保留一个选项');
      this.options.splice(index, 1)
    },
  },
  components: {
    draggable
  }
};
</script>
<style lang="scss">
.date-set-dialog {
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
    .fields-name{
      margin-bottom: 19.5px;
      .form-select-setting-list{
        .el-input{
          width: 393px;
          input{
            width: 100%;
          }
        }
      }
    }
  }
}
</style>