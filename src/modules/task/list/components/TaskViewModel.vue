<template>
  <base-modal title="视图" :show.sync="visible" width="500px">
    <div class="view-modal">
      <!-- 视图名称 -->
      <div class="view-modal-name">
        视图名称
        <input
          type="text"
          name=""
          id=""
          maxlength="6"
          v-model="view.viewName"
        />
      </div>
      <!-- 按钮 -->
      <div class="view-modal-button">
        <el-checkbox v-model="checked">全员可见</el-checkbox>
        <base-button type="danger" @event="deleteViewBtn" v-show="isViewModel !== '默认'"
          >删除视图</base-button
        >
        <base-button type="primary" @event="saveViewBtn">保存</base-button>
      </div>
    </div>
  </base-modal>
</template>
<script>
/* Api */
import * as TaskApi from "@src/api/TaskApi.ts";

export default {
  name: "view-model",
  props: {
    region: {
      type: Object, //保存参数
    },
    isViewModel: {
      type: String, //判断是否保存过
    },
    otherText: {
      type: String, //视图文案
    },
  },
  watch: {
    otherText(v) {
      if (this.isViewModel !== "默认") {
        this.view.viewName = v;
      } else {
        this.view.viewName = "";
      }
    },
  },
  data() {
    return {
      visible: false, //存为视图显示
      checked: false,
      view: {
        viewName: "",
        viewRegion: "",
      },
    };
  },
  methods: {
    /**
     * @description 保存视图 and 编辑视图
     */
    saveViewBtn() {
      const { view, region, checked, isViewModel } = this;

      view.viewRegion = checked ? "所有用户" : "只有我";

      const params = {
        ...view,
        ...region,
      };
      const fromId = window.frameElement.getAttribute("id");

      // 编辑
      if (isViewModel !== "默认") {
        TaskApi.editView(params).then((res) => {
          this.success(res);
        });
        return;
      }
      // 保存
      TaskApi.createView(params).then((res) => {
        this.success(res);
      });
    },
    // 删除
    deleteViewBtn() {
      TaskApi.deleteView({ viewId: this.region.editViewId }).then((res) => {
        this.success(res, "del");
      });
    },
    // 成功后的操作
    success({ status, message }, type) {
      if (status === 0) {
        if (type === "del") {
          this.$platform.alert("删除成功");
        } else {
          this.$platform.alert("保存成功");
        }
        this.$platform.refreshTab(fromId);
      } else {
        this.$platform.alert(message);
      }
    },
    open() {
      this.visible = true;
    },
  },
};
</script>
<style lang="scss" scoped>
// S 存为视图弹框
.view-modal {
  font-size: 12px;
  height: 105px;
  padding: 0px 118px;
  &-name {
    padding: 14px 0;
    display: flex;
    align-items: center;
    input {
      width: 170px;
      height: 28px;
      border-radius: 0;
      padding: 4px 6px;
      border-color: #d2d6de;
      margin-left: 30px;
      flex: 1;
      &:focus {
        border-color: #3c8dbc;
      }
      &:hover {
        border-color: #a2d7d6;
      }
    }
  }
  &-button {
    display: flex;
    align-items: center;
    position: relative;
    margin-left: -22px;
    button {
      padding: 6px 15px;
      &:last-child {
        width: 75px;
        position: absolute;
        right: 0;
      }
    }
  }
}
// E 存为视图弹框
</style>
<style lang="scss">
.view-modal .el-checkbox__label {
  font-size: 12px;
  font-weight: normal;
  color: #333;
}
</style>
