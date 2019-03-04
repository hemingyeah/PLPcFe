<template>
  <div class="performance-setting-container">
    <div class="nav-side-bar">
      <h1>绩效规则设置</h1>

      <h3>绩效规则</h3>

    </div>
    <div class="function-area">
      <rule-setting :init-data="initData"></rule-setting>


    </div>
  </div>
</template>

<script>
import RuleSetting from './RuleSetting.vue';

export default {
  name: "performance-setting-view",
  props: {
    initData: {
      type: Object,
      default: () => ({}),
    }
  },
  data() {
    return {}
  },
  mounted() {

    console.log('performance-setting-view mounted', this.initData);
  },
  methods: {



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
      min-width: 200px;
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
      flex-grow: 2;
      padding: 10px;
      background: #fff;
    }
  }

</style>