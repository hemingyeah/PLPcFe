<template>
  <div class="form-setting-panel">
    <!-- start 标题 -->
    <form-title-setting
      :field="field"
      :setting="setting"
      @input="update"
    ></form-title-setting>
    <!-- end 标题 -->
    <p class="form-setting-separator-tips">你可以在表单中放置一个分割线方便分段显示信息，让页面更加直观，效果图示：</p>
    <div class="form-setting-separator-show">
      <img src="@src/assets/img/form/separatorShow.png" class="unselect" alt="分割线控件效果图" width="100%"/>
    </div>
    <!--如果分割线在表单的最后，那么在生成表单和展示表单数据时该字段将会被忽略。-->
  </div>
</template>

<script>
import SettingMixin from '@src/component/form/mixin/setting';
import { settingProps } from '@src/component/form/components/props';

export default {
  name: 'form-separator-setting',
  mixins: [SettingMixin],
  props: settingProps,
  methods: {
    update(event){
      let el = event.target;
      let prop = el.dataset.prop;
      let value = el.value;

      this.$emit('input', {value, prop})
    }
  }
}
</script>

<style lang="scss" scoped>
.form-setting-panel{
  position: relative;
  .form-setting-separator-tips{
    margin-bottom: 13px;
    font-size: 12px;
    color: #666666;
    line-height: 17px;
  }
  .form-setting-separator-show{
    position: absolute;
    transform: translateX(-12px);
    width: 100%;
    padding: 13px 11px;
    background: #FAFAFA;
  }
}

.unselect {
  -webkit-user-select: none; 
  -moz-user-select: none;    
  -khtml-user-select: none;  
  -ms-user-select: none; 
}
</style>
