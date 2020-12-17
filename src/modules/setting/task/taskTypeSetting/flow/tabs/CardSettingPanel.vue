<template>
  <div class="card-setting-container">
    <div class="card-setting-heard">
      <div class="card-setting-title">
        <p>附加组件设置</p>
        <el-button
          type="primary"
          icon="el-icon-plus"
          :loading="false"
          @click="addTaskCard"
          >新建</el-button
        >
      </div>
      <p class="card-setting-msg">
        附加组件是管理工单的辅助工具，您可以分类记录更新工单的信息，如需更多附加组件请在工单组件管理中添加
        <el-tooltip placement="top" popper-class="form-displaymode-setting-tooltip" >
          <div slot="content">
            <template>
              <div class="form-displaymode-setting-item">使用规则：设置每个附加组件在什么节点前必须完成填写，以及在什么状态时可以进行编辑</div>
              <div class="form-displaymode-setting-item">使用权限：默认可以查看到工单的用户都可以使用附加组件，如果只希望某些角色能查看修改，请修改下面的权限</div>
              <div class="form-displaymode-setting-item">类型：可以添加多次还是只能添加一次，由附加组件属性决定</div>
            </template>
          </div>
          <i class="iconfont icon-question"></i>
        </el-tooltip>
      </p>
    </div>
  </div>
</template>
<script>
export default {
  name: "card-setting-panel",
  data() {
    return {};
  },
  methods: {
    addTaskCard() {

    },
  },
};
</script>
<style lang="scss" scoped>
.card-setting-container {
  .card-setting-heard {
    font-weight: 500;
    color: #333333;
    font-size: 16px;
    background: #fff;
    padding: 16px 33px 20px 33px;
    .card-setting-title {
      display: flex;
      justify-content: space-between;
      line-height: 32px;
      p {
        margin-right: 16px;
        margin-bottom: 0;
      }
      button {
        width: 88px;
        height: 32px;
      }
    }
    .card-setting-msg {
      font-size: 12px;
      color: #666666;
      line-height: 20px;
    }
  }
}
</style>
