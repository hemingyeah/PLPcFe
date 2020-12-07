<template>
  <div class="flex-1" v-loading.fullscreen.lock="fullscreenLoading">
    <div class="my-shop-box flex-1">
      <!-- ruler-box start-->
      <div class="box-title">规则配置</div>
      <div class="ruler-box" v-if="setData">
        <!-- ruler-set-list start -->

        <!-- 1 -->
        <div class="ruler-set-item flex-x">
          <div class="flex-1">
            <div class="ruler-set-item-title">自助门户设置</div>
            <div>开启后允许外部用户通过自助门户提交服务事件</div>
          </div>

          <el-switch
            v-model="setData.serviceStationConfig.selfHelpEnabled"
            @change="change($event, 'selfHelpEnabled')"
            :active-text="
              setData.serviceStationConfig.selfHelpEnabled ? '启用' : '禁用'
            "
          ></el-switch>
        </div>
        <!-- 2 -->
        <div class="ruler-set-item">
          <div class="ruler-set-item-title">门户访问权限:</div>
          <el-radio-group
            v-model="setData.serviceStationConfig.loginValidate"
            @change="change($event, 'loginValidate')"
          >
            <div class="mar-b-12">
              <el-radio class="mar-r-16" :label="true"
                >仅允许客户列表下手机号码访问</el-radio
              >
            </div>
            <div>
              <el-radio :label="false">所有用户均可访问</el-radio>
            </div>
          </el-radio-group>
        </div>
        <!-- 3 -->
        <div class="ruler-set-item">
          <div class="ruler-set-item-title">网页门户登录验证方式：</div>
          <el-radio-group
            v-model="setData.serviceStationConfig.validateBySms"
            @change="change($event, 'validateBySms')"
          >
            <div class="mar-b-12">
              <el-radio class="mar-r-16" :label="false">图形验证码</el-radio>
            </div>
            <div>
              <el-radio :label="true">手机验证码(推荐)</el-radio>
            </div>
          </el-radio-group>
        </div>
        <!-- 3 -->

        <div class="ruler-set-item">
          <div class="ruler-set-item-title">允许客户查看的服务事件：</div>
          <el-radio-group
            v-model="setData.serviceStationConfig.showAllEvent"
            @change="change($event, 'showAllEvent')"
          >
            <div class="mar-b-12">
              <el-radio class="mar-r-16" :label="false"
                >仅显示客户在线提交的服务事件</el-radio
              >
            </div>
            <div>
              <el-radio :label="true">显示所有与该客户相关的服务事件</el-radio>
              <el-tooltip
                class="item"
                effect="dark"
                content="与该客户相关的服务事件包括：客户自己在线提交的服务事件及企业内部员工在售后宝中提交的该客户的服务事件"
                placement="bottom"
              >
                <i class="iconfont icon-info mar-l-6 color-999 cur-point"></i>
              </el-tooltip>
            </div>
          </el-radio-group>
        </div>

        <div class="ruler-set-item flex-x">
          <div class="flex-1">
            <div class="ruler-set-item-title">
              是否允许用户取消未完成的服务事件：
            </div>
            <div>开启后允许从自助门户取消尚未完成的服务事件</div>
          </div>

          <el-switch
            v-model="setData.serviceStationConfig.eventCancel"
            @change="change($event, 'eventCancel')"
            :active-text="
              setData.serviceStationConfig.eventCancel ? '启用' : '禁用'
            "
          ></el-switch>
        </div>
        <div class="">
          <div class="ruler-set-item-title">设置服务商城显示内容：</div>
          <div class="flex-x">
            <el-select
              class="w-228"
              v-model="setData.serviceStationConfig.showAllItem"
              @change="change($event, 'showAllItem')"
              placeholder="仅显示选择的备件和服务项目"
            >
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
            <el-button class="mar-l-9" type="primary" @click="goToShopCenter"
              >查看商城已选项目</el-button
            >
          </div>
        </div>

        <!-- ruler-set-list end -->
      </div>
      <!-- ruler-box end -->

      <!-- info-box start -->
      <div class="info-box flex-x al-s">
        <div class="mar-r-12 flex-1">
          <div class="flex-x mar-b-32">
            门户网页地址：
            <el-input
              id="protalUrl"
              class="flex-1"
              disabled
              placeholder="请输入内容"
              v-model="setData.protalUrl"
            ></el-input>
            <el-button class="mar-l-10" type="primary" @click="copyUrl"
              >复制</el-button
            >
          </div>
          <div class="flex-x al-start">
            <div class="flex-1 mar-r-12">
              <i class="iconfont icon-fd-link mar-r-6 color-primary"></i>
              <a
                href="javascript:;"
                @click="
                  openLink(
                    'https://register.shb.ltd/VIP/WechatAndDing.html#DingService_setting'
                  )
                "
                >绑定微信或钉钉服务窗</a
              >
            </div>
            <div class="flex-y code-box" v-show="setData.protalUrl">
              <div
                class="qrcode cur-point"
                ref="qrCodeUrl"
                @click="previewImg($event)"
              ></div>
              <div class="code-des">网页入口</div>
            </div>
          </div>
        </div>
        <div class="flex-1">
          <el-button
            v-if="!setData.writeData"
            class="mar-b-32"
            type="primary"
            @click="submitWx"
            >填写微信授权资料</el-button
          >
          <div class="mar-b-32 h-32 flex-x" v-if="setData.writeData">
            您已提交了微信授权资料，如需变更请联系售后宝管理员
          </div>
          <div class="flex-x al-start">
            <div class="flex-1 mar-r-12">
              <i
                class="iconfont icon-fabu1 mar-r-6 color-primary cur-point"
              ></i>
              <a
                class
                href="javascript:;"
                @click="openLink(this.miniProgramReportlink)"
                >微信商户，微信支付，微信小程序申请指引</a
              >
            </div>
            <div
              class="flex-y code-box mar-l-16 i-can-scale"
              v-show="setData.weChatQRCodeUrl"
            >
              <img
                class="cur-point"
                :src="setData.weChatQRCodeUrl"
                @click="previewImg(setData.weChatQRCodeUrl)"
                alt
              />
              <div class="code-des">小程序入口</div>
            </div>
          </div>
        </div>
      </div>
      <!-- info-box end -->

      <!-- setting-box start -->
      <div class="setting-box">
        <div class="flex-x box-title">
          <div class="setting-show-box-tips">资料设置</div>
          <div class="setting-show-box-submit flex-x">
            <el-button type="primary" @click="submitSet">发布</el-button>
            <!-- <div class="tips">
                <i class="iconfont icon-jinggao"></i>请确定右侧信息已保存
              </div> -->
          </div>
        </div>
        <div class="flex-x al-s">
          <div class="flex-x setting-show-box flex-1">
            <div class="setting-show">
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
                      v-if="item.type == 'company-card'"
                      class="head-phone-box"
                    >
                      <img :src="headPhone" class="head-phone" alt="" />
                      <div
                        :class="[
                          'head-phone-con',
                          'overHideCon-1',
                          nowSettingDataId == item.id
                            ? 'menu-box-item-check'
                            : '',
                        ]"
                      >
                        {{ item.data.name }}
                      </div>
                    </div>
                    <div
                      :class="[
                        'menu-box-item',
                        nowSettingDataId == item.id
                          ? 'menu-box-item-check'
                          : '',
                      ]"
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
                    <div
                      v-if="index == 2 || index == 3"
                      style="height: 32px"
                    ></div>
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
      <el-dialog
        title="提交微信商户信息"
        :visible.sync="submitDialog"
        width="390px"
      >
        <div class="mar-b-18">打开微信商户平台，复制并提交微信商户信息</div>
        <el-form
          :model="wxRulerFormData"
          :rules="wxRuler"
          label-position="left"
          ref="wxRulerForm"
          label-width="120px"
          class="demo-ruleForm"
          status-icon
        >
          <div class="mar-b-18 font-w-600">公众号相关</div>
          <el-form-item label="APPID" prop="publicAppId">
            <el-input
              v-model="wxRulerFormData.publicAppId"
              autocomplete="off"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
          <el-form-item label="APPSecret" prop="publicSecret">
            <el-input
              v-model="wxRulerFormData.publicSecret"
              autocomplete="off"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
          <div class="mar-b-18 font-w-600">小程序相关</div>
          <el-form-item label="APPSecret" prop="secret">
            <el-input
              v-model="wxRulerFormData.secret"
              autocomplete="off"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
          <el-form-item label="APPID" prop="appId">
            <el-input
              v-model="wxRulerFormData.appId"
              autocomplete="off"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
          <div class="mar-b-18 font-w-600">微信商户相关</div>
          <el-form-item label="mch_id" prop="matchId">
            <el-input
              v-model="wxRulerFormData.matchId"
              autocomplete="off"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
          <el-form-item label="API密钥" prop="apiSecret">
            <el-input
              v-model="wxRulerFormData.apiSecret"
              autocomplete="off"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <base-button type="ghost" @event="submitDialog = false"
            >取消</base-button
          >
          <base-button type="primary" @event="submitWxData">确定</base-button>
        </div>
      </el-dialog>
      <!-- 填写微信信息弹窗 end-->
    </div>
  </div>
</template>
<script>
import draggable from "vuedraggable";
import _ from "lodash";
import QRCode from "qrcodejs2";
import BaseGallery from "packages/BaseGallery";

import settingMixin from "./settingShowCmp/index";
import headPhone from "@src/assets/img/myShop/headPhone.png";
import {
  getRules,
  saveRules,
  getInfos,
  saveInfos,
  weChat,
  getEventList,
} from "@src/api/LinkcApi";
import Platform from 'src/util/Platform'

export default {
  name: "do-myself-set",
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
  computed: {
    // 是否在钉钉环境
    isDingTalk() {
      return Platform.isDingTalk()
    },
    // 小程序介绍链接
    miniProgramReportlink() {
      return this.isDingTalk ? 'https://www.yuque.com/shb/help/XCX' : 'https://www.yuque.com/shb/help2/XCX'
    }
  },
  data() {
    return {
      menuList: [
        {
          name: "客户自助门户",
          icon: "icon-Gateway",
        },
        {
          name: "公众号设置",
          icon: "icon-weixin2",
        },
        {
          name: "短信消息设置",
          icon: "icon-duanxin3",
        },
        {
          name: "消息记录",
          icon: "icon-message",
        },
      ],
      nowMenu: 0,
      setData: "",
      radio: "1",
      value1: false,
      options: [
        {
          label: "上架全部备件和服务项目",
          value: true,
        },
        {
          label: "仅显示选择的备件和服务项目",
          value: false,
        },
      ],
      options_value: 1,
      dataList: [
        {
          type: "company-card",
          id: 1,
          data: {
            logoUrl: "",
            name: "",
            mobile: "",
            address: "",
            companyName: "",
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
        publicSecret: "",
      },
      wxRuler: {
        matchId: [{ required: true, message: "请输入mch_id", trigger: "blur" }],
        apiSecret: [
          { required: true, message: "请输入API密钥", trigger: "blur" },
        ],
        publicAppId: [
          { required: true, message: "请输入公众号APPID", trigger: "blur" },
        ],
        publicSecret: [
          { required: true, message: "请输入公众号密钥", trigger: "blur" },
        ],
      },
      eventList: [],
      headPhone,
    };
  },
  created() {
    this.fullscreenLoading = true;
    Promise.all([this.getSetData(), getEventList(), this.getInfos()])
      .then((res) => {
        if (res[0].status == 200) {
          this.setData = res[0].data;
          let qrcode = new QRCode(this.$refs.qrCodeUrl, {
            text: `${this.setData.protalUrl}`, // 需要转换为二维码的内容
            width: 344,
            height: 344,
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
    changePage(index) {
      if (this.nowMenu === index) {
        return;
      }
      if (index === 2) {
        window.location.href = "/setting/message/smsmessage";
      } else if (index === 0) {
        window.location.href = "/setting/doMyself/doMyselfSet";
      } else if (index === 1) {
        window.location.href = "/setting/doMyself/wxSet";
      } else if (index === 3) {
        window.location.href = "/setting/doMyself/toastList";
      }
      this.nowMenu === index;
    },
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
          // console.log(arr, "transData");
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
      // window.location = '/setting/serviceStation/markSpareGray'
      window.location.href = "/setting/serviceStation/partShop";
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
                this.setData["writeData"] = true;
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
      this.$refs.setData.saveData().then(() => {
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
      });
    },
    previewImg(url) {
      if (!url) return;
      if (url.target && url.target.nodeName == "IMG")
        return BaseGallery.preview(url.target);
      let imgDom = document.createElement("img");
      imgDom.src = url;
      BaseGallery.preview(imgDom);
    },
  },
  components: {
    draggable,
  },
};
</script>
<style lang="scss">
@import url("../../linkc/assets/public.scss");
.el-radio {
  font-weight: 400;
}
.el-switch__label {
  font-weight: 400;
}
.my-shop-box {
  min-width: 1015px;
}
.color-primary {
  color: $color-primary;
}
.color-999 {
  color: #999;
}

.el-dialog__body {
  border-top: 1px solid rgba(0, 0, 0, 0.09);
  border-bottom: 1px solid rgba(0, 0, 0, 0.09);
  padding-top: 12px;
  padding-bottom: 0;
}

.ruler-box {
  background: #fff;
  padding: 16px;
  border-radius: 4px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;

  margin-bottom: 1px;
  .ruler-set-item-title {
    margin-bottom: 13px;
    font-weight: 600;
  }
  .ruler-set-item {
    margin-bottom: 24px;
  }
}
.box-title {
  height: 46px;
  font-weight: 600;
  display: flex;
  align-items: center;
  font-size: 16px;
  border-bottom: 1px solid #ddd;
  padding: 0 12px;
  background: #fff;
}
.info-box {
  > div {
    background: #fafafa;
    padding: 16px;
  }
  margin-top: 12px;
  background: #fff;
  padding: 16px;
  border-radius: 4px;

  border-top-left-radius: 0;
  border-top-right-radius: 0;
  flex-wrap: wrap;
  margin-bottom: 12px;
  a {
    color: $color-primary;
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
        width: 155px;
        height: 155px;
        background-color: #fff; //设置白色背景色
        box-sizing: border-box;
      }
    }
    img {
      width: 155px;
      height: 155px;
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
  background: #fff;
  .setting-box-title {
  }
  .setting-show-box-tips {
    font-size: 16px;
    font-weight: 600;
    flex: 1;
  }
  .setting-show-box-submit {
    .tips {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #9ba3a1;
    }
  }
  .setting-show-box {
    justify-content: center;
    position: relative;
    border-right: 1px solid #ddd;

    padding: 20px 0;
    .menu-box-item {
      border: 1px dashed transparent;
      box-sizing: border-box;
    }
    .setting-show {
      background: url("../../../assets/img/iphoneX.png") no-repeat center 0;
      background-size: 100% 100%;
      // box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.12);
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
        .head-phone-box {
          position: relative;
          .head-phone {
            width: 100%;
            height: 69px;
          }
          .head-phone-con {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            margin: auto;
            height: 35px;
            line-height: 35px;
            text-align: center;
            font-weight: 600;
            border: 1px dashed transparent;
            border-bottom: none;
            width: 100%;
            padding: 0 30px;
          }
        }
      }
    }

    .menu-box-item-check {
      border-color: $color-primary !important;
    }
  }
  .setting-data {
    width: 330px;
    background: #fff;
    height: 691px;
    padding-top: 20px;
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
