<template>
  <div class="task-detail-container" v-loading="loading">
    <div class="guide-model-box" v-if="nowGuideStep < 5"></div>
    <!-- start 顶部操作区 -->
    <div class="task-detail-header">
      <div class="header-btns">
        <div class="flex-x box-12-t-b">
          <div class="flex-1 flex-x">
            <div class="product-name">
              {{dataInfo.pathName}}
            </div>
          </div>
          <div class="flex-x">
            <div class="mar-l-28 flex-x cur-point" @click="dleteData">
              <i class="iconfont icon-shanchu1"></i>删除
            </div>
            <div class="mar-l-28 flex-x cur-point" @click="alterData">
              <i class="iconfont icon-bianji1"></i>编辑
            </div>
            <div class="mar-l-28 flex-x" @click="creatData">
              <el-button type="primary"
              ><i class="iconfont icon-add1"></i>新建</el-button
              >
            </div>
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
          <div
            class="task-detail-step-2-box"
            :style="
              nowGuideStep == 3
                ? 'width: 104px;height: 40px;background:#fff'
                : ''
            "
            id="v-task-detail-step-2"
          >
            <div class="task-detail-step-2" v-if="nowGuideStep == 3">
              动态信息
              <div style="position: relative;">
                <div class="guide-disable-cover"></div>
              </div>
            </div>
          </div>

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

    <!-- tour s -->
    <v-tour
      v-if="1 == 2"
      name="myTour"
      :steps="detailSteps"
      :options="detailOptions"
      :callbacks="myCallbacks"
    >
      <template slot-scope="tour">
        <transition name="fade">
          <template v-for="(step, index) of tour.steps">
            <v-step
              v-if="tour.currentStep === index"
              :key="index"
              :step="step"
              :previous-step="tour.previousStep"
              :next-step="tour.nextStep"
              :stop="tour.stop"
              :is-first="tour.isFirst"
              :is-last="tour.isLast"
              :labels="tour.labels"
            >
              <template>
                <div slot="content" class="tour-content-box">
                  <div class="tour-left-tips">
                    {{ `${index + 1}/${detailSteps.length}` }}
                  </div>
                  <div class="tour-content">
                    <div class="flex-x tour-content-head">
                      {{ detailSteps[index].title }}
                    </div>
                    <div class="tour-content-con">
                      {{ detailSteps[index].content }}
                    </div>
                  </div>
                </div>
                <div slot="actions" class="tour-bottom">
                  <!-- <div class="text" v-if="index > 0" @click="tour.previousStep">
                    上一步
                  </div> -->
                  <div
                    class="btns"
                    v-if="index < detailSteps.length - 1"
                    @click="tour.nextStep"
                  >
                    下一步
                  </div>
                  <div
                    v-if="index == detailSteps.length - 1"
                    class="btns"
                    @click="tour.stop"
                  >
                    知道啦
                  </div>
                </div>
              </template>
            </v-step>
          </template>
        </transition>
      </template>
    </v-tour>
    <!-- tour e -->

  </div>
</template>

<script>
import ProductDetailView from "./ProductDetailView";
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

  .tour-content-box {
    position: relative;
    overflow: hidden;
    padding: 0 20px;
    border-radius: 4px;

    .tour-left-tips {
      width: 80px;
      height: 32px;
      background: $color-primary;
      color: #fff;
      position: absolute;
      left: -40px;
      top: 0px;
      line-height: 40px;
      font-size: 12px;
      transform-origin: center top;
      transform: rotateZ(-45deg);
      text-align: center;
    }

    .tour-content {
      .tour-content-head {
        padding-top: 32px;
        padding-bottom: 10px;

        .iconfont {
          font-size: 10px;
          margin-bottom: 2px;
          color: #999;
          cursor: pointer;
        }
      }

      .tour-content-con {
        text-align: start;
        padding-bottom: 12px;
        color: #666;
      }
    }
  }

  .tour-bottom {
    height: 52px;
    padding: 0 20px;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    .btns {
      width: 60px;
      height: 28px;
      background: $color-primary;
      color: #fff;
      text-align: center;
      line-height: 28px;
      border-radius: 4px;
    }

    .text {
      color: $color-primary;
    }

    :nth-child(n) {
      cursor: pointer;
    }

    :not(:last-child) {
      margin-right: 12px;
    }
  }

  /* 向上的箭头 */

  .normal-arrow-top {
    font-size: 0;
    line-height: 0;
    border-width: 0.5rem;
    border-color: #fff;
    width: 0;
    border-top-width: 0;
    border-style: dashed;
    border-bottom-style: solid;
    border-left-color: transparent;
    border-right-color: transparent;
    position: absolute;
    top: -0.5rem;
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
