<template>
  <div class="task-detail-container" v-loading="loading">
    <!-- start 顶部操作区 -->
    <div class="task-detail-header">
      <div class="header-btns">
        <div class="flex-x box-12-t-b">
          <div class="is-delete" v-if="dataInfo.isDelete">已删除</div>
          <div class="flex-1 flex-x">
            <div class="product-name">
              {{(dataInfo.pathName && dataInfo.pathName.replace(new RegExp("/","g") ,' / ')) || ''}}
            </div>
          </div>
          <div class="flex-x" v-if="!dataInfo.isDelete">
            <div class="mar-l-28 flex-x cur-point" @click="dleteData">
              <i class="iconfont icon-shanchu1"></i>删除
            </div>
            <div class="mar-l-28 flex-x cur-point" @click="alterData">
              <i class="iconfont icon-bianji1"></i>编辑
            </div>
            <!-- <div class="mar-l-28 flex-x" @click="creatData">
              <el-button type="primary"
              ><i class="iconfont icon-add2"></i>产品</el-button
              >
            </div> -->
          </div>
        </div>
      </div>
      <div class="header-data"></div>
    </div>
    <!-- end 顶部操作区 -->

    <!-- start 工单详情折叠面板 -->
    <base-collapse
      class="task-detail-main-content"
      :show-collapse="showCollapse"
      :direction.sync="collapseDirection"
    >
      <!-- start 工单详情 -->
      <template slot="left">
        <div
          class="task-detail-main-content-left"
          v-show="collapseDirection != 'left'"
        >

          <el-tabs v-model="leftActiveTab">
            <el-tab-pane label="详细信息" name="product-view">
              <product-menu-view
                :fields="fields"
                :prop-data="dataInfo"
              ></product-menu-view>
            </el-tab-pane>

            <el-tab-pane :label="`动态信息(${statistics.recordCount || 0})` " name="record">
              <product-menu-info-record
                ref="producMmenuInfoRecord"
                :prop-data="dataInfo"
            /> </el-tab-pane
          ></el-tabs>
        </div>

        <div class="collapse-left" v-show="collapseDirection == 'left'">
          详细信息
        </div>
      </template>
      <!-- end 工单详情 -->

      <!-- start 附加组件 -->
      <template slot="right">
        <div
          class="task-detail-main-content-right"
          v-show="collapseDirection != 'right'"
        >
          <el-tabs v-model="rightActiveTab">
            <el-tab-pane label="备件" name="part">
              <mini-table
                :id="dataInfo.id"
                data-type="part"
                page-type="view"
              />
            </el-tab-pane>
            <el-tab-pane label="知识库" name="wiki">
              <mini-table
                :id="dataInfo.id"
                data-type="wiki"
                page-type="view"
              />
            </el-tab-pane>
            <el-tab-pane label="产品" name="product">
              <mini-table
                :id="dataInfo.id"
                data-type="product"
                page-type="view"
              />
            </el-tab-pane>
          </el-tabs>
        </div>
      </template>
      <!-- end 附加组件 -->
    </base-collapse>
    <!-- end 工单详情折叠面板 -->


    <!--  -->
    <!-- <public-dialog
      ref="publicDialog"
      :visible-prop="visibleProp"
      @changeVisibleProp="changeVisibleProp"
      @confirm="dialogConfirm"
      :dialog-type="dialogType"
      :init-data="childData"
    ></public-dialog> -->
    <!--  -->


  </div>
</template>

<script>
import ProductDetailView from './ProductDetailView';
export default ProductDetailView;
</script>

<style lang="scss">
@import './ProductDetailView.scss';
</style>

<style lang="scss">
.task-detail-container {
  .v-step[data-v-7c9c03f0] {
    background: #fff !important;
    color: #333 !important;
    -webkit-filter: drop-shadow(
      0px 9px 28px 8px rgba(0, 0, 0, 0.05)
    ) !important;
    filter: drop-shadow(0px 9px 28px 8px rgba(0, 0, 0, 0.05)) !important;
    padding: 0 !important;
    min-width: 240px !important;
    max-width: 350px !important;
  }

  .v-step .v-step__arrow[data-v-7c9c03f0] {
    border-color: #fff !important;
    border-left-color: transparent !important;
    border-right-color: transparent !important;
  }


  .guide-model-box {
    position: fixed;
    width: 100%;
    height: 100vh;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 996;
  }

  .guide-point {
    z-index: 997;
    position: sticky;
  }

  .bg-w {
    background: #fff;
  }

  .task-detail-step-2-box {
    position: absolute;
    top: 0;
    left: 208px;
    z-index: 997;

    .task-detail-step-2 {
      width: 104px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      top: 0;
      left: 0;
      position: absolute;
      background: transparent;
    }
  }
}
.header-btns {
  .iconfont {
    font-size: 14px;
    margin-right: 8px;
  }
  .product-img {
    width: 32px;
    height: 32px;
    margin-right: 12px;
  }
  .product-name {
    font-size: 16px;
    font-weight: 600;
  }
  .btn-box {
    .btn-item {
      &:not(:first-child) {
        margin-left: 12px;
      }
    }
  }
}
</style>
<style lang="scss" scoped>
.is-delete{
  background: $color-danger;
  color: #fff;
  padding: 3px 8px;
  border-radius: 4px;
  margin-right: 8px;
}
</style>
