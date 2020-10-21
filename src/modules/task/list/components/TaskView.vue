
<template>
  <base-modal
    title="快捷查询条件"
    :show.sync="visible"
    width="500px"
    class="batch-editing-customer-dialog"
  >
    <div class="task-content">
      <p v-for="(item, index) in searchModelCN" :key="index">
        {{ item }}
      </p>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">关闭</el-button>
    </div>
  </base-modal>
</template>
<script>
/* Api */
import * as TaskApi from "@src/api/TaskApi.ts";

export default {
  name: "task-view",
  data() {
    return {
      info: "",
      visible: false,
      searchModelCN: [],
    };
  },
  methods: {
    async open(viewId, type) {
      this.searchModelCN = [];
      let searchModel = [];
      const { success, result } = await TaskApi.getOneView(viewId);
      if (type) {
        this.visible = true;
      } else {
        for (let key in result.searchModelCN) {
          searchModel.push({
            displayNmae: key,
            value: `${result.searchModelCN[key]}`,
          });
        }
        this.$emit("_searchModel", searchModel);
      }
      if (success) {
        for (let key in result.searchModelCN) {
          this.searchModelCN.push(`${key}：${result.searchModelCN[key]}`);
        }
      }
    },
  },
};
</script>
<style lang="scss" scoped>
</style>