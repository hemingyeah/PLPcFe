<template>
  <div class="base-setting-container">
    <h2>绩效报告选项设置</h2>

    <div class="setting-item">
      <p class="setting-title">
        设置绩效报告审核人

        <el-popover
          placement="top-start"
          trigger="hover"
          content="具备运营分析权限的用户才可以被设置为审核人">
          <span style="vertical-align: middle" slot="reference">
            <i class="icon-help iconfont" style="margin-left: 3px;"></i>
          </span>
        </el-popover>

      </p>
      <div class="content">
        <el-select v-model="form.approve" clearable placeholder="请选择">
          <el-option :value="null" label="全部"></el-option>
          <el-option :value="1" label="有"></el-option>
          <el-option :value="0" label="无"></el-option>
        </el-select>
        <el-button type="primary">保存</el-button>
      </div>
    </div>


    <div class="setting-item">
      <p class="setting-title">绩效报告抄送选项</p>
      <div class="content">
        绩效报告完成审核后，向抄送人发送绩效报告
        <el-switch v-model="form.cc"></el-switch>
      </div>
    </div>


  </div>
</template>

<script>
export default {
  name: 'base-setting',
  data() {
    return {
      form: {
        approve: '',
        cc: ''
      }
    }
  },
  mounted() {
  },
  methods: {},
}
</script>

<style lang="scss">

  .base-setting-container {
    background: #fff;
    margin-bottom: 10px;
    padding: 10px;

    h2 {
      line-height: 30px;
      border-bottom: 1px solid #ddd;
      font-size: 15px;
      margin-bottom: 10px;
    }

    .setting-item {
      padding-left: 15px;
      line-height: 30px;

      .setting-title {
        font-size: 14px;
        font-weight: 700;
        margin: 0;
      }


      .content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
      }


    }

  }
</style>