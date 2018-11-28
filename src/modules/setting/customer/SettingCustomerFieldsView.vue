<template>
  <div class="setting-customer">
    <div class="setting-customer-header">
      <a href="javascript: history.back();" class="setting-back-btn"><i class="iconfont icon-return"></i> 返回</a>
      <h3>客户字段设置</h3>
      <button type="button" class="btn btn-primary" @click="submit" :disabled="pending">保存</button>
    </div>
    <div class="setting-customer-design">
      <form-design v-model="fields"></form-design>
    </div>
  </div>
</template>

<script>
import * as FormUtil from '@src/component/form/util';
import http from '@src/util/http';
import platform from '@src/platform'

export default {
  name: 'setting-customer-fields-view',
  props: {
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data(){
    let fields = this.initData.fields || []
    let sortedFields = fields.sort((a,b) => a.orderId - b.orderId)
    return {
      fields: FormUtil.toFormField(sortedFields),
      pending: false
    }
  },
  methods: {
    async submit(){
      this.pending = true;

      try {
        let fields = FormUtil.toField(this.fields);
        fields.forEach(item => {
          item.tableName = 'customer'
          item.isDelete = 0; //TODO: 待删除
        })

        let result = await http.post('/setting/customer/saveFields', fields);
        if(result.status == 0){
          return window.location.reload()
        }
        platform.alert(result.message)
      } catch (error) {
        console.error(error)
      }
      this.pending = false;
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
  height: 46px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border-bottom: 1px solid #f4f7f5;

  h3{
    margin: 0;
    font-size: 16px;
    font-weight: 500;
  }
}

.setting-customer-design{
  height: calc(100% - 46px);
}

.setting-back-btn{
  color: $text-color-regular;
  text-decoration: none !important;

  i.iconfont{
    font-size: 14px;
  }
}

</style>
