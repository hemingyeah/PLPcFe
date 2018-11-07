<template>
  <div class="setting-customer">
    <div class="setting-customer-header">
      <a href="javascript: history.back();" class="setting-back-btn"><i class="iconfont icon-return"></i> 返回</a>
      <h3>客户字段设置</h3>
      <button type="button" class="btn btn-primary" @click="submit" :disabled="pending">保存</button>
    </div>
    <div class="setting-customer-design">
      <form-design v-model="fields" ></form-design>
    </div>
  </div>
</template>

<script>
import * as FormUtil from '@src/component/form/util';
import http from '@src/util/http';
import platform from '@src/platform'

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
      fields: FormUtil.toFormField(this.initData.fields || []),
      pending: false
    }
  },
  methods: {
    async submit(){
      this.pending = true;

      try {
        let fields = FormUtil.toField(this.fields);
        fields.forEach(item => item.tableName = 'customer')
        let result = await http.post('/setting/saveFieldInfoList', fields);

        if(result.status == 0){
          window.location.reload()
        }else{
          platform.alert(result.message)
        }
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
