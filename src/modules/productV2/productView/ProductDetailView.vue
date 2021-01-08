<template>
  <div class="task-detail-container"
       v-loading="loading">

    <div id="product-product-detail"></div>
    <div class="guide-model-box"
         v-if="nowGuideStep < 5"></div>
    <div class="task-detail-header">
      <div class="header-btns">
        <div class="flex-x box-12-t-b">
          <div class="is-delete"
               v-if="dataInfo.isDelete">已删除</div>
          <div class="flex-1 over-x-h">
            <div class="product-name overHideCon-1">
              {{ product.name }}
            </div>
            <div class="flex-x mar-t-8"
                 v-if="dataInfo && dataInfo.catalogId">
              产品类型:

              <div class="flex-1 ">
                <el-tooltip effect="dark"
                            :content="dataInfo.catalogPathName"
                            placement="bottom-start">
                  <div class="color-primary  mar-l-8 overHideCon-1">

                    <span @click="openProductMenuTab(dataInfo.catalogId)"
                          class="cur-point ">{{dataInfo.catalogPathName}}</span>

                  </div>
                </el-tooltip>
              </div>
            </div>
          </div>
          <div class="flex-x "
               v-if="!dataInfo.isDelete">
            <div class="flex-x"
                 v-if="!isDelete ">
              <div class="mar-l-30 flex-x"
                   v-if="allowCreateTask">
                <el-dropdown trigger="click">
                  <el-button type="primary"><i class="iconfont icon-add2"></i>工单</el-button>

                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-for="type in taskTypes"
                                      :key="type.id">
                      <a class="link-of-dropdown"
                         href="javascript:;"
                         @click.prevent="createTask(type.id)">{{type.name}}</a>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>

              </div>
              <div class="mar-l-8 flex-x"
                   v-if="allowCreateEvent">
                <el-dropdown trigger="click">
                  <el-button type="primary"><i class="iconfont icon-add2"></i>事件</el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-for="event in eventTypes"
                                      :key="event.id">
                      <a class="link-of-dropdown"
                         href="javascript:;"
                         @click.prevent="createEvent(event.id)">{{event.name}}</a>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>

              </div>
              <div class="mar-l-8 flex-x"
                   v-if="allowCreatePlanTask && isShowPlanTask">
                <el-dropdown trigger="click"
                             v-if="allowCreatePlanTask && isShowPlanTask">
                  <el-button type="primary"><i class="iconfont icon-add2"></i>计划任务</el-button>

                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-for="task in taskTypes"
                                      :key="task.id">
                      <a class="link-of-dropdown"
                         href="javascript:;"
                         @click.prevent="createPlanTask(task.id)">
                        {{ task.name }}
                      </a>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
              <div class="mar-l-8 flex-x"
                   v-if="!product.qrcodeId">
                <el-button type="primary"
                           @click="openPublicDialog('linkQrcode')"><i class="iconfont icon-add2"></i>关联二维码</el-button>
              </div>
            </div>
            <div class="fle-x mar-l-20">
              <el-tooltip v-if="product.qrcodeId"
                          :popper-options="popperOptions"
                          content="查看二维码"
                          placement="top">
                <i class="iconfont icon-qrcode cur-point font-18"
                   @click="leftActiveTab='qrcode-view'"></i>
              </el-tooltip>
              <el-tooltip :popper-options="popperOptions"
                          content="加提醒"
                          placement="top">
                <i class="iconfont icon-bell cur-point font-18"
                   @click="openRemindDialog('remind')"></i>
              </el-tooltip>

              <el-tooltip :popper-options="popperOptions"
                          content="删除产品"
                          placement="top">
                <i class="iconfont icon-delete cur-point font-18"
                   @click="deleteProduct"></i>
              </el-tooltip>
              <el-tooltip :popper-options="popperOptions"
                          content="编辑产品"
                          placement="top">
                <i class="iconfont icon-edit-square cur-point font-18"
                   @click="editProduct"></i>
              </el-tooltip>
            </div>
          </div>
        </div>
        <!-- <div class="btn-box flex-x flex-1 box-12-t-b">
          <div class="btn-item">
            <el-button
              icon="iconfont icon-notification"
              size="medium"
              @click="openRemindDialog('remind')"
              v-if="isShowCustomerRemind"
            >加提醒</el-button
            >
          </div>
          <div class="btn-item">
            <el-dropdown
              trigger="click"
              v-if="allowCreatePlanTask && isShowPlanTask"
            >
              <el-button size="medium"
              ><i class="iconfont icon-add1"></i>计划任务</el-button
              >

              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="task in taskTypes" :key="task.id">
                  <a
                    class="link-of-dropdown"
                    href="javascript:;"
                    @click.prevent="createPlanTask(task.id)"
                  >
                    {{ task.name }}
                  </a>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <div class="btn-item" size="medium">
            <el-button>关联二维码</el-button>
          </div>
          <div class="btn-item" size="medium">
            <el-button>查看二维码</el-button>
          </div>
        </div> -->
      </div>
      <div class="header-data"></div>
    </div>
    <!-- end 顶部操作区 -->

    <!-- start 工单详情折叠面板 -->
    <base-collapse class="task-detail-main-content"
                   :show-collapse="showCollapse"
                   :direction.sync="collapseDirection">
      <!-- start 工单详情 -->
      <template slot="left">
        <div class="task-detail-main-content-left"
             v-show="collapseDirection != 'left'">
          <div class="task-detail-step-2-box"
               :style="
                 nowGuideStep == 3
                   ? 'width: 104px;height: 40px;background:#fff'
                   : ''
               "
               id="v-task-detail-step-2">
            <div class="task-detail-step-2"
                 v-if="nowGuideStep == 3">
              动态信息
              <div style="position: relative;">
                <div class="guide-disable-cover"></div>
              </div>
            </div>
          </div>

          <el-tabs v-model="leftActiveTab"
                   id="product-product-detail-1">
            <el-tab-pane label="详细信息"
                         name="product-view">
              <form-view :fields="fields"
                         :value="product"
                         class="task-tab-container task-view-containner">
                <div slot="name"></div>
                <template slot="customer"
                          slot-scope="{ value }">
                  <div class="form-view-row"
                       v-if="value">
                    <label>客户</label>
                    <div class="form-view-row-content link"
                         @click="openCustomer">
                      {{ product.customerName }}
                    </div>
                  </div>
                  <div class="form-view-row"
                       v-if="value && hasLinkman">
                    <label>联系人</label>
                    <div class="form-view-row-content">
                      {{
                        product.linkman &&
                          product.linkman.name + ' ' + product.linkman.phone
                      }}
                    </div>
                  </div>
                  <form-address-view v-if="value && hasAddress"
                                     :field="{ displayName: '地址' }"
                                     :value="product.address">
                  </form-address-view>
                </template>

                <div slot="qrcodeId"
                     slot-scope="{ value }">
                     <!-- <div class="form-view-row">
                    <label>产品二维码</label>
                    <div class="form-view-row-content" v-show="value">
                      <span>{{ value }}</span>
                      <div ref="qrcode" style="margin: 10px 0;"></div>
                      <a
                        href="javascript:;"
                        class="link"
                        @click="openDownloadCodeDialog"
                      >下载</a
                      >
                      <a
                        href="javascript:;"
                        class="link"
                        @click="unbindQrcodeFromProduct"
                      >删除</a
                      >
                    </div>
                    <div class="form-view-row-content" v-show="!value">
                      <a
                        href="javascript:;"
                        class="link"
                        @click="openPublicDialog('linkQrcode')"
                      >关联二维码</a
                      >
                    </div>
                  </div> -->
                </div>
                <div slot="catalogId">
                </div>

                <template slot="createTime"
                          slot-scope="{ value }">
                  <div class="form-view-row"
                       v-if="value">
                    <label>创建时间</label>
                    <div class="form-view-row-content">
                      <span>{{ value | fmt_datetime }}</span>
                    </div>
                  </div>
                </template>
              </form-view>
            </el-tab-pane>
            <el-tab-pane label="产品类型"
                         name="catalog-view">
              <div class="flex-x jus-center"
                   v-if="dataInfo && !dataInfo.catalogId">
                <div class="flex-y al-center">
                  <img src="@src/assets/img/productV2/catalogNone.png"
                       class="size-160 mar-t-50 mar-b-8"
                       alt="">
                  <div class="mar-b-12">暂未关联产品类型</div>
                  <el-button @click="openPublicDialog('linkCatalog')">关联产品类型</el-button>
                </div>
              </div>

              <template v-show="dataInfo && dataInfo.catalogId">
                <catalog-view ref="catalogView"
                              :prop-data="{id:dataInfo.catalogId}" />
              </template>
            </el-tab-pane>
            <el-tab-pane label="产品二维码"
                         name="qrcode-view">
              <div class="flex-x jus-center"
                   v-if="!dataInfo.qrcodeId">
                <div class="flex-y al-center">
                  <img src="@src/assets/img/productV2/qrcodeNone.png"
                       class="size-160 mar-t-50 mar-b-8"
                       alt="">
                  <div class="mar-b-12">暂未关联产品二维码</div>
                  <el-button @click="openPublicDialog('linkQrcode')">关联产品二维码</el-button>
                </div>
              </div>

              <template v-else>
                <div class="box-12">
                  <div class="form-view-row">
                    <label>产品二维码</label>
                    <div class="form-view-row-content "
                         v-show="dataInfo && dataInfo.qrcodeId">
                      <span>{{ dataInfo.qrcodeId }}</span>
                      <div class="qrcodeBtn">
                        <div ref="qrcode"
                             style="margin: 10px 0;"></div>
                        <div class="flex-x jus-bet">
                          <el-button @click="openDownloadCodeDialog">下载</el-button>

                          <el-button type="danger"
                                     @click="unbindQrcodeFromProduct">删除</el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </el-tab-pane>

          </el-tabs>
        </div>

        <div class="collapse-left"
             v-show="collapseDirection == 'left'">
          详细信息
        </div>
      </template>
      <!-- end 工单详情 -->

      <!-- start 附加组件 -->
      <template slot="right">
        <div class="task-detail-main-content-right"
             v-show="collapseDirection != 'right'">
          <el-tabs v-model="rightActiveTab">
            <el-tab-pane :label="`信息动态(${statisticalData.recordQuantity || 0})`"
                         name="info-record">
              <info-record ref="producInfoRecord"
                           :share-data="propsForSubComponents" />
            </el-tab-pane>
            <el-tab-pane :label="
                           statisticalData.taskQuantity
                             ? `工单(${statisticalData.unfinishedTaskQuantity || 0}/${
                               statisticalData.taskQuantity >= 1000
                                 ? '999+'
                                 : statisticalData.taskQuantity
                             })`
                             : '工单(0)'
                         "
                         name="task-table"
                         v-if="this.isShowCustomerRemind">
              <task-table :share-data="propsForSubComponents"></task-table>
            </el-tab-pane>
            <el-tab-pane :label="
                           statisticalData.eventQuantity
                             ? `事件(${statisticalData.unfinishedEventQuantity || 0}/${
                               statisticalData.eventQuantity >= 1000
                                 ? '999+'
                                 : statisticalData.eventQuantity
                             })`
                             : '事件(0)'
                         "
                         name="event-table"
                         v-if="this.isShowCustomerRemind">
              <event-table :share-data="propsForSubComponents"></event-table>
            </el-tab-pane>
            <el-tab-pane :label="`计划任务(${statisticalData.plantaskQuantity || 0})`"
                         name="plan-table"
                         v-if="this.allowCreatePlanTask && this.isShowPlanTask">
              <plan-table :share-data="propsForSubComponents"></plan-table>
            </el-tab-pane>
            <el-tab-pane :label="`产品提醒(${statisticalData.remindQuantity || 0})`"
                         name="remind-table"
                         v-if="this.isShowCustomerRemind">
              <remind-table :share-data="propsForSubComponents"></remind-table>
            </el-tab-pane>
          </el-tabs>
        </div>
      </template>
      <!-- end 附加组件 -->
    </base-collapse>
    <!-- end 工单详情折叠面板 -->

    <remind-dialog ref="addRemindDialog"
                   :product="product"></remind-dialog>
    <public-dialog :product-id="product.id"
                   :dialog-type="dialogType"
                   @dialogBind="dialogBind"
                   ref="publicDialog" />
    <download-code :code-data="downloadCodeData"
                   ref="downloadCodeDialog"></download-code>

 
  </div>
</template>

<script>
import ProductDetailView from './ProductDetailView';
export default ProductDetailView;
</script>

<style lang="scss">
@import "./ProductDetailView.scss";
</style>
<style lang="scss" scoped>
.task-detail-header {
  padding: 0;
  .header-btns {
    padding: 0 12px;
    background: #fafafa;
  }
  .header-data {
    padding: 0 12px;
  }
}
.task-detail-btn-group {
  position: absolute;
  right: 12px;
  top: 8px;

  font-size: 0;
  z-index: 995;

  .iconfont {
    margin-left: 16px;
    color: $text-color-secondary;
    cursor: pointer;

    &.icon-bianji1 {
      color: $color-primary;
    }

    &.icon-shanchu-copy {
      margin-left: 13px;
    }
  }
}

.task-detail-btn-group-point {
  z-index: 997;
  background: #fff;
}
.is-delete {
  background: $color-danger;
  color: #fff;
  padding: 3px 8px;
  border-radius: 4px;
  margin-right: 8px;
}
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

.qrcodeBtn {
  width: 250px;
}
</style>
