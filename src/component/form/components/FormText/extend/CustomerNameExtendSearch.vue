<template>
  <el-select
    class="user-search"
    :value="value"
    @input="choose"
    filterable
    remote
    reserve-keyword
    :placeholder="field.placeHolder?field.placeHolder:'请输入关键词搜索'"
    :disabled="field.disabled?field.disabled:false"
    clearable
    :loading="loading"
    :remote-method="searchCustomer"
  >
    <el-option v-for="item in options" :key="item.id" :label="item.name" :value="item.id"></el-option>
  </el-select>
</template>

<script>
import * as CustomerApi from '@src/api/CustomerApi';
import FormMixin from "@src/component/form/mixin/form";

export default {
  name: "customer-search",
  mixins: [FormMixin],
  props: {
    value: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      loading: false,
      options: []
    };
  },
  created() {
    let options = sessionStorage.getItem(`${this.field.fieldName}_options`);

    this.options = JSON.parse(options || "[]");
  },
  methods: {
    choose(newValue) {
      let oldValue = null;
      this.$emit("update", { newValue, oldValue, field: this.field });
    },
    searchCustomer(keyword) {
      this.loading = true;
      CustomerApi.getCustomerListAsyn({ keyword, pageNum: 1 })
        .then(res => {
          this.options = res.list;
          this.loading = false;
          sessionStorage.setItem(
            `${this.field.fieldName}_options`,
            JSON.stringify(this.options)
          );
        })
        .catch(err =>
          console.error("searchCustomerManager function catch err", err)
        );
    }
  }
};
</script>

<style lang="scss">
.user-search {
  width: 100%;
}
</style>
