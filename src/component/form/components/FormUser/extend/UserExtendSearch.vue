<template>
  <el-select
    class="user-search"
    :value="value"
    @input="choose"
    filterable
    remote
    reserve-keyword
    :placeholder="field.placeHolder?field.placeHolder:'请输入关键词搜索'"
    :clearable="field.noClearable?false:true"
    :loading="loading"
    :remote-method="searchUser"
  >
    <el-option
      v-for="item in options"
      :key="item.id"
      :label="item.name"
      :value="field.returnData?item[field.returnData]:item.id"
    ></el-option>
  </el-select>
</template>

<script>
import FormMixin from "@src/component/form/mixin/form";

export default {
  name: "user-search",
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
    searchUser(keyword) {
      this.loading = true;
      this.$emit("input", { keyword, field: this.field });
      this.$http
        .get("/customer/userTag/list", { keyword, pageNum: 1 })
        .then(res => {
          this.options = res.list.map(({ displayName, userId }) =>
            Object.freeze({
              name: displayName,
              id: userId
            })
          );

          sessionStorage.setItem(
            `${this.field.fieldName}_options`,
            JSON.stringify(this.options)
          );
          this.loading = false;
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
