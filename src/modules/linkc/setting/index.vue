<template>
  <div class="my-shop-box" v-loading.fullscreen.lock="fullscreenLoading">
    <!-- ruler-box start-->
    <div class="ruler-box" v-if="setData">
      <div class="mar-b-17 font-16 font-w-500">规则配置</div>
      <!-- ruler-set-list start -->
      <div class="flex-x ruler-set-list">
        <!-- 1 -->
        <div class="ruler-set-item mar-r-128">
          <div class="ruler-set-item-title">门户访问权限:</div>
          <el-radio-group
            v-model="setData.serviceStationConfig.loginValidate"
            @change="change($event,'loginValidate')"
          >
            <div class="mar-b-12">
              <el-radio class="mar-r-16" :label="false">所有用户均可访问(短信、图片验证码或小程序授权)</el-radio>
            </div>
            <div>
              <el-radio :label="true">仅允许客户列表下手机号码访问</el-radio>
            </div>
          </el-radio-group>
        </div>
        <!-- 2 -->
        <div class="ruler-set-item mar-r-190">
          <div class="ruler-set-item-title">网页门户验证方式：</div>
          <el-radio-group
            v-model="setData.serviceStationConfig.validateBySms"
            @change="change($event,'validateBySms')"
          >
            <div class="mar-b-12">
              <el-radio class="mar-r-16" :label="false">图片验证码</el-radio>
            </div>
            <div>
              <el-radio :label="true">手机验证码</el-radio>
            </div>
          </el-radio-group>
        </div>
        <!-- 3 -->
        <div class="ruler-set-item mar-r-140 flex-1">
          <div class="ruler-set-item-title">允许用户查看的服务事件：</div>
          <el-radio-group
            v-model="setData.serviceStationConfig.showAllEvent"
            @change="change($event,'showAllEvent')"
          >
            <div class="mar-b-12">
              <el-radio class="mar-r-16" :label="false">仅显示用户在线发起的事件</el-radio>
            </div>
            <div>
              <el-radio :label="true">显示所有与该用户相关的服务事件</el-radio>
            </div>
          </el-radio-group>
        </div>
      </div>

      <div class="flex-x flex-w">
        <div class="ruler-set-item mar-r-140">
          <div class="ruler-set-item-title">是否允许用户取消未完成的服务事件：</div>
          <el-switch
            v-model="setData.serviceStationConfig.eventCancel"
            @change="change($event,'eventCancel')"
            active-text="开启后允许从自助门户取消尚未完成的服务事件"
          ></el-switch>
        </div>
        <div class="ruler-set-item">
          <div class="ruler-set-item-title">设置服务商城显示内容：</div>
          <div class="flex-x">
            <el-select
              class="w-228"
              v-model="setData.serviceStationConfig.showAllItem"
              @change="change($event,'showAllItem')"
              placeholder="仅显示选择的备件和服务项目"
            >
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
            <el-button class="mar-l-9" type="primary" @click="goToShopCenter">查看商城已选项目</el-button>
          </div>
        </div>
      </div>

      <!-- ruler-set-list end -->
    </div>
    <!-- ruler-box end -->

    <!-- info-box start -->
    <div class="info-box flex-x al-start">
      <div class="flex-x min-w-406 mar-r-53 mar-b-20">
        门户网页地址：
        <el-input class="flex-1" readonly placeholder="请输入内容" v-model="setData.protalUrl"></el-input>
        <el-button class type="primary" @click="copyUrl">复制</el-button>
      </div>

      <div class="flex-x al-start mar-r-57 mar-b-20">
        门户二维码：
        <div class="flex-y code-box" v-show="setData.protalUrl">
          <div class="qrcode" ref="qrCodeUrl"></div>
          <div class="code-des">网页入口</div>
        </div>
        <div class="flex-y code-box mar-l-16" v-show="setData.weChatQRCodeUrl">
          <img :src="setData.weChatQRCodeUrl" alt />
          <div class="code-des">小程序入口</div>
        </div>
      </div>

      <div class="min-w-361 flex-x mar-b-20 info-link-box">
        <!-- <div class="flex-x info-tips cur-point">
          <i class="iconfont icon-fd-link mar-r-6"></i>
          绑定微信或钉钉服务窗
          <el-tooltip class="item" effect="dark" content="Right Center 提示文字" placement="right">
            <i class="iconfont icon-question mar-l-6"></i>
          </el-tooltip>
        </div>
        <div class="flex-x info-tips mar-l-16 cur-point">
          <i class="iconfont icon-setting mar-r-6"></i>
          发布我的门户小程序
        </div>-->
        <a
          href="javascript:;"
          @click="openLink('https://register.shb.ltd/VIP/WechatAndDing.html#DingService_setting')"
        >
          <i class="iconfont icon-fd-link mar-r-6"></i>
          绑定微信或钉钉服务窗
        </a>
        <a
          class="mar-l-16"
          href="javascript:;"
          @click="openLink('https://www.yuque.com/shb/help/XCX')"
        >
          <i class="iconfont icon-fabu1 mar-r-6"></i>小程序发布指引
        </a>
        <el-button
          v-if="!setData.weChatQRCodeUrl"
          class="mar-l-16"
          type="primary"
          @click="submitWx"
        >填写微信授权资料</el-button>
      </div>
      <div class="mar-b-20 color-primary" v-if="setData.weChatQRCodeUrl">您已提交了微信授权资料，如需变更请联系售后宝管理员</div>
    </div>
    <!-- info-box end -->

    <!-- setting-box start -->
    <div class="setting-box">
      <div class="flex-x">
        <div class="flex-x setting-show-box flex-1">
          <div class="setting-show-box-tips">资料设置</div>

          <div class="setting-show">
            <div class="setting-show-box-submit">
              <el-button type="primary" @click="submitSet">发布</el-button>
            </div>
            <div class="setting-show-data-box">
              <!-- <draggable class="menu-box" v-model="dataList"> 可拖动-->
              <div class="menu-box">
                <div
                  v-for="(item, index) in dataList"
                  :key="index"
                  draggable="false"
                  @click="chooseNowSet(item)"
                >
                  <div
                    :class="['menu-box-item',nowSettingDataId == item.id?'menu-box-item-check':'']"
                  >
                    <component
                      :is="item.type"
                      ref="setShow"
                      :info-data="item.data"
                      :cmp-id="item.id"
                      :now-setting-data-id="nowSettingDataId"
                      :event-list="eventList"
                      @changeThis="changeThis"
                      @pushIcon="pushIcon"
                    ></component>
                  </div>
                  <div v-if="index == 2 || index == 3" style="height:32px"></div>
                </div>
              </div>
              <!-- </draggable> -->
            </div>
          </div>
        </div>
        <div class="setting-data">
          <keep-alive>
            <component
              v-if="nowSettingDataId > 0"
              :is="nowSettingData.name"
              ref="setData"
              :info-data="nowSettingData.data"
              :cmp-id="nowSettingData.id"
              :icon-set-id="nowSettingData.iconSetId"
              :event-list="eventList"
              @saveIconItem="saveIconItem"
              @deleteIconItem="deleteIconItem"
              @changeInfoData="changeInfoData"
            ></component>
          </keep-alive>
        </div>
      </div>
    </div>
    <!-- setting-box end -->

    <!-- 填写微信信息弹窗 start-->
    <el-dialog title="提交微信商户信息" :visible.sync="submitDialog" width="390px">
      <div class="mar-b-18">打开微信商户平台，复制并提交微信商户信息</div>
      <el-form
        :model="wxRulerFormData"
        :rules="wxRuler"
        label-position="left"
        ref="wxRulerForm"
        label-width="120px"
        class="demo-ruleForm"
      >
        <el-form-item label="APPSecret" prop="secret">
          <el-input v-model="wxRulerFormData.secret" autocomplete="off" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item label="APPID" prop="appId">
          <el-input v-model="wxRulerFormData.appId" autocomplete="off" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item label="公众号APPID" prop="publicAppId">
          <el-input v-model="wxRulerFormData.publicAppId" autocomplete="off" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item label="mch_id" prop="matchId">
          <el-input v-model="wxRulerFormData.matchId" autocomplete="off" placeholder="请输入"></el-input>
        </el-form-item>
        <el-form-item label="API密钥" prop="apiSecret">
          <el-input v-model="wxRulerFormData.apiSecret" autocomplete="off" placeholder="请输入"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <base-button type="ghost" @event="outStockDialog = false">取消</base-button>
        <base-button type="primary" @event="submitWxData">确定</base-button>
      </div>
    </el-dialog>
    <!-- 填写微信信息弹窗 end-->
  </div>
</template>
<script>
import draggable from "vuedraggable";
import _ from "lodash";
import QRCode from "qrcodejs2";

import settingMixin from "./settingShowCmp/index";
import userImg from "@src/assets/img/myShop/logo.png";

import {
  getRules,
  saveRules,
  getInfos,
  saveInfos,
  weChat,
  getEventList,
} from "@src/api/Linkc";

export default {
  name: "my-shop",
  mixins: [settingMixin],
  filters: {
    usualNum(val) {
      if (val > 10000) {
        return `${val / 10000}万`;
      }
    },
  },
  props: {
    initData: {
      type: Object,
      default: () => ({}),
    },
  },
  provide() {
    return {
      cancelInfoData: this.cancelInfoData,
      changeFullscreenLoading: this.changeFullscreenLoading,
    };
  },
  watch: {
    submitDialog(value) {
      if (value == false) {
        this.$refs["wxRulerForm"].resetFields();
      }
    },
  },
  data() {
    return {
      setData: "",
      radio: "1",
      value1: false,
      options: [
        {
          label: "上架全部备件和服务项目",
          value: false,
        },
        {
          label: "仅显示选择的备件和服务项目",
          value: true,
        },
      ],
      options_value: 1,
      dataList: [
        {
          type: "company-card",
          id: 1,
          data: {
            logoUrl: userImg,
            name: "",
            mobile: "",
            address: "",
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
          data: [],
        },
      ],
      nowSettingDataId: -1,
      nowSettingIconId: "",
      nowSettingData: {},
      fullscreenLoading: false,
      submitDialog: false,
      wxRulerFormData: {
        appId: "",
        matchId: "",
        apiSecret: "",
        secret: "",
        publicAppId: "",
      },
      wxRuler: {
        appId: [{ required: true, message: "请输入APPID", trigger: "blur" }],
        matchId: [{ required: true, message: "请输入mch_id", trigger: "blur" }],
        apiSecret: [
          { required: true, message: "请输入API密钥", trigger: "blur" },
        ],
        secret: [
          { required: true, message: "请输入AppSecret", trigger: "blur" },
        ],
        publicAppId: [
          { required: true, message: "请输入公众号APPID", trigger: "blur" },
        ],
      },
      eventList: [],
    };
  },
  computed: {},
  created() {
    this.fullscreenLoading = true;
    Promise.all([this.getSetData(), getEventList(), this.getInfos()])
      .then((res) => {
        if (res[0].status == 200) {
          this.setData = res[0].data;
          let qrcode = new QRCode(this.$refs.qrCodeUrl, {
            text: `${this.setData.protalUrl}`, // 需要转换为二维码的内容
            width: 56,
            height: 56,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H,
          });
        } else {
          this.$notify.close();
          this.$notify.error({
            title: "网络错误",
            message: res[0].message,
            duration: 2000,
          });
        }
        if (res[1].status == 0) {
          this.$set(this, "eventList", res[1].data);
        } else {
          this.$notify.close();
          this.$notify.error({
            title: "网络错误",
            message: res[1].message,
            duration: 2000,
          });
        }
        if (res[2].status == 200) {
          this.transData(res[2].data).then((res_) => {
            this.$set(this, "dataList", res_);
          });
        } else {
          this.$notify.close();
          this.$notify.error({
            title: "网络错误",
            message: res[2].message,
            duration: 2000,
          });
        }
      })
      .finally(() => {
        this.$nextTick(() => {
          this.chooseNowSet(this.dataList[0]);
          this.fullscreenLoading = false;
        });
      });
  },
  mounted() {},
  methods: {
    transData(data) {
      return new Promise((resolve, reject) => {
        try {
          let arr = [];
          for (let key in data) {
            let item = data[key];
            let items = {};
            if (key == "baseInfo") {
              items["type"] = "company-card";
              items["data"] = item;
            } else if (key == "quickInfo") {
              items["type"] = "icon-list";
              item.quickInfos.forEach((item_, index_) => {
                item_.cmpId = item.index;
                item_["id"] = index_ + 1;
              });
              items["data"] = item.quickInfos || [];
            } else if (key == "shopResponse") {
              items["type"] = "shops-list";
              items["data"] = item.shopInfos || [];
            } else if (key == "wikiResponse") {
              items["type"] = "wiki-enter";
              items["data"] = item.wikiInfos || [];
            }
            items["id"] = item.index;
            arr[item.index - 1] = items;
          }
          resolve(arr);
          console.log(arr, "transData");
        } catch (error) {
          reject(error);
        }
      });
    },
    reverData() {
      return new Promise((resolve, reject) => {
        try {
          let data_ = _.cloneDeep(this.dataList);
          let obj = {};
          data_.forEach((item_, indexs_) => {
            let index_ = indexs_ + 1;
            if (item_.type == "company-card") {
              obj["baseInfo"] = { ...item_.data, index: index_ };
            } else if (item_.type == "icon-list") {
              obj["quickInfo"] = { quickInfos: item_.data, index: index_ };
            } else if (item_.type == "shops-list") {
              let ids =
                item_.data.length > 0
                  ? item_.data.map((res) => {
                      return res.num;
                    })
                  : [];
              obj["shopInfo"] = { marketIds: ids, index: index_ };
            } else if (item_.type == "wiki-enter") {
              let ids =
                item_.data.length > 0
                  ? item_.data.map((res) => {
                      return res.num;
                    })
                  : [];
              obj["wikiInfo"] = { wikiIds: ids, index: index_ };
            }
          });
          resolve(obj);
          console.log(obj, "reverData");
        } catch (error) {
          reject(error);
        }
      });
    },
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
      this.nowSettingDataId = item.item.cmpId;
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
    changeInfoData(e) {
      let index = this.findNowSetData(this.nowSettingDataId).index;
      this.$set(this.dataList[index], "data", e.item);
    },
    deleteIconItem(e) {
      let index = this.findNowSetData(e.id).index;
      let data_ = _.cloneDeep(this.dataList[index].data);
      data_.splice(e.indexs, 1);
      this.$set(this.dataList[index], "data", data_);
      this.nowSettingDataId = -1;
    },
    cancelInfoData() {
      return;
      this.nowSettingDataId = -1;
    },
    changeFullscreenLoading(e) {
      if (this.fullscreenLoading === e) return;
      this.fullscreenLoading = e;
    },
    openLink(e) {
      this.$platform.openLink(e);
    },
    goToShopCenter() {
      window.location = "/setting/serviceStation/markSpareGray";
    },
    copyUrl() {
      if (!this.setData.protalUrl) return;
      this.$copyText(`${this.setData.protalUrl}`).then(() => {
        this.$message({
          message: "已复制好，可贴粘。",
          duration: 1500,
          type: "success",
        });
      });
    },
    submitWx() {
      this.submitDialog = true;
    },
    submitWxData() {
      this.$refs["wxRulerForm"].validate((valid) => {
        if (valid) {
          this.fullscreenLoading = true;
          let params_ = _.cloneDeep(this.wxRulerFormData);
          let params = this.$safeParams(params_);

          weChat(params)
            .then((res) => {
              if (res.status == 200) {
                this.$message({
                  message: "微信商户信息提交成功",
                  duration: 1500,
                  type: "success",
                });
                this.setData.weChatQRCodeUrl = res.data;
                this.submitDialog = false;
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
        }
      });
    },
    getSetData() {
      return getRules();
    },
    getInfos() {
      return getInfos();
    },
    change(e, key) {
      saveRules({
        type: key,
        state: e,
      });
    },
    submitSet() {
      this.reverData().then((res) => {
        this.fullscreenLoading = true;
        saveInfos(res)
          .then((res) => {
            if (res.status == 200) {
              this.$message({
                message: "发布成功，请前往移动端自助门户查看",
                duration: 1500,
                type: "success",
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
      });
    },
  },
  components: {
    draggable,
  },
};
</script>
<style lang="scss">
@import url("../assets/public.scss");
.el-radio {
  font-weight: 400;
}
.el-switch__label {
  font-weight: 400;
}
.my-shop-box {
  min-width: 730px;
}

.el-dialog__body {
  border-top: 1px solid rgba(0, 0, 0, 0.09);
  border-bottom: 1px solid rgba(0, 0, 0, 0.09);
  padding-top: 12px;
  padding-bottom: 0;
}

.ruler-box {
  background: #fff;
  padding: 12px 12px 0 12px;
  border-radius: 4px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  margin-bottom: 1px;
  .ruler-set-list {
    flex-wrap: wrap;
  }
  .ruler-set-item-title {
    margin-bottom: 13px;
  }
  .ruler-set-item {
    margin-bottom: 24px;
  }
}
.info-box {
  background: #fff;
  padding: 24px 11px 0 11px;
  border-radius: 4px;

  border-top-left-radius: 0;
  border-top-right-radius: 0;
  flex-wrap: wrap;
  margin-bottom: 12px;
  .info-link-box {
    a {
      color: $color-primary;
    }
  }
  .code-box {
    padding: 8px 16px 0 16px;
    border: 1px solid #ebeded;
    border-radius: 4px;
    .code-des {
      font-size: 12px;
      padding: 4px 0;
    }
    .qrcode {
      display: inline-block;
      img {
        width: 56px;
        height: 56px;
        background-color: #fff; //设置白色背景色
        box-sizing: border-box;
      }
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
    position: relative;
    .setting-show-box-tips {
      position: absolute;
      left: 12px;
      top: -12px;
      z-index: 99;
      font-size: 16px;
      font-weight: 500;
    }
    .setting-show-box-submit {
      position: absolute;
      left: 100%;
      margin-left: 20px;
      top: 0;
      z-index: 99;
    }
    .menu-box-item {
      border: 1px dashed transparent;
      box-sizing: border-box;
    }
    .menu-box-item-check {
      border-color: $color-primary;
    }
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
    border-radius: 4px;
  }
}
.el-switch__label {
  color: #9ba3a1;
}
::-webkit-scrollbar {
  display: none;
}
</style>