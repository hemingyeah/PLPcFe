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
          maxlength="20"
          v-model="view.viewName"
          placeholder="请输入视图名称"
        />
      </div>
      <!-- 按钮 -->
      <el-checkbox v-model="checked">全员可见</el-checkbox>
      <div class="task-flex task-ai task-jend">
          <el-button type="danger" @click="deleteViewBtn" v-show="isViewModel !== '默认'">删除视图</el-button>
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" @click="saveViewBtn"
          >保存</el-button>
      </div>
    </div>
  </base-modal>
</template>
<script>
/* Api */
import * as TaskApi from "@src/api/TaskApi.ts";
import { formatDate } from "@src/util/lang";

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
      if (!view.viewName) {
        this.$platform.alert("请输入视图名称");
        return
      }
      view.viewRegion = checked ? "所有用户" : "只有我";
      const params = {
        ...view,
        ...region,
      };
      // 编辑
      if (isViewModel !== "默认") {
        TaskApi.editView(params).then((res) => {
          this.success(res);
        });
        return;
      }
      let searchModel = region.searchModel
      // 创建时间
      searchModel['timeStart'] = this._time(searchModel.createTimeStart)
      searchModel['timeEnd'] = this._time(searchModel.createTimeEnd)
      // 计划时间
      searchModel.planTimeStart = this._time(searchModel.planTimeStart)
      searchModel.planTimeEnd = this._time(searchModel.planTimeEnd)
      //派单时间
      searchModel.allotTimeStart = this._time(searchModel.allotTimeStart)
      searchModel.allotTimeEnd = this._time(searchModel.allotTimeEnd)
      //派单时间
      searchModel.acceptTimeStart = this._time(searchModel.acceptTimeStart)
      searchModel.acceptTimeEnd = this._time(searchModel.acceptTimeEnd)
      //派单时间
      searchModel.startTimeStart = this._time(searchModel.startTimeStart)
      searchModel.startTimeEnd = this._time(searchModel.startTimeEnd)
      //完成时间
      searchModel.completeTimeStart = this._time(searchModel.completeTimeStart)
      searchModel.completeTimeEnd = this._time(searchModel.completeTimeEnd)
      //更新时间
      searchModel.updateTimeStart = this._time(searchModel.updateTimeStart)
      searchModel.updateTimeEnd = this._time(searchModel.updateTimeEnd)
      //
      searchModel.reviewTimeStart = this._time(searchModel.reviewTimeStart)
      searchModel.reviewTimeEnd = this._time(searchModel.reviewTimeEnd)
      //
      searchModel.balanceTimeStart = this._time(searchModel.balanceTimeStart)
      searchModel.balanceTimeEnd = this._time(searchModel.balanceTimeEnd)
      //
      searchModel.closeTimeStart = this._time(searchModel.closeTimeStart)
      searchModel.closeTimeEnd = this._time(searchModel.closeTimeEnd)
      // 保存
      TaskApi.createView({
        ...view,
        searchModel,
        selectedCols: region.selectedCols
      }).then((res) => {
        this.success(res);
      });
    },
    _time(time) {
      return time ? formatDate(time) : ''
    },
    // 删除
    deleteViewBtn() {
      TaskApi.deleteView(this.region.viewId).then((res) => {
        this.success(res, "del");
      });
    },
    // 成功后的操作
    success({ success, message }, type) {
      window.__exports__refresh = ''
      if (success) {
        this.visible = false;
        const fromId = window.frameElement.getAttribute("id");
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
  padding: 20px 118px;
  &-name {
    padding: 5px 0;
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
