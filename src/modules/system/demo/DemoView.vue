<template>
  <div style="padding: 10px;">

    <biz-select-column ref="bizSelectColumn"></biz-select-column>
    <base-button type="primary" @event="openS">
      选择列
    </base-button>
  </div>
</template>

<script>

export default {
  name: 'demo-view',
  data () {
    return {

    }
  },
  methods: {
    openS() {
      this.$refs.bizSelectColumn.open();
    },
  },
  mounted() {
    this.openS();
  }
};
</script>



