<template>
  <div id="doMyself-components-box" v-loading.fullscreen.lock="fullscreenLoading">
    <div class="top-state" v-if="haveWx===0">
      <div>
        <h2>绑定公众号</h2>
        <p>您尚未绑定公众号，绑定前请确认您的公众号为已认证的公众号</p>
        <div class="wx-img">
          <img src="../../../assets/img/wx/wxDefault.png" alt />
        </div>
        <button type="submit" class="btn btn-primary" @click="concatWx">绑定公众号</button>
      </div>
    </div>

    <div v-else-if="haveWx===1">
      <div class="top-menu">
        <nav :class="topType===0?'nav-checked':''" @click="topType=0">绑定公众号</nav>
        <nav :class="topType===1?'nav-checked':''" @click="topType=1">公众号通知</nav>
      </div>
      <div class="menu-set-box" v-if="topType===0">
        <div class="top-state">
          <div>
            <h2>绑定公众号</h2>
            <div class="wx-con">
              <div class="wx-img">
                <img
                  v-show="wxInfo.headImg === null"
                  src="../../../assets/img/wx/wxDefault.png"
                  alt
                />
                <img v-show="wxInfo.headImg !== null" :src="wxInfo.headImg" alt />
              </div>
              <div>
                <p>昵称：{{wxInfo.nickName}}</p>
                <p>主体名称：{{wxInfo.principalName}}</p>
              </div>
            </div>
            <button type="submit" class="btn btn-ghost cancel-wx" @click="desertWx">解除绑定</button>
          </div>
        </div>
        <div class="top-state">
          <menu-set @pageLoading="pageLoading" :menu-arr="menuArr" @changeMenuArr="changeMenuArr"></menu-set>
        </div>
      </div>
      <div v-if="topType==1">
        <div class="top-state">
          <!-- 通知设置 start -->
          <div>
            <h2>通知设置</h2>
            <div :class="totalActive===true?'mar-b-10 set-arr-item':'set-arr-item'">
              <div class="set-arr-item-left">
                <!-- <el-tooltip class="item" effect="dark" content="启用公众号通知" placement="bottom"> -->
                <div class="item">
                  <span>启用公众号通知</span>
                </div>
                <!-- </el-tooltip> -->
                <p>开启后，允许通过公众号为用户推送消息通知</p>
              </div>
              <div class="flex-1"></div>
              <div class="set-arr-item-right">
                <div class="flex-1"></div>
                <el-switch
                  v-model="totalActive"
                  active-color="#55b7b4"
                  inactive-color="#B8BEBC"
                  :active-text="totalActive?'开启':'关闭'"
                  :active-value="true"
                  :inactive-value="false"
                  @change="mainChange"
                ></el-switch>
              </div>
            </div>

            <div class="set-arr-box" v-show="totalActive===true">
              <div class="set-arr-item" v-for="(item,index) in toastSetArr" :key="index">
                <div class="set-arr-item-left">
                  <div class="item">
                    <!-- <el-tooltip class="item" effect="dark" :content="{{item.title}}" placement="bottom"> -->
                    <span>{{item.title}}</span>
                    <!-- <i class="iconfont icon-info mar-l-10"></i> -->

                    <!-- </el-tooltip> -->
                  </div>
                  <p v-if="item.time===null">{{item.childTitle}}</p>
                  <div class="small-form" v-else>
                    在计划时间到期前
                    <el-input
                      :disabled="item.radius?false:true"
                      v-model="item.time"
                      style="padding:none;display: inline;"
                      @input="inputTime"
                      type="number"
                    />小时发送消息提醒客户，为空时不提醒
                  </div>
                </div>
                <div class="flex-1"></div>
                <set-arr-item-right
                  :disabled="item.radius>0?false:true"
                  :item-data="item"
                  :item-index="index"
                  @pageLoading="pageLoading"
                ></set-arr-item-right>
              </div>
            </div>
          </div>
          <!-- 通知设置 end -->
          <toast-template v-if="totalActive===true" @pageLoading="pageLoading"></toast-template>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import menuSet from './components/menuSet';
import toastTemplate from './components/toastTemplate';
import setArrItemRight from './components/setArrItemRight';
import {
  getAuthInfoWX,
  saveWxMessage,
  eventTypeList,
  taskTypeList,
  saveSendTime,
  cancleAuthorizer
} from '@src/api/DoMyself.js';
import { Message } from 'shb-element-ui';
let loadKeyArr = [];
let loadTypeArr = [];
let setRaduisArr = [
  'smsEventAllot',
  'smsEventFinish',
  'smsTaskResponse',
  'smsTaskFinish',
  'taskPlanTimeRemind'
];
let setSelectArr = [
  'eventAllotEventTypeList',
  'eventFinishEventTypeList',
  'taskResponseTaskTypeList',
  'taskFinishTaskTypeList',
  'taskPlanTimeTaskTypeList'
];
let timeOut;
let inputTimeOut;
export default {
  name: 'wx-set',
  watch: {
    topType: {
      handler(newValue, oldValue) {},
      deep: true,
      immediate: true
    }
  },
  data() {
    return {
      topType: 0, // 微信设置顶部切换 0 绑定公众号 1 公众号通知
      haveWx: -1,
      concatWxUrl: '', // 授权微信公众号的链接
      totalActive: false,
      fullscreenLoading: false, // 整屏loading
      wxInfo: {},
      toastSetArr: [
        {
          title: '事件分配通知',
          childTitle: '当事件被分配时,发送给客户联系人',
          options: [],
          select: [],
          pleasHolder: '全部事件类型',
          radius: false,
          time: null
        },
        {
          title: '事件完成通知',
          childTitle: '当事件被标记为完成时,发送给客户联系人',
          options: [],
          select: [],
          pleasHolder: '全部事件类型',
          radius: false,
          time: null
        },
        {
          title: '工单响应通知',
          childTitle: '当工单被接收时,发送给客户联系人',
          options: [],
          select: [],
          pleasHolder: '全部工单类型',
          radius: false,
          time: null
        },
        {
          title: '工单完成通知',
          childTitle: '进行中的工单被标记为完成时,发送给客户联系人',
          options: [],
          select: [],
          pleasHolder: '全部工单类型',
          radius: false,
          time: null
        },
        {
          title: '工单计划时间提醒客户',
          options: [],
          select: [],
          pleasHolder: '全部工单类型',
          radius: false,
          time: ''
        }
      ],
      eventArr: [],
      taskArr: [],
      timeInputing: 0,
      scanQrCode: false,
      menuArr: []
    };
  },
  computed: {},
  created() {
    sessionStorage.removeItem('wx_auth_auth_page_close');
    this.getWxInfo();
  },
  methods: {
    pageLoading(data = false) {
      if (this.fullscreenLoading === data) return;
      this.fullscreenLoading = data;
    },
    getWxInfo() {
      if (sessionStorage.getItem('wx_auth_auth_page_close') === 'true') {
        this.scanQrCode = false;
        sessionStorage.removeItem('wx_auth_auth_page_close');
        return;
      }
      if (!this.scanQrCode) {
        // 如果是轮询不需要loading 加载动画
        this.pageLoading(true);
      }

      getAuthInfoWX()
        .then(res => {
          if (res.data.status === 0) {
            // 未绑定公众号
            this.haveWx = 0;
            this.concatWxUrl = res.data.mpAuthorizeUrl;
            if (this.scanQrCode === true) {
              timeOut = setTimeout(() => {
                this.getWxInfo();
              }, 2500);
            }
            return;
          } else if (res.data.status === 2) {
            clearTimeout(timeOut);
            // 未绑定公众号
            this.haveWx = 0;
            this.scanQrCode = false;
            this.$platform.closeTab('wx_auth');
            this.$platform.alert(res.data.message || '系统错误');
            return;
          } else if (res.data.status === 3) {
            clearTimeout(timeOut);
            // 未绑定公众号
            this.haveWx = 0;
            this.scanQrCode = false;
            this.$platform.closeTab('wx_auth');
            this.$platform.alert(res.data.message || '系统错误');
            return;
          }
          this.haveWx = 1;
          if (this.scanQrCode) {
            this.$platform.closeTab('wx_auth');
          }
          this.scanQrCode = false;
          this.wxInfo = res.data.data;
          this.menuArr = res.data.data.wechatMenu
            ? JSON.parse(res.data.data.wechatMenu).menu.button
            : [];
          if (res.data.eventTypeList) {
            let arr = res.data.eventTypeList.map(res => {
              return { label: res.name, value: res.id };
            });
            this.toastSetArr[0].options = arr;
            this.toastSetArr[1].options = arr;
          }
          if (res.data.taskTypeList) {
            let arr = res.data.taskTypeList.map(res => {
              return { label: res.name, value: res.id };
            });
            this.toastSetArr[2].options = arr;
            this.toastSetArr[3].options = arr;
            this.toastSetArr[4].options = arr;
          }
          if (res.data.wxTemplateMessageConfig) {
            let wxToast = res.data.wxTemplateMessageConfig;
            this.totalActive = wxToast.wxRemindMaster;
            for (let i = 0; i < this.toastSetArr.length; i++) {
              this.toastSetArr[i].radius = wxToast[setRaduisArr[i]];
              if (wxToast[setSelectArr[i]].length > 0) {
                this.toastSetArr[i].select = wxToast[setSelectArr[i]];
              }
              if (i === 4 && wxToast.reportSendTime) {
                this.toastSetArr[i].time = wxToast.reportSendTime;
              }
            }
          }
        })
        .catch(err => {
          console.log(err, 'erro');
        })
        .finally(res => {
          this.pageLoading(false);
        });
    },
    async mainChange(e) {
      this.totalActive = !e;
      if (e === true) {
        if (this.wxInfo.serviceTypeInfo != 2) {
          return this.$platform.alert(
            '您的公众号不是认证服务号，无法开启该功能。若要使用该功能，请绑定认证服务号。'
          );
        }
        const res_plat = await this.$platform.confirm(
          '请确认：开启后，如果您原本就有消息模板，它们将会被去除。'
        );
        if (!res_plat) return;
      }
      this.pageLoading(true);
      saveWxMessage({
        message: 'wxRemindMaster',
        state: e
      })
        .then(res => {
          if (res.success === true) {
            this.totalActive = e;
          }
          this.pageLoading(false);
          // Promise.all([this.eventGet(), this.taskGet()]).then(res => {
          //   this.pageLoading(false);
          // });
        })
        .catch(err => {});
    },
    eventGet() {
      return new Promise((resolve, reject) => {
        eventTypeList().then(res => {
          let arr = res.data.map(res => {
            return { label: res.name, value: res.id };
          });
          this.toastSetArr[0].options = arr;
          this.toastSetArr[1].options = arr;
          resolve();
        });
      });
    },
    taskGet() {
      return new Promise((resolve, reject) => {
        taskTypeList().then(res => {
          let arr = res.data.map(res => {
            return { label: res.name, value: res.id };
          });
          this.toastSetArr[2].options = arr;
          this.toastSetArr[3].options = arr;
          this.toastSetArr[4].options = arr;
          resolve();
        });
      });
    },
    inputTime(e) {
      clearTimeout(inputTimeOut);
      inputTimeOut = setTimeout(() => {
        if (!/^(([0-9]+)|([0-9]+\.[0-9]{0,2}))$/.test(e)) {
          this.$platform.alert('时间需为正数且最多保留两位小数');
          this.toastSetArr[4].time = '';
          return;
        }
        saveSendTime({
          reportSendTime: this.toastSetArr[4].time
        }).then(res => {});
      }, 1500);
    },
    concatWx() {
      if (this.scanQrCode) {
        return;
      }
      this.scanQrCode = true;
      let fromId = window.frameElement.getAttribute('id');
      this.$platform.openTab({
        id: 'wx_auth',
        title: '微信授权',
        url: this.concatWxUrl,
        reload: true,
        close: true,
        fromId
      });
      // this.$platform.openLink(this.concatWxUrl);
      this.getWxInfo();
    },
    async desertWx() {
      try {
        const res_ = await this.$platform.confirm(
          `您将要解除${this.wxInfo.nickName}公众号的绑定，请确认。`
        );
        if (!res_) return;
        cancleAuthorizer()
          .then(res => {
            this.pageLoading(false);
            this.getWxInfo();
            Message.success({
              message: '成功解除绑定',
              type: 'success'
            });
          })
          .catch(err => {
            this.$platform.alert(err);
          });

        // this.$eventBus.$emit("customer_info_record.update_record_list");
      } catch (e) {
        console.error(e, 'err');
      }
    },
    changeMenuArr(e) {
      this.menuArr = e;
    }
  },
  beforeDestroy() {
    clearTimeout(timeOut);
  },
  components: {
    [menuSet.name]: menuSet,
    [toastTemplate.name]: toastTemplate,
    [setArrItemRight.name]: setArrItemRight
  }
};
</script>
<style lang="scss">
p {
  font-size: 16px;
  margin: 0;
  padding: 0;
}
.mar-b-10 {
  margin-bottom: 10px;
}
.mar-l-10 {
  margin-left: 10px;
}
.mar-r-15 {
  margin-right: 15px;
}
.color-g {
  color: #55b7b4;
}
.top-menu {
  background: #fff;
  box-sizing: border-box;
  padding: 10px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  nav {
    width: 194px;
    height: 35px;
    text-align: center;
    line-height: 35px;
    font-size: 12px;
    border: 1px solid #d2d6de;
    overflow: hidden;
    position: relative;
    cursor: pointer;
  }
  nav:nth-child(1) {
    border-right: none;
    border-top-left-radius: 2px;
    border-bottom-left-radius: 2px;
  }
  nav:last-child {
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
  }
  .nav-checked {
    background: #55b7b4;
    border-color: #55b7b4;
    color: #fff;
  }
}

.menu-set-box {
  > .top-state:not(:last-child) {
    margin-bottom: 10px;
  }
}
.top-state {
  box-sizing: border-box;

  h2 {
    font-size: 16px;
  }
  > div {
    background: #fff;

    padding: 15px 20px;
    box-sizing: border-box;
  }
  > div:not(:last-child) {
    margin-bottom: 20px;
  }
  .wx-con {
    display: flex;
    align-items: center;
    line-height: 22px;
  }
  .wx-img {
    width: 80px;
    height: 80px;
    position: relative;
    margin: 24px 44px 24px 0;
  }
  .cancel-wx {
  }

  .table-footer {
    background: #fff;
    border-radius: 0 0 3px 3px;

    display: flex;
    justify-content: space-between;

    padding: 0px 10px 10px 10px;

    .list-info {
      color: #767e89;

      font-size: 13px;
      line-height: 32px;

      margin: 0;

      .iconfont {
        position: relative;
        top: 1px;
      }
    }

    .el-pagination__jump {
      margin-left: 0;
    }
  }

  .set-arr-item {
    display: flex;
    border-bottom: 10px;
    .set-arr-item-left {
      min-width: 390px;
      .small-form {
        font-size: 12px;
        margin-top: 10px;
        input {
          width: 40px;
          height: 20px;
          font-size: 12px;
          padding: 1px;
          text-align: center;
        }
      }
      span {
        font-size: 14px;
        font-weight: 600;
        // cursor: pointer;
      }

      p:last-child {
        font-size: 12px;
        margin-top: 10px;
      }
    }

    .set-arr-item-right {
      display: flex;
      width: 400px;
      min-width: 400px;
      align-items: center;
      p:first-child {
        font-size: 14px;
      }
    }
  }
  .set-arr-box .set-arr-item:not(:last-child) {
    margin-bottom: 10px;
  }
}
.el-switch__label {
  color: #b8bebc;
}
</style>