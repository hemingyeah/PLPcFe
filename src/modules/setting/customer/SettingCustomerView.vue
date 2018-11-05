<template>
  <div class="setting-customer">
    <div class="setting-customer-header">
      <a href="javascript: history.back();">返回</a>
      <h3>客户字段设置</h3>
      <button type="button" class="btn btn-primary">发布</button>
    </div>
    <div class="setting-customer-design">
      <form-design v-model="fields" ></form-design>
    </div>
  </div>
</template>

<script>
export default {
  name: 'setting-customer-view',
  props: {
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data(){
    return {
      fields: []
    }
  },
  methods: {
    setFields(){

    }
  }
}
</script>

<style lang="scss">
html,body{
  height: 100%;
}
.setting-customer{
  height: 100%;
}
.setting-customer-header{
  padding: 0 10px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  height: 41px;
  background-color: #fff;
  border-bottom: 1px solid #f4f7f5;
}

.setting-customer-design{
  height: calc(100% - 41px);
}

</style>
