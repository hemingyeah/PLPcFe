<template>
  <el-select
    class="user-search"
    :value="value"
    @input="choose"
    filterable
    remote
    reserve-keyword
    :placeholder="field.placeHolder ? field.placeHolder : '请输入关键词搜索'"
    :clearable="field.clearable ? field.clearable : false"
    :loading="loading"
    :remote-method="searchLinkman"
  >
    <el-option
      v-for="item in options"
      :key="item.id"
      :label="item.name"
      :value="field.returnData ? item[field.returnData] : item.id"
    ></el-option>
  </el-select>
</template>

<script>
import _ from "lodash";
import FormMixin from "@src/component/form/mixin/form";

export default {
  name: "linkman-search",
  mixins: [FormMixin],
  props: {
    value: {
      type: String,
      default: "",
    },
    userList: {
      type: Array,
      default: () => [],
    },
  },
  watch: {
    /*判断是否自定义视图进来的 */
    userList(v) {
      if (Array.isArray(v) && v.length) {
        this.options = v;
      }
    },
  },
  data() {
    return {
      loading: false,
      options: [],
    };
  },
  created() {
    let options = sessionStorage.getItem(`${this.field.fieldName}_options`);

    if (Array.isArray(this.userList) && this.userList.length) {
      this.options = this.userList;
    } else {
      this.options = JSON.parse(options || "[]");
    }
  },
  methods: {
    choose(newValue) {
      let oldValue = null;
      this.$emit("update", { newValue, oldValue, field: this.field });
    },
    searchLinkman: _.debounce(function (keyword) {
      this.loading = true;
      this.$emit("input", { keyword, field: this.field });
      this.$http
        .get("/api/elasticsearch/outside/es/linkman/list", {
          keyword,
          pageNum: 1,
        })
        .then((res) => {
          let result = res.result || {};
          // 创建人字段
          if (this.field.fieldName === "createUser" && res.list.length > 0) {
            result = res;
            result.list.map((res) => {
              res["id"] = res.userId;
              res["name"] = res.displayName;
              return res;
            });
          }
          this.options = result.list || [];

          this.loading = false;
          sessionStorage.setItem(
            `${this.field.fieldName}_options`,
            JSON.stringify(this.options)
          );
        })
        .catch((err) =>
          console.error("searchLinkmanManager function catch err", err)
        );
    }, 1000),
  },
};
</script>

<style lang="scss">
.user-search {
  width: 100%;
}
</style>
