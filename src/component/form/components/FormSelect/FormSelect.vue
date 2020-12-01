<template>
  <div class="form-select">
    <!-- start 下拉模式 -->
    <el-select
      v-if="selectType==1"
      :id="`form_${field.fieldName}`"
      :placeholder="placeholder"
      :clearable="clearable"
      :multiple="isMulti"
      ref="elSelect"
      filterable
      :value="value" @change="input">
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.text"
        :value="item.value">
      </el-option>
    </el-select>
    <!-- end 下拉模式 -->

    <!-- start 单选平铺模式 -->
    <el-radio-group v-model="newValue" @change="input"  v-if="!isMulti&&selectType==2">
      <el-radio
        v-for="item in options"
        :label="item.text" 
        :key="item.value"
        :value="item.value">
        {{item.text}}
      </el-radio>
    </el-radio-group>
    <!-- end 单选平铺模式 -->

    <!-- start 多选平铺模式 -->
    <el-checkbox-group v-model="newValue" @change="input" v-if="isMulti&&selectType==2">
      <el-checkbox  
        v-for="item in options" 
        :label="item.text" 
        :key="item.id">
        {{item.text}}
      </el-checkbox>
    </el-checkbox-group>
    <!-- end 多选平铺模式 -->

  </div>
</template>

<script>
import FormMixin from '@src/component/form/mixin/form';

export default {
  name: 'form-select',
  mixins: [FormMixin],
  props: {
    value: [String, Number, Array],
    source: {
      type: Array
    },
    clearable: {
      type: Boolean,
      default: true
    }
  },
  data(){
    return{
      newValue: this.value,
      selectType:this.field.setting.selectType || 1
    }

  },
  computed: {
    isMulti(){
      let setting = this.field.setting || {};
      return setting.isMulti;
    },
    options(){
      let setting = this.field.setting || {};
      let dataSource = setting.dataSource || [];

      dataSource = dataSource.map(d => {
        if (typeof d === 'string') {
          return {
            text: d,
            value: d,
          }
        }
        return d;
      });
      return this.source || dataSource || [];
    }
  },
  methods: {
    input(newValue){
      let oldValue = null;
      if(this.selectType == 1) this.$refs.elSelect.blur();      
      this.$emit('update', {newValue, oldValue, field: this.field});
      this.$emit('input', newValue);
    }
  }
}
</script>


<style lang="scss">
.form-select{
  width: 100%;

  .el-select{
    width: 100%;

    .el-input__inner{
      padding-left: 10px;
    }

    // 超出长度多行显示
    .el-tag {
      height: auto;
      .el-select__tags-text {
        white-space: pre-wrap;
      }
    }
    // 超出单行显示'...'
    // .el-tag {
    //   position: relative;
    //   max-width: 100%;
    //   display: flex;
    //   justify-content: center;
    //   align-items: center;
    //   .el-select__tags-text {
    //     white-space: nowrap;
    //     text-overflow: ellipsis;
    //     overflow: hidden;
    //     padding-right: 10px;
    //     display: inline-block;
    //     max-width: 100%;
    //   }
    //   .el-tag__close {
    //     position: absolute;
    //     right: 0;
    //     top: 4px;
    //   }
    // }

  }
  .el-radio-group,.el-checkbox-group{
    width: 100%;
    label{
      padding: 0;
      min-width: 110px;
      width: auto;
    }
    .el-checkbox__label,.el-radio__label{
      overflow-wrap: break-word;
      text-overflow: ellipsis; 
      white-space: normal;
    }
  }
}
</style>
