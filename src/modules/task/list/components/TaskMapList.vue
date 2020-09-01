<template>
  <div
    class="task-map-body-workSide-body task-span1"
    :style="`height: ${mapHeight - 170}px`"
  >
    <div class="task-flex task-map-body-workSide-body-item">
      <div class="task-map-body-workSide-body-item-index">1</div>
      <div class="task-span1">
        <p>工单编号: <span>TMZ16120080001</span></p>
        <p>工单类型: 大西瓜</p>
        <p>客户姓名: 绩效报告</p>
        <p>电话: 1234567</p>
        <p>地址: 山东省青岛市市北区</p>
        <p>创建时间: 2020-08-01 18:52:14</p>
      </div>
      <div class="task-map-body-workSide-body-item-info">
        <el-tooltip
          content="只能处理已指派、已接受、进行中且没有处于暂停或审批状态的工单"
          placement="top"
        >
          <i class="iconfont icon-info task-font24"></i>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "task-map-list",
  props: {
    mapHeight: {
      type: Number,
      default: 0,
    },
  },
};
</script>
<style lang="scss" scoped>
.task-map {
  &-body {
    margin-top: 10px;
    position: relative;
    overflow: hidden;
    &-workSide {
      width: 282px;
      position: absolute;
      top: 0px;
      right: 0;
      border-left: 1px solid #e5e5e5;
      background-color: #fff;
      z-index: 9;
      &-header {
        height: 50px;
        padding: 0 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgb(204, 204, 204);
        font-size: 16px;
        font-weight: 700;
      }
      &-body {
        overflow: hidden;
        overflow-y: scroll;
        background-color: #fff;
        color: #a0a0a0;
        font-size: 13px;
        &-item {
          padding: 10px;
          border-bottom: 1px dotted #ccc;
          &-info {
            margin-top: -5px;
          }
          &-index {
            background: url("../../../../assets/img/task/16-16.png") no-repeat 0 -65px;
            width: 24px;
            height: 30px;
            margin-right: 10px;
            line-height: 24px;
            text-align: center;
            color: #fff;
            font-family: tahoma;
            font-size: 12px;
            font-weight: bold;
          }
          p {
            margin-bottom: 5px;
            font-weight: normal;
          }
        }
        span {
          color: #3c8dbc;
        }
      }
      .fold_btn {
        position: absolute;
        top: 50%;
        left: -22px;
        margin-top: -22px;
        z-index: 10;
        background-color: #fff;
        width: 22px;
        height: 43px;
        line-height: 43px;
        padding-left: 5px;
        > i {
          font-size: 12px;
          color: #6666;
          font-weight: 600;
        }
      }
    }
  }
}
</style>
