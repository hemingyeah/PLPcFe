<template>
  <div class="form-preview-address-box">
    <div class="form-preview-group">
      <label>
        {{field.displayName}} 
        <span class="form-preview-notNull" v-if="field.isNull == 0">*</span>
        <i class="iconfont icon-yidongduanxianshi" v-if="field.isAppShow === 1"></i>
      </label>
      <div class="form-preview-mock">
        <p class="form-preview-control form-preview-withIcon">
          <i class="iconfont icon-fdn-select"></i>
        </p>
      </div>
    </div>
    <div class="form-preview-group">
      <label> 解析地址 <span class="form-preview-notNull" v-if="field.isNull == 0">*</span><i class="iconfont icon-yidongduanxianshi" v-if="field.isAppShow === 1"></i></label>
      <div class="form-preview-mock">
        <p class="form-preview-control">{{field.placeHolder}}</p>
      </div>
    </div>
  </div>

</template>

<script>
import { previewProps } from '@src/component/form/components/props';

export default {
  name: 'form-address-preview',
  props: previewProps
}
</script>
<style lang="scss" scoped>
  .form-preview-address-box{
    .form-preview-group{
      border-bottom: 1px solid  #F5F5F5;
    }
  }
</style>

