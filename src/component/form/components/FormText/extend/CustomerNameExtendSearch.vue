<template>
  <el-select
    :value="value"
    @input="choose"
    filterable
    remote
    reserve-keyword
    placeholder="请输入关键词搜索"
    clearable
    :loading="loading"
    :remote-method="searchCustomer">
    <el-option
      v-for="item in options"
      :key="item.id"
      :label="item.name"
      :value="item.id">
    </el-option>
  </el-select>

</template>

<script>
import FormMixin from '@src/component/form/mixin/form';
import {searchCustomer} from '@src/api/EcSearchApi.js';

export default {
  name: 'customer-search',
  mixins: [FormMixin],
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      options: [],
    };
  },
  methods: {
    choose(newValue){
      let oldValue = null;
      this.$emit('update', {newValue, oldValue, field: this.field});
    },
    searchCustomer(keyword) {
      this.loading = true;
      this.$http.get('/customer/getListAsyn', {keyword, pageNum: 1, })
        .then(res => {
          this.options = res.list;
          this.loading = false;
        })
        .catch(err => console.error('searchCustomerManager function catch err', err));
    },
  },
}
</script>

<style lang="scss">
  .el-select {
    width: 100%;
  }
</style>
