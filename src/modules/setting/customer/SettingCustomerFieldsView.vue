<template>
  <div class="setting-customer">
    <div class="setting-customer-header">
      <div>
        <button type="button" class="btn btn-text setting-back-btn" @click="back"><i class="iconfont icon-arrow-left"></i> 返回</button>
        <span class="setting-header-text">|</span>
        <button type="button" class="btn btn-primary" @click="submit" :disabled="pending">保存</button>
        <!--<span class="setting-header-text">客户字段设置</span>-->
      </div>

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
    let fields = this.initData.fields || [];
    let sortedFields = fields.sort((a,b) => a.orderId - b.orderId);
    return {
      fields: FormUtil.toFormField(sortedFields),
      pending: false
    }
  },
  methods: {
    back(){
      window.parent.frameHistoryBack(window)
    },
    async submit(){
      // TODO: 字段验证

      try {
        let fields = FormUtil.toField(this.fields);
        fields.forEach(item => {
          item.tableName = 'customer';
          item.isDelete = 0; // TODO: 待删除
        });

        const validateRes = this.validate(fields);
        if (validateRes && validateRes.length) {
          return platform.alert(validateRes.join('\n'));
        }

        this.pending = true;

        let result = await http.post('/setting/customer/saveFields', fields);
        if(result.status == 0){
          platform.alert('客户字段更新成功');
          return window.location.reload()
        }
        platform.alert(result.message)
      } catch (error) {
        console.error(error)
      }
      this.pending = false;
    },
    validate(fields) {
      const msg = [];

      if (fields.some(f => !f.displayName)) {
        msg.push('请检查客户字段设置，有字段标题标题缺失请补全。');
        return msg;
      }

      let tv1, tv2;
      fields.forEach(f => {
        tv1 = f.displayName.match(/[\u4E00-\u9FA5]/g);
        tv2 = f.displayName.match(/[A-Za-z]/g);
        if (tv1 && tv1.length > 6) {
          msg.push(`字段名称 ${f.displayName} 长度超过6个汉字`);
        }
        if (tv2 && tv2.length > 20) {
          msg.push(`字段名称 ${f.displayName} 长度超过20个字母`);
        }

        if (f.formType === 'select') {

          if (f.setting.dataSource.some(v => !v)) {
            msg.push(`字段名称 ${f.displayName} 包含有值为空的选项`);
          }

          for (let i = 0;i <= f.setting.dataSource.length;i++) {
            if (f.setting.dataSource.filter(item => item === f.setting.dataSource[i]).length > 1) {
              return msg.push(`字段名称 ${f.displayName} 包含有重复的选项`);
            }
          }
        }
      });

      return msg;
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

</style>
