<template>
  <base-modal
    title="返回旧版"
    :show.sync="visible"
    width="500px"
    class="batch-editing-customer-dialog"
  >
    <div class="reason-panel">
      <div class="task-flex task-ai reason-panel-item">
        <div class="task-font14 task-flex task-ai">
          <span class="task-cef task-font24 reason-panel-item-required">*</span
          ><span>请选择原因：</span>
        </div>
        <el-select v-model="reason" placeholder="请选择">
          <el-option
            v-for="item in options"
            :key="item"
            :label="item"
            :value="item"
          >
          </el-option>
        </el-select>
      </div>

      <div class="task-flex task-mt24 reason-panel-item">
        <div class="task-font14">备注：</div>
        <el-input
          type="textarea"
          :rows="4"
          placeholder="请描述您觉得需要改进的地方，售后宝会持续优化。"
          v-model="remark"
        >
        </el-input>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="onSubmit">确 定</el-button>
    </div>
  </base-modal>
</template>
<script>
/**api */
import * as TaskApi from '@src/api/TaskApi.ts';
export default {
  name: "reason-panel",
  data() {
    return {
      visible: false, //弹框显示隐藏
      reason: "",
      remark: "",
      options: [
        "操作不习惯",
        "不怎么会用，还是喜欢用老版本",
        "新增功能用不上",
        "新版本有BUG，影响业务开展了",
        "其他",
      ],
    };
  },
  methods: {
    /*打开 */
    open() {
      this.visible = true;
    },
    /*隐藏 */
    hide() {
      this.visible = false;
    },

    async onSubmit() {
      const {reason, remark} = this
      if (!reason) {
        this.$platform.alert('请选择原因')
        return
      }
      await TaskApi.revertReason({reason, remark})
      this.hide()
      this.reason = ''
      this.remark = ''
      this.$emit('oldVersion')
    },
  },
};
</script>
<style lang="scss" scoped>
.reason-panel {
  width: 90%;
  margin: 25px auto;
  &-item {
    &-required {
      position: relative;
      top: 4px;
      left: -3px;
    }
    > div:first-child {
      width: 22%;
      text-align: right;
    }
  }
}
</style>
<style lang="scss">
.reason-panel {
  .el-select,
  .el-textarea {
    width: 70% !important;
  }
}
</style>