<template>
  <div class="my-shop-box">
    <!-- info-box start -->
    <div class="info-box">
      <!-- status-box start -->
      <div class="flex-x status-box">
        <div class="flex-x mar-l-14 min-w-214 mar-b-15">
          <span class="font-16 font-w-500 mar-r-12">订单状态</span>
          <div class="status-tips status-tips-1">待发货</div>
        </div>
        <div class="flex-1 flex-x flex-w">
          <div class="flex-x mar-b-15" v-for="(item, index) in statusArr" :key="index">
            <div class="status-item status-item-ready flex-x" v-if="index==0">
              <div class="status-item-index status-item-index-ready mar-r-15 flex-x">{{index+1}}</div>
              <span class="font-16">{{item}}</span>
            </div>
            <div class="status-item flex-x" v-if="index==1">
              <div class="status-item-index status-item-index-now mar-r-15 flex-x">{{index+1}}</div>
              <span class="font-16">{{item}}</span>
            </div>
            <div class="status-item status-item-pass flex-x" v-if="index==2">
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
            <el-button>出库</el-button>
            <el-button type="primary">发货</el-button>
          </div>
        </div>

        <div class="flex-x order-info-list">
          <div class="flex-x order-info-item" v-for="(item, index) in orderInfoArr" :key="index">
            <div class="order-info-item-title">{{item.label}}</div>
            <div class="flex-1">{{item.value}}</div>
          </div>
        </div>
      </div>
      <!-- order-box start -->
    </div>
    <!-- info-box end -->
    <!-- table-box start -->
    <div class="table-box">
      <div class="table-box-title">商品信息</div>
      <!-- table-info start -->
      <el-table class="table-info" :data="tableData" stripe border>
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
            <template v-if="column.field=='goods'">
              <div class="flex-x">
                <img src="@src/assets/img/no-data.png" class="goods-img" />
                <div>{{scope.row[column.field].name}}</div>
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
          <span class="font-24 font-w-500 color-">160.00</span>
        </div>
      </div>
    </div>
    <!-- table-box end -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      statusArr: ["待发货", "待收货", "已完成"],
      orderInfoArr: [
        { label: "订单号：", value: "1231232131123" },
        { label: "订单时间：", value: "1231232131123" },
        { label: "买家：", value: "1231232131123" },
        { label: "收货人：", value: "1231232131123" },
        { label: "联系方式：", value: "1231232131123" },
        { label: "收货地址：", value: "1231232131123" },
        { label: "支付订单号：", value: "1231232131123" },
        { label: "支付方式：", value: "1231232131123" },
        { label: "支付时间：", value: "1231232131123" },
      ],
      columns: [
        {
          label: "商品",
          field: "goods",
          show: true,
          fixed: true,
          minWidth: "400px",
        },
        {
          label: "规格",
          field: "data_1",
          show: true,
        },
        {
          label: "编号",
          field: "data_2",
          minWidth: "120px",
          fixed: true,
          show: true,
        },
        {
          label: "单价",
          field: "data_3",
          fixed: true,
          show: true,
        },
        {
          label: "数量",
          field: "data_4",
          fixed: true,
          show: true,
        },
        {
          label: "小记",
          field: "data_5",
          fixed: true,
          show: true,
        },
        {
          label: "买家备注",
          field: "data_6",
          fixed: true,
          show: true,
        },
      ],
      tableData: [
        {
          goods: {
            img: "",
            name:
              "什么鬼商品什么鬼商品什么鬼商品什么鬼商品什么鬼商品什么鬼商品什么鬼商品",
          },
          data_1: "data_1",
          data_2: "data_2",
          data_3: "data_3",
          data_4: "data_4",
          data_5: "data_5",
          data_6: "data_6",
        },

        {
          goods: {
            img: "",
            name:
              "什么鬼商品什么鬼商品什么鬼商品什么鬼商品什么鬼商品什么鬼商品什么鬼商品",
          },
          data_1: "data_1",
          data_2: "data_2",
          data_3: "data_3",
          data_4: "data_4",
          data_5: "data_5",
          data_6: "data_6",
        },
        {
          goods: {
            img: "",
            name:
              "什么鬼商品什么鬼商品什么鬼商品什么鬼商品什么鬼商品什么鬼商品什么鬼商品",
          },
          data_1: "data_1",
          data_2: "data_2",
          data_3: "data_3",
          data_4: "data_4",
          data_5: "data_5",
          data_6: "data_6",
        },
      ],
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
    console.log(obj);
  },
};
</script>

<style lang="scss">
@import url("../../assets/public.scss");
.info-box {
  background: #fff;
  margin-bottom: 12px;
  border: 1px solid #d9d9d9;
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
  border: 1px solid #d9d9d9;
  box-sizing: border-box;

  padding-left: 16px;
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
    }
  }
  .price-total {
    span {
      color: #fb602c;
    }
  }
}
</style>