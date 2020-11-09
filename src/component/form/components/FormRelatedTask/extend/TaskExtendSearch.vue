<template>
  <el-select
    class="task-search"
    :value="value"
    @input="choose"
    filterable
    remote
    reserve-keyword
    :placeholder="field.placeHolder?field.placeHolder:'请输入关键词搜索'"
    :disabled="field.disabled?field.disabled:false"
    clearable
    :loading="loading"
    :remote-method="searchTask"
  >
    <el-option v-for="item in options" :key="item.taskNo" :label="item.taskNo" :value="item.taskNo"></el-option>
  </el-select>
</template>

<script>
import * as TaskApi from '@src/api/TaskApi';
import FormMixin from "@src/component/form/mixin/form";

export default {
  name: "task-search",
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
    searchTask(keyword) {
      this.loading = true;
      TaskApi.search({ keyword, pageNum: 1 })
        .then(res => {
          this.options = res.result.content;
          this.loading = false;
          sessionStorage.setItem(
            `${this.field.fieldName}_options`,
            JSON.stringify(this.options)
          );
        })
        .catch(err =>
          console.error("searchTaskManager function catch err", err)
        );
    }
  }
};
</script>

<style lang="scss">
.task-search {
  width: 100%;
}
</style>
