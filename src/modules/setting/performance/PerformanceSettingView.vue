<template>
  <div class="performance-setting-container">
    <div class="nav-side-bar">
      <h1>绩效规则设置</h1>
      <h3>绩效规则</h3>
      <a href="/setting/performance/rule" style="padding-left: 13px">旧版链接</a>
    </div>

    <div class="function-area">
      <rule-setting :init-data="initData"></rule-setting>
    </div>
  </div>
</template>

<script>
import RuleSetting from './RuleSetting.vue';

export default {
  name: 'performance-setting-view',
  props: {
    initData: {
      type: Object,
      default: () => ({}),
    }
  },
  data() {
    return {}
  },
  components: {
    [RuleSetting.name]: RuleSetting,
  }
}
</script>

<style lang="scss">

  .performance-setting-container {
    display: flex;
    padding: 10px;

    .nav-side-bar {
      width: 280px;
      background: #fff;
      margin-right: 10px;

      h1, h3 {
        margin: 0;
      }
      h1 {
        font-size: 18px;
        line-height: 46px;
        padding: 0 10px;
        border-bottom: 1px solid #f4f4f4;
      }

      h3 {
        line-height: 40px;
        padding: 0 10px;
        border-left: 3px solid $color-primary;
        color: #444;
      }
    }

    .function-area {
      width: 660px;
      flex-grow: 1;
      padding: 10px;
      background: #fff;
    }
  }

</style>