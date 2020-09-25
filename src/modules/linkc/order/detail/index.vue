<template>
  <div class="my-shop-box" v-loading.fullscreen.lock="fullscreenLoading">
    <!-- info-box start -->
    <div class="info-box">
      <!-- status-box start -->
      <div class="flex-x status-box">
        <div class="flex-x mar-l-14 min-w-214 mar-b-15">
          <span class="font-16 font-w-500 mar-r-12">订单状态</span>

          <div
            :class="[`status-tips-${dataInfo.logisticsState}`,'status-tips']"
          >{{stateObj[dataInfo.logisticsState]? stateObj[dataInfo.logisticsState].name : ''}}</div>
        </div>
        <div class="flex-1 flex-x flex-w">
          <div class="flex-x mar-b-15" v-for="(item, index) in statusArr" :key="index">
            <div
              class="status-item status-item-ready flex-x"
              v-if="index > dataInfo.logisticsState-1"
            >
              <div class="status-item-index status-item-index-ready mar-r-15 flex-x">{{index+1}}</div>
              <span class="font-16">{{item}}</span>
            </div>
            <div
              class="status-item flex-x"
              v-if="index == dataInfo.logisticsState-1 && dataInfo.logisticsState != 3"
            >
              <div class="status-item-index status-item-index-now mar-r-15 flex-x">{{index+1}}</div>
              <span class="font-16">{{item}}</span>
            </div>
            <div
              class="status-item status-item-pass flex-x"
              v-if="index < dataInfo.logisticsState-1 || dataInfo.logisticsState == 3"
            >
              <div class="status-item-index status-item-index-pass mar-r-15 flex-x">
                <i class="el-icon-check"></i>
              </div>
              <span class="font-16">{{item}}</span>
            </div>
            <i class="iconfont icon-right font-size-16 color-ccc" v-if="index < statusArr.length-1"></i>
          </div>
        </div>
      </div>
      <!-- status-box end -->
      <!-- order-box start -->
      <div class="order-box">
        <div class="flex-x mar-b-14">
          <div class="flex-1 font-w-500">订单信息</div>
          <div class="flex-x">
            <el-button @click="outStock" v-if="dataInfo.repertoryState == 2">出库</el-button>
            <el-button type="primary" @click="goods" v-if="dataInfo.logisticsState == 1">发货</el-button>
          </div>
        </div>

        <div class="flex-x order-info-list">
          <div class="flex-x order-info-item" v-for="(item, index) in orderInfoArr" :key="index">
            <div class="order-info-item-title">{{item.label}}</div>
            <div class="flex-1 mar-r-12">{{item.value}}</div>
          </div>
        </div>
      </div>
      <!-- order-box start -->
    </div>
    <!-- info-box end -->
    <!-- table-box start -->
    <div class="table-box" v-if="dataInfo">
      <div class="table-box-title">商品信息</div>
      <!-- table-info start -->
      <el-table
        class="table-info"
        :data="dataInfo.goodsInfos"
        stripe
        border
        header-row-class-name="myShop-order-detail-heard"
      >
        <el-table-column
          v-for="column in columns"
          :key="column.field"
          :label="column.label"
          :prop="column.field"
          :width="column.width"
          :min-width="column.minWidth"
          :sortable="column.sortable"
          :align="column.align"
        >
          <template slot-scope="scope">
            <template v-if="column.field=='thumbnailUrl'">
              <div class="flex-x">
                <img
                  :src="scope.row.thumbnailUrl ? `${scope.row.thumbnailUrl}?x-oss-process=image/resize,m_fill,h_56,w_56` : defaultImg"
                  class="goods-img mar-r-4"
                  @click.stop="previewImg(scope.row.thumbnailUrl)"
                />
                <div>{{scope.row.name}}</div>
              </div>
            </template>
            <template v-else>{{scope.row[column.field]}}</template>
          </template>
        </el-table-column>
      </el-table>
      <!-- table-info start -->
      <div class="flex-x">
        <div class="flex-1"></div>
        <div class="mar-r-14 mar-b-14 price-total">
          总计：
          <span>¥</span>
          <span class="font-24 font-w-500 color-">{{dataInfo.payAmount}}</span>
        </div>
      </div>
    </div>
    <!-- table-box end -->
    <goods-dialog ref="goodsDialog" :info-data="dataInfo" @confirm="goodsConfirm"></goods-dialog>
    <out-stock-dialog ref="outStockDialog" :info-data="dataInfo" @confirm="outStockConfirm"></out-stock-dialog>
  </div>
</template>

<script>
import { orderDetail } from "@src/api/Linkc";
import { formatDate } from "@src/util/lang";
import componentMixin from "../component/index";

import defaultImg from "@src/assets/img/myShop/default.png";

// 页面刷新记住当前页面信息
const MY_SHOP_ORDER_SEARCH_MODEL = "my_shop_order_search_model";

const MY_SHOP_ORDER_SEARCH_MODEL_REAL = "my_shop_order_search_model_real";
export default {
  props: {
    initData: {
      type: Object,
      default: () => ({}),
    },
  },
  mixins: [componentMixin],
  data() {
    return {
      defaultImg,
      fullscreenLoading: false,
      statusArr: ["待发货", "待收货", "已完成"],
      orderInfoArr: [
        { label: "订单号：", value: "", key: "orderNum" },
        { label: "订单时间：", value: "", key: "createTime" },
        { label: "买家：", value: "", key: "nickName" },
        { label: "收货人：", value: "", key: "name" },
        { label: "联系方式：", value: "", key: "linkmanPhone" },
        { label: "收货地址：", value: "", key: "address" },
        { label: "支付订单号：", value: "", key: "payNum" },
        { label: "支付方式：", value: "", key: "payType" },
        { label: "支付时间：", value: "", key: "payTime" },
        {
          label: "买家备注：",
          value: "",
          key: "remarks",
        },
        {
          label: "物流单号：",
          value: "",
          key: "trackingNum",
        },
      ],
      columns: [
        {
          label: "商品",
          field: "thumbnailUrl",
          show: true,
          fixed: true,
          minWidth: "400px",
        },
        {
          label: "规格",
          field: "standard",
          show: true,
        },
        {
          label: "编号",
          field: "partSerialNumber",
          minWidth: "120px",
          fixed: true,
          show: true,
        },
        {
          label: "单价",
          field: "salePrice",
          fixed: true,
          show: true,
        },
        {
          label: "数量",
          field: "goodsCount",
          fixed: true,
          show: true,
        },
        {
          label: "小记",
          field: "payAmount",
          fixed: true,
          show: true,
        },
      ],
      searchData: {},
      dataInfo: {
        goodsInfos: [],
      },
    };
  },
  created() {
    let params = window.location.href.split("?")[1];
    let obj = {};
    if (params) {
      params.split("&").forEach((item) => {
        let item_ = item.split("=");
        obj[item_[0]] = item_[1];
      });
    }
    this.searchData = obj;
    this.getData();
  },
  methods: {
    outStock() {
      this.$refs.outStockDialog.changeDialog(true);
    },
    goods() {
      this.$refs.goodsDialog.changeDialog(true);
    },
    goodsConfirm() {
      this.getData();
      this.needReloadList();
    },
    outStockConfirm() {
      this.getData();
      this.needReloadList();
    },
    getData() {
      this.fullscreenLoading = true;
      orderDetail({
        orderId: this.searchData.id,
      })
        .then((res) => {
          if (res.status == 200) {
            this.dataInfo = res.data;
            this.orderInfoArr = this.orderInfoArr.map((item) => {
              //  if (item.key == "payTime" || item.key == "createTime") {
              //   item.value = formatDate(
              //     res.data[item.key],
              //     "YYYY-MM-DD HH:mm:ss"
              //   );
              // } else
              if (item.key == "payType") {
                try {
                  item.value = this.payObj[res.data[item.key]].name;
                } catch (error) {}
              } else {
                item.value = res.data[item.key];
              }
              return item;
            });
          } else {
            this.$notify.close();
            this.$notify.error({
              title: "网络错误",
              message: res.message,
              duration: 2000,
            });
          }
        })
        .finally(() => {
          this.fullscreenLoading = false;
        });
    },
    needReloadList() {
      let fromId = window.frameElement.getAttribute("fromid") || "";
      if (!fromId) return;
      localStorage.setItem(MY_SHOP_ORDER_SEARCH_MODEL_REAL, "true");
      this.$platform.refreshTab(fromId);
    },
  },
};
</script>

<style lang="scss">
@import url("../../assets/public.scss");
.info-box {
  background: #fff;
  margin-bottom: 12px;
  border-radius: 4px;
  box-sizing: border-box;
  .status-tips {
    padding: 3px 8px;
    border-radius: 11px;
    font-size: 12px;
    box-sizing: border-box;
  }
  .status-tips-1 {
    border: 1px solid rgba(110, 207, 64, 0.16);
    background: rgba(103, 194, 58, 0.2);
    color: #67c23a;
  }
  .status-tips-2 {
    border: 1px solid rgba(255, 174, 0, 0.41);

    background: rgba(255, 174, 0, 0.18);
    color: #ffae00;
  }
  .status-tips-3 {
    border: 1px solid #999(110, 207, 64, 0.16);
    color: #999;
    background: rgba(153, 153, 153, 0.27);
  }

  .status-box {
    padding-top: 15px;
    background: #fafafa;
    flex-wrap: wrap;
  }
  .status-item {
    width: 240px;
    justify-content: center;
    .status-item-index {
      width: 24px;
      height: 24px;
      border: 2px solid transparent;
      border-radius: 50%;
      font-size: 16px;
      justify-content: center;
    }
    .status-item-index-ready {
      border-color: #999;
    }
    .status-item-index-now {
      border-color: #333;
    }
    .status-item-index-pass {
      border-color: #67c23a;
    }
  }
  .status-item-ready {
    color: #999;
  }
  .status-item-pass {
    color: #67c23a;
  }
  .order-box {
    padding: 7px 14px;
    .order-info-list {
      flex-wrap: wrap;
      align-items: baseline;
      .order-info-item {
        width: 33.33%;
        min-width: 240px;
        margin-bottom: 14px;
        word-break: break-all;
        align-items: baseline;
        .order-info-item-title {
          color: #666;
        }
      }
    }
  }
}

.table-box {
  background: #fff;
  border-radius: 4px;
  box-sizing: border-box;

  padding-left: 16px;
  .el-table {
    .myShop-order-detail-heard th {
      background: #f5f5f5;
      color: $text-color-primary;
      font-weight: normal;
    }
  }
  .table-box-title {
    height: 58.51px;
    line-height: 58.51px;
    font-size: 16px;
    font-weight: 500;
  }
  .table-info {
    box-sizing: border-box;
    margin-bottom: 14px;
    .goods-img {
      width: 56px;
      height: 56px;
      cursor: pointer;
    }
  }
  .price-total {
    span {
      color: #fb602c;
    }
  }
}
</style>