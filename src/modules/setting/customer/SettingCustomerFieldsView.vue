<template>
  <div class="setting-customer">
    <div class="setting-customer-header">
      <div>
        <button type="button" class="btn btn-text setting-back-btn" @click="back"><i class="iconfont icon-arrow-left"></i> 返回</button>
        <span class="setting-header-text">|</span>
        <button type="button" class="btn btn-primary" @click="submit" :disabled="pending">保存</button>
      </div>

    </div>
    <div class="setting-customer-design">
      <form-design v-model="fields" :max="maxField" mode="customer"></form-design>
    </div>
  </div>
</template>

<script>
import * as FormUtil from '@src/component/form/util';
import http from '@src/util/http';
import platform from '@src/platform';

export default {
  name: 'setting-customer-fields-view',
  props: {
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data(){
    let fields = this.initData.fields || [];
    let sortedFields = fields.sort((a, b) => a.orderId - b.orderId);

    return {
      fields: FormUtil.toFormField(sortedFields),
      pending: false,
      maxField: this.initData.fieldNum
    }
  },
  methods: {
    back(){
      window.parent.frameHistoryBack(window)
    },
    async submit(){
      try {
        let fields = FormUtil.toField(this.fields);

        fields.forEach(item => {
          item.tableName = 'customer';
        });

        let message = FormUtil.validate(fields);
        if(!FormUtil.notification(message, this.$createElement)) return;

        this.pending = true;
        let result = await http.post('/setting/customer/saveFields', fields);
        if(result.status == 0){
          platform.notification({
            type: 'success',
            title: '成功',
            message: '客户字段更新成功'
          })  
          return window.location.reload()
        }

        platform.notification({
          type: 'error',
          title: '客户字段更新失败',
          message: result.message
        })
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

body{
  padding: 10px;
}

.setting-customer{
  height: 100%;
  background-color: #fff;
}

.setting-header-text{
  margin-right: 12px;
}

.setting-customer-header{
  padding: 10px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border-bottom: 1px solid #f4f7f5;
}

.setting-customer-design{
  height: calc(100% - 53px);
}

.setting-back-btn{
  i.iconfont{
    line-height: 12px;
    font-size: 12px;
  }
}

.form-design-center {
  background: url('./../../../assets/img/iphoneX.png') no-repeat center 0;
  background-size: 100%;

  position: relative;
  height: 720px;
  width: 370px;

  margin: 0 auto;

  .form-design-phone {
    position: absolute;
    top: 72px;
    left: 20px;
    right: 23px;
    bottom: 22px;

    height: calc(100% - 80px);
    width: calc(100% - 50px);

    border-radius: 0 0 35px 35px;
    border: 1px solid #edf0f4;
    border-top: none;
    background-color: #edf0f4;
    box-shadow: none;

    &::-webkit-scrollbar {
      display: none;
    }

  }


}

</style>
