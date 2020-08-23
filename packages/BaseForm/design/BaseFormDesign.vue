<template>
  <div class="base-form-design">
    <div class="base-form-design-menu">
      <div>
        <div>
          <span>基础组件</span>
          <span>系统组件</span>
        </div>

      </div>
    </div>
    <div class="base-form-design-main">
      <div class="base-form-design-preview"></div>
    </div>
    <div class="base-form-design-setting">
      组件设置
    </div>
  </div>
</template>

<script>
export default {
  name: 'base-form-design'
}
</script>

<style lang="scss">
.base-form-design{
  height: 100%;
  display: flex;
  flex-flow: row nowrap;


  &-menu{
    width: 300px;
  }

  &-setting{
    width: 200px;
  }

  &-main{
    flex: 1;
    overflow: auto;
  }


  &-preview{
    height: 2000px;
    border: 1px solid #ddd;
    margin:  0 auto;

    width: 480px;
  }
}
</style>

