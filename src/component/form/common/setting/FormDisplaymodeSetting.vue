<template>
  <div class="form-displaymode-setting form-setting-group form-setting-item">
    <div class="form-displaymode-setting-panel">
      <h4 class="form-displaymode-setting-title">
        <span class="form-displaymode-setting-title-name">选项显示模式</span>
        <el-tooltip placement="top" popper-class="form-displaymode-setting-tooltip" >
          <div slot="content">
            <template v-if="isMulti">
              <div>平铺</div>
              <div class="form-displaymode-setting-item">未勾选“多选”时，平铺的显示效果为：<span class="circle"></span>选项1  <span class="circle"></span>选项2</div>
              <div class="form-displaymode-setting-item">勾选“多选”时，平铺的显示效果为：<span class="square"></span>选项1  <span class="square"></span>选项2</div>
            </template>
            <template v-else>平铺的显示效果为：<span class="circle"></span>选项1  <span class="circle"></span>选项2</template>
          </div>
          <i class="iconfont icon-question"></i>
        </el-tooltip>
      </h4>
    </div>
    <div class="form-displaymode-setting-type">
      <div class="type-btn-group">
        <el-radio-group  v-model="selectType" @change="update" size="medium" >
          <el-radio-button :label="1" >下拉模式</el-radio-button>
          <el-radio-button :label="2" >平铺模式</el-radio-button>
        </el-radio-group>
       </div>
    </div>
  </div>
</template>

<script>
/* config */
import * as config from '@src/component/form/config';
/* props */
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'form-displaymode-setting',
  props: {
    ...settingProps,
    isMulti: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return{
      selectType: this.field.setting.selectType || 1
    }
  },
  methods: {
    update(value) {
      this.$emit('input', value, 'selectType', true);
    }
  }
}
</script>

<style lang="scss" >
.form-displaymode-setting {
  .form-type-text {
    height: 20px;
    line-height: 20px;
    padding: 0 6px;
    
    font-size: $font-size-small;
    color: $text-color-regular;
    background-color: $bg-color-l3;
    border-radius: 10px;
  }
  .form-displaymode-setting-title{
    margin-bottom: 12px;
  }
  .form-displaymode-setting-type{
    .type-btn-group{
      .el-radio-group{
        width: 100%;
          label{
            width: 50%;
            margin: 0 !important; 
            .el-radio-button__inner{
              width: 100%;
              padding: 8px 20px;
            } 
      
          }
      }
    }
  }
  .el-radio-button:first-child .el-radio-button__inner{
    border-radius: 4px 0 0 4px;
  }
  .el-radio-button:last-child .el-radio-button__inner{
    border-radius: 0 4px 4px 0;
  }
}
.form-displaymode-setting-tooltip{
    .form-displaymode-setting-item{
      margin-top: 5px;
    }
    .circle{
      width: 10px;
      height: 10px;
      display: inline-block;
      border-radius: 50%;
      background: #fff;
      margin-right: 5px;
      
    }
    .square{
      width: 10px;
      height: 10px;
      display: inline-block;
      background: #fff;
      margin-right: 5px;  
    }
  }

</style>