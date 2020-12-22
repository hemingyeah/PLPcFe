<template>
  <div class="abnormal">
    <!-- 顶部选者 -->
    <header-select @update="update" @excutorName="excutorName" @ceratTime="ceratTime" />
    <!-- 饼图 -->
    <div class="abnormal-piechart task-mb10">
      <h3>工单异常节点统计</h3>
      <div id="piechart" ref="piechart"></div>
      <div class="abnormal-ant" v-show="pieTabList.length">
        <base-button
          type="primary"
          native-type="submit"
          @event="chartTotal"
        >导出</base-button>
        <base-button
          type="primary"
          native-type="submit"
          class="task-ml4"
          @event="chartTotal('all')"
        >导出全部</base-button>  
        <base-button
          type="primary"
          native-type="submit"
          class="task-ml4"
          @event="pieTabList = []"
        >收起</base-button>               
            
      </div>
      <!-- table -->
      <div class="task-mt12" v-show="pieTabList.length">
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
            <template slot-scope="scope">
              <template v-if="Array.isArray(scope.row[item.fieldName])">
                {{scope.row[item.fieldName].join('、')}}
              </template>
              <template v-else-if="item.fieldName === 'taskNo'">
                <a
                  href=""
                  class="view-detail-btn task-list-numbering"
                  @click.stop.prevent="
                    openTaskTab(scope.row.taskId, scope.row[item.fieldName])
                  "
                >{{scope.row[item.fieldName]}}</a>
              </template>
              <template v-else-if="item.fieldName === 'action'">
                {{abText([scope.row[item.fieldName]])}}
              </template>
              <template v-else-if="item.fieldName === 'createTime'">{{scope.row.timeName}}</template>
              <template v-else>{{scope.row[item.fieldName]}}</template>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <div class="spare-parts-foot task-flex task-ai task-mt12">
          <div class="task-span1"></div>

          <el-pagination
            class="comment-list-table-footer-pagination"
            background
            :page-sizes="[10, 20, 50]"
            :page-size="PiePageParams.pageSize"
            :total="Pietotal"
            :current-page="PiePageParams.page"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
            layout="prev, pager, next, sizes, jumper"
          >
          </el-pagination>
        </div>
      </div>
    </div>


    <header-select @update="update" @excutorName="excutorName" @ceratTime="ceratTime" columnar="columnar" />
    <!-- 柱状图 -->
    <div class="abnormal-piechart">
      <h3>工单异常原因统计</h3>
      <div class="abnormal-tab task-flex task-ai">
        <div v-for="(item, index) in taskCustomExceptionNodeList" :key="index" @click="TabSwitch(item.englishName)" :class="{'active': checkTab === item.englishName}">{{item.exceptionName}}</div>
      </div>
      <div id="columnar" ref="columnar"></div>
      <div class="abnormal-ant" v-show="columnarTabList.length">
        <base-button
          type="primary"
          native-type="submit"
          @event="histogramTotal"
        >导出</base-button>
        <base-button
          type="primary"
          native-type="submit"
          class="task-ml4"
          @event="histogramTotal('all')"
        >导出全部</base-button>  
        <base-button
          type="primary"
          native-type="submit"
          class="task-ml4"
          @event="columnarTabList = []"
        >收起</base-button>               
            
      </div>
      <!-- table -->
      <div class="task-mt12" v-show="columnarTabList.length">
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
            <template slot-scope="scope">
              <template v-if="Array.isArray(scope.row[item.fieldName])">
                {{scope.row[item.fieldName].join('、')}}
              </template>
              <template v-else-if="item.fieldName === 'action'">
                {{abText(scope.row.actionNameList)}}
              </template>
              <template v-else-if="item.fieldName === 'createTime'">{{scope.row.timeName}}</template>
              <template v-else>{{scope.row[item.fieldName]}}</template>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="spare-parts-foot task-flex task-ai task-mt12">
          <div class="task-span1"></div>

          <el-pagination
            class="comment-list-table-footer-pagination"
            background
            :page-sizes="[10, 20, 50]"
            :page-size="curPageParams.pageSize"
            :total="curtotal"
            :current-page="curPageParams.page"
            @current-change="CurhandlePageChange"
            @size-change="CurhandleSizeChange"
            layout="prev, pager, next, sizes, jumper"
          >
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Abnormal from './abnormal';
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
  &-tab {
    justify-content: center;
    cursor: pointer;
    >div {
      height: 34px;
      padding: 10px 24px;
      color: #666;
      background-color: #ccc;
      padding-top: 8px;
    }
    .active {
      background-color: #13C2C2;
      color: #fff;
    }
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