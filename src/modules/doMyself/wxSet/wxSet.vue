<template>
  <div id="doMyself-components-box">
    <div class="top-state" v-if="!haveWx">
      <h2>绑定公众号</h2>
      <div>
        <p>您尚未绑定公众号，绑定前请确认您的公众号为已认证的公众号</p>
        <div class="wx-img">
          <img src="../../../assets/img/avatar.png" alt />
        </div>
        <button type="submit" class="btn btn-primary">绑定公众号</button>
      </div>
    </div>

    <div v-else>
      <div class="top-menu">
        <nav :class="topType===0?'nav-checked':''" @click="topType=0">绑定公众号</nav>
        <nav :class="topType===1?'nav-checked':''" @click="topType=1">公众号通知</nav>
      </div>
      <div class="menu-set-box" v-show="topType===0">
        <div class="top-state">
          <h2>绑定公众号</h2>
          <div>
            <div class="wx-con">
              <div class="wx-img">
                <img src="../../../assets/img/avatar.png" alt />
              </div>
              <div>
                <p>昵称：</p>
                <p>主体名称：</p>
              </div>
            </div>
            <button type="submit" class="btn btn-ghost cancel-wx">解除绑定</button>
          </div>
        </div>
        <div class="top-state">
          <menu-set></menu-set>
        </div>
      </div>
      <div v-show="topType==1">
        <div class="top-state">
          <!-- 通知设置 start -->
          <div>
            <h2>通知设置</h2>
            <div :class="totalActive===true?'mar-b-10 set-arr-item':'set-arr-item'">
              <div class="set-arr-item-left">
                <el-tooltip class="item" effect="dark" content="启用公众号通知" placement="bottom">
                  <span>启用公众号通知</span>
                </el-tooltip>
                <p>开启后，允许通过公众号为用户推送消息通知</p>
              </div>
              <div class="flex-1"></div>
              <div class="set-arr-item-right">
                <div class="flex-1"></div>

                <el-tooltip :content="'当前状态:' + (totalActive===true?'开启':'禁止')" placement="top">
                  <el-switch
                    v-model="totalActive"
                    active-color="#55b7b4"
                    inactive-color="#999"
                    :active-value="true"
                    :inactive-value="false"
                  ></el-switch>
                </el-tooltip>
              </div>
            </div>

            <div class="set-arr-box" v-show="totalActive===true">
              <div class="set-arr-item" v-for="(item,index) in toastSetArr" :key="index">
                <div class="set-arr-item-left">
                  <el-tooltip class="item" effect="dark" content="启用公众号通知" placement="bottom">
                    <span>{{item.title}}</span>
                  </el-tooltip>
                  <p v-if="item.time===null">{{item.childTitle}}</p>
                  <div class="small-form" v-else>
                    在计划时间到期前
                    <input :value="item.time" style="padding:none;" />小时发送消息提醒客户，为空时不提醒
                  </div>
                </div>
                <div class="flex-1"></div>
                <div class="set-arr-item-right">
                  <p>应用范围：</p>
                  <el-select
                    class="flex-1 mar-r-15"
                    v-model="item.select"
                    multiple
                    collapse-tags
                    :disabled="item.radius>0?false:true"
                    style="margin-left: 20px;"
                    :placeholder="item.pleasHolder"
                  >
                    <el-option
                      v-for="items in item.options"
                      :key="items.value"
                      :label="items.label"
                      :value="items.value"
                    ></el-option>
                  </el-select>
                  <el-tooltip :content="'当前状态:' + (item.radius>0?'开启':'禁止')" placement="top">
                    <el-switch
                      v-model="item.radius"
                      active-color="#55b7b4"
                      inactive-color="#999"
                      active-value="100"
                      inactive-value="0"
                    ></el-switch>
                  </el-tooltip>
                </div>
              </div>
            </div>
          </div>
          <!-- 通知设置 end -->
          <toast-template></toast-template>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import menuSet from "./components/menuSet";
import toastTemplate from "./components/toastTemplate";
export default {
  name: "wx-set",
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
      haveWx: true,
      totalActive: true,
      toastSetArr: [
        {
          title: "事件分配通知",
          childTitle: "当事件被分配时,发送给客户联系人",
          options: [
            {
              value: "选项1",
              label: "黄金糕"
            },
            {
              value: "选项2",
              label: "双皮奶"
            },
            {
              value: "选项3",
              label: "蚵仔煎"
            },
            {
              value: "选项4",
              label: "龙须面"
            },
            {
              value: "选项5",
              label: "北京烤鸭"
            }
          ],
          pleasHolder: "全部事件类型",
          radius: 0,
          time: null
        },
        {
          title: "事件完成通知",
          childTitle: "当事件被标记为完成时,发送给客户联系人",
          options: [],
          select: 0,
          pleasHolder: "全部事件类型",
          radius: 0,
          time: null
        },
        {
          title: "工单响应通知",
          childTitle: "当工单被接收时,发送给客户联系人",
          options: [],
          select: 0,
          pleasHolder: "全部工单类型",
          radius: 0,
          time: null
        },
        {
          title: "工单完成通知",
          childTitle: "进行中的工单被标记为完成时,发送给客户联系人",
          options: [],
          select: 0,
          pleasHolder: "全部工单类型",
          radius: 0,
          time: null
        },
        {
          title: "工单计划时间提醒客户",
          options: [],
          select: 0,
          pleasHolder: "全部工单类型",
          radius: 0,
          time: ""
        }
      ]
    };
  },
  components: {
    [menuSet.name]: menuSet,
    [toastTemplate.name]: toastTemplate
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
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  nav {
    width: 194px;
    height: 35px;
    text-align: center;
    line-height: 35px;
    font-size: 12px;
    border: 1px solid #d2d6de;
    overflow: hidden;
    position: relative;
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
    margin-bottom: 20px;
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
    margin: 24px 44px 24px 24px;
  }
  .cancel-wx {
    margin-left: 24px;
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
          width: 30px;
          height: 20px;
          font-size: 12px;
          padding: 1px;
          text-align: center;
        }
      }
      span {
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
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
</style>