<template>
  <div class="rule-setting-container">
    <h2 class="rule-section-title">
      绩效规则
      <base-button type="primary" native-type="submit" @event="openSettingDialog">添加</base-button>
    </h2>



    <setting-rule-dialog :all-types="allTypes" ref="settingRuleDialog"></setting-rule-dialog>
  </div>
</template>

<script>
import SettingRuleDialog from './components/SettingRuleDialog.vue';


export default {
  name: "rule-setting",
  props: {
    initData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
    }
  },
  computed: {
    allTypes() {
      const { serviceType, serviceContent, templateId} = this.initData;
      return {
        taskTypes: (templateId || []).map(({templateName , templateId}) => ({
          label: templateName,
          value: templateId,
        })),
        serviceTypes: (serviceType || []).map(st => ({
          label: st,
          value: st,
        })),
        serviceContents: (serviceContent || []).map(sc => ({
          label: sc,
          value: sc,
        })),
      };
    }
  },
  mounted() {
    console.log('mounted');
  },
  methods: {
    openSettingDialog() {
      this.$refs.settingRuleDialog.toggleDialog();
    },
  },
  components: {
    [SettingRuleDialog.name]: SettingRuleDialog,
  }
}
</script>

<style lang="scss">

  .rule-setting-container {
    background: #ffffff;

    .rule-section-title {
      display: flex;
      justify-content: space-between;
      line-height: 32px;
      font-size: 16px;
      margin: 0;

    }
  }

</style>