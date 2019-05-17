<template>
  <div class="performance-setting-container">
    <div class="nav-side-bar">
      <h1>绩效规则设置</h1>
      <h3>绩效规则</h3>
    </div>

    <div class="function-area">
      <base-setting :setting="setting"/>
      <rule-setting :init-data="initData"></rule-setting>
    </div>
  </div>
</template>

<script>
import RuleSetting from './RuleSetting.vue';
import BaseSetting from './BaseSetting.vue';

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
  computed: {
    setting() {
      const {sendToCc} = this.initData || {};
      return {
        sendToCc
      }
    }
  },
  mounted() {

    console.log('this.initData', this.initData);
  },
  components: {
    [RuleSetting.name]: RuleSetting,
    [BaseSetting.name]: BaseSetting,
  }
}
</script>

<style lang="scss">

  .performance-setting-container {
    display: flex;
    padding: 10px;
    min-width: 1020px;

    .nav-side-bar {
      width: 280px;
      background: #fff;
      margin-right: 10px;
      width: 30%;
      max-width: 420px;

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
      width: 70%;
      flex-grow: 1;
    }
  }

</style>