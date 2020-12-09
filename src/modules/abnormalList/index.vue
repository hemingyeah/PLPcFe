<template>
  <div class="abnormal">
    <!-- 顶部选者 -->
    <header-select />
    <!-- 饼图 -->
    <div class="abnormal-piechart task-mb10">
      <h3>工单异常节点统计</h3>
      <div id="piechart" ref="piechart"></div>
      <div class="abnormal-ant">
        <base-button
          type="primary"
          native-type="submit"
        >导出</base-button>
        <base-button
          type="primary"
          native-type="submit"
          class="task-ml4"
        >导出全部</base-button>  
        <base-button
          type="primary"
          native-type="submit"
          class="task-ml4"
        >收起</base-button>               
            
      </div>
      <!-- table -->
      <div class="task-mt12">
        <el-table
          stripe
          border
          :data="pieTabList"
          ref="multipleTable"
          header-row-class-name="common-list-table-header taks-list-table-header"
        >
          <el-table-column
            v-for="(item, index) in tableNames"
            :key="index"
            :label="item.displayName"
          >
          </el-table-column>
        </el-table>
      </div>
    </div>


    <header-select />
    <!-- 柱状图 -->
    <div class="abnormal-piechart">
      <h3>工单异常原因统计</h3>
      <div id="columnar" ref="columnar"></div>
      <div class="abnormal-ant">
        <base-button
          type="primary"
          native-type="submit"
        >导出</base-button>
        <base-button
          type="primary"
          native-type="submit"
          class="task-ml4"
        >导出全部</base-button>  
        <base-button
          type="primary"
          native-type="submit"
          class="task-ml4"
        >收起</base-button>               
            
      </div>
      <!-- table -->
      <div class="task-mt12">
        <el-table
          stripe
          border
          :data="columnarTabList"
          ref="multipleTable"
          header-row-class-name="common-list-table-header taks-list-table-header"
        >
          <el-table-column
            v-for="(item, index) in tableNames"
            :key="index"
            :label="item.displayName"
          >
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>
<script>
import Abnormal from "./abnormal";
export default Abnormal;
</script>
<style lang="scss" scoped>
.abnormal{
  padding: 10px;
  &-piechart {
    background-color:#fff;
    padding: 20px 30px;
    border-radius: 4px;
    margin-top: 10px;
  }
  .abnormal-ant {
    display: flex;
    justify-content: flex-end;
  }
}


#piechart, #columnar {
  width: 100%;
  height: 400px;
  margin-top: 100px;
}
h3 {
  font-weight: normal;
}
</style>