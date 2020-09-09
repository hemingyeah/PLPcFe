<template>
  <div class="my-shop-box">
    <!-- ruler-box start-->
    <div class="ruler-box">
      <div class="mar-b-17 font-16 font-w-500">规则配置</div>
      <!-- ruler-set-list start -->
      <div class="flex-x ruler-set-list">
        <div class="ruler-set-item mar-r-56 min-w-604">
          <div class="ruler-set-item-title">门户访问权限:</div>
          <el-radio v-model="radio" label="1">所有用户均可访问(短信、图片验证码或小程序授权)</el-radio>
          <el-radio v-model="radio" label="2">仅允许客户列表下手机号码访问</el-radio>
        </div>
        <div class="ruler-set-item">
          <div class="ruler-set-item-title">网页门户验证方式：:</div>
          <el-radio v-model="radio" label="1">网页门户验证方式</el-radio>
          <el-radio v-model="radio" label="2">手机验证码</el-radio>
        </div>
        <div class="ruler-set-item mar-r-56 min-w-604">
          <div class="ruler-set-item-title">允许用户查看的服务事件：</div>
          <el-radio v-model="radio" label="1">仅显示用户在线发起的事件</el-radio>
          <el-radio v-model="radio" label="2">显示所有与该用户相关的服务事件</el-radio>
        </div>
        <div class="ruler-set-item">
          <div class="ruler-set-item-title">是否允许用户取消未完成的服务事件：</div>
          <el-switch v-model="value1" active-text="开启后允许从自助门户取消尚未完成的服务事件"></el-switch>
        </div>
      </div>
      <div class="min-w-604 pad-b-34">
        <div class="ruler-set-item-title">设置服务商城显示内容：</div>
        <div class="flex-x">
          <el-select class="w-228" v-model="options_value" placeholder="仅显示选择的备件和服务项目">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
          <el-button class="mar-l-9" type="primary">查看商城已选项目</el-button>
        </div>
      </div>
      <!-- ruler-set-list end -->
    </div>
    <!-- ruler-box end -->

    <!-- info-box start -->
    <div class="info-box flex-x al-start">
      <div class="flex-x min-w-406 mar-r-53 mar-b-20">
        门户网页地址：
        <el-input class="flex-1" readonly placeholder="请输入内容"></el-input>
        <el-button class type="primary">复制</el-button>
      </div>

      <div class="flex-x al-start mar-r-57 mar-b-20">
        门户二维码：
        <div class="flex-y code-box mar-l-19">
          <img
            src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1599133653811&di=856d0ef7041f8c0c9a8db1709f9bbe1f&imgtype=0&src=http%3A%2F%2Fbpic.588ku.com%2Felement_origin_min_pic%2F01%2F37%2F17%2F75573c3f5409214.jpg"
            alt
          />
          <div class="code-des">图片二维码</div>
        </div>
        <div class="flex-y code-box mar-l-16">
          <img
            src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1599133653811&di=856d0ef7041f8c0c9a8db1709f9bbe1f&imgtype=0&src=http%3A%2F%2Fbpic.588ku.com%2Felement_origin_min_pic%2F01%2F37%2F17%2F75573c3f5409214.jpg"
            alt
          />
          <div class="code-des">图片二维码</div>
        </div>
      </div>

      <div class="min-w-361 flex-x mar-b-20">
        <div class="flex-x info-tips cur-point">
          <i class="iconfont icon-fd-link mar-r-6"></i>
          绑定微信或钉钉服务窗
          <el-tooltip class="item" effect="dark" content="Right Center 提示文字" placement="right">
            <i class="iconfont icon-question mar-l-6"></i>
          </el-tooltip>
        </div>
        <div class="flex-x info-tips mar-l-16 cur-point">
          <i class="iconfont icon-setting mar-r-6"></i>
          发布我的门户小程序
        </div>
      </div>
    </div>
    <!-- info-box end -->

    <!-- setting-box start -->
    <div class="setting-box">
      <div class="flex-x">
        <div class="flex-x setting-show-box flex-1">
          <div class="setting-show">
            <div class="setting-show-data-box">
              <draggable class="menu-box" v-model="dataList">
                <div
                  class="can-move"
                  v-for="(item, index) in dataList"
                  :key="index"
                  draggable="true"
                  @click="chooseNowSet(item)"
                >
                  <component
                    :is="item.type"
                    ref="customerIchangeThisnfo"
                    :info-data="item.data"
                    :cmp-id="item.id"
                    @changeThis="changeThis"
                    @pushIcon="pushIcon"
                  ></component>
                </div>
              </draggable>
            </div>
          </div>
        </div>
        <div class="setting-data">
          <keep-alive>
            <component
              v-if="nowSettingDataId > 0"
              :is="nowSettingData.name"
              ref="customerInfo"
              :info-data="nowSettingData.data"
              :cmp-id="nowSettingData.id"
              :icon-set-id="nowSettingData.iconSetId"
              @saveIconItem="saveIconItem"
              @deleteIconItem="deleteIconItem"
            ></component>
          </keep-alive>
        </div>
      </div>
    </div>
    <!-- setting-box end -->
  </div>
</template>
<script>
import draggable from "vuedraggable";
import _ from "lodash";

import settingMixin from "./settingShowCmp/index";
import userImg from "@src/assets/img/myShop/logo.png";
export default {
  name: "my-shop",
  mixins: [settingMixin],
  props: {
    initData: {
      type: Object,
      default: () => ({}),
    },
  },
  provide() {
    return {
      cancelInfoData: this.cancelInfoData,
    };
  },
  data() {
    return {
      radio: "1",
      value1: false,
      options: [
        {
          label: "上架全部备件和服务项目",
          value: 1,
        },
        {
          label: "仅显示选择的备件和服务项目",
          value: 2,
        },
      ],
      options_value: 1,
      dataList: [
        {
          type: "company-card",
          id: 1,
          data: {
            imageUrl: userImg,
            name: "北京众联成业有限公司",
            phone: "18289283849",
            address: "湖南省株洲市石峰区兴安街584号",
          },
        },
        {
          type: "icon-list",
          id: 2,
          data: [],
        },
        {
          type: "shops-list",
          id: 3,
          data: [],
        },
        {
          type: "wiki-enter",
          id: 4,
          data: [
            { title: "标题", name: "橘子", read: "1.2W" },
            { title: "标题", name: "橘子", read: "1.2W" },
          ],
        },
      ],
      nowSettingDataId: -1,
      nowSettingIconId: "",
      nowSettingData: {},
    };
  },
  computed: {},
  methods: {
    chooseNowSet(item) {
      if (item.type == "icon-list") return;
      let id = item.id;
      if (this.nowSettingDataId == id) {
        return;
      }
      this.nowSettingDataId = id;
      if (id > 0) {
        let res_ = this.findNowSetData(this.nowSettingDataId).item;
        this.$set(this, "nowSettingData", {
          name: `${res_.type}-data`,
          data: res_.data,
          id: res_.id,
        });
      }
    },
    changeThis(item) {
      let data_ = this.findNowSetData(item.id).item;

      let nowSettingData = {
        id: item.item.cmpId,
        name: `${data_.type}-data`,
        data: data_.data,
        iconSetId: item.item.id,
      };
      this.nowSettingDataId = 1;
      this.$set(this, "nowSettingData", nowSettingData);
    },
    pushIcon(item) {
      let index = this.findNowSetData(item.id).index;
      this.dataList[index].data.push(item.item);
    },
    findNowSetData(id) {
      let res;
      if (id < 0) {
        return false;
      }
      try {
        for (let index = 0; index < this.dataList.length; index++) {
          const item = this.dataList[index];
          if (item.id == id) {
            res = { item, index };
            break;
          }
        }
      } catch (error) {}

      return res;
    },
    saveIconItem(e) {
      let index = this.findNowSetData(e.id).index;
      this.$set(this.dataList[index].data, `${e.indexs}`, e.item);
    },
    deleteIconItem(e) {
      let index = this.findNowSetData(e.id).index;
      let data_ = _.cloneDeep(this.dataList[index].data);
      data_.splice(e.indexs, 1);
      this.$set(this.dataList[index], "data", data_);
      this.nowSettingDataId = -1;
    },
    cancelInfoData() {
      this.nowSettingDataId = -1;
    },
  },
  created() {},
  components: {
    draggable,
  },
};
</script>
<style lang="scss">
@import url("../assets/public.scss");
.my-shop-box {
  min-width: 730px;
}

.ruler-box {
  background: #fff;
  padding: 12px 12px 0 12px;
  border-radius: 4px;
  margin-bottom: 1px;
  .ruler-set-list {
    flex-wrap: wrap;
  }
  .ruler-set-item-title {
    margin-bottom: 13px;
  }
  .ruler-set-item {
    margin-bottom: 32px;
  }
}
.info-box {
  background: #fff;
  padding: 26px 11px 0 11px;
  border-radius: 4px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  .code-box {
    padding: 8px 16px 0 16px;
    border: 1px solid #ebeded;
    border-radius: 4px;
    .code-des {
      font-size: 12px;
      padding: 4px 0;
    }
    img {
      width: 56px;
      height: 56px;
    }
  }
  .info-tips {
    height: 32px;
    line-height: 32px;
    border-radius: 3px;
    border: 1px solid #d8d8d8;
    padding: 0 6px;
  }
}
.setting-box {
  .setting-show-box {
    justify-content: center;
    .setting-show {
      background: url("../../../assets/img/iphoneX.png") no-repeat center 0;
      background-size: 100% 100%;
      position: relative;
      height: 669px;
      width: 375px;
      .setting-show-data-box {
        background: #f2f2f2;
        position: absolute;
        width: 339px;
        height: 572px;
        top: 45px;
        left: 18px;
        overflow-y: scroll;
        // background: #ff0000;
      }
    }
  }
  .setting-data {
    width: 330px;
    background: #fff;
    height: 691px;
  }
}
.el-switch__label {
  color: #9ba3a1;
}
::-webkit-scrollbar {
  display: none;
}
</style>