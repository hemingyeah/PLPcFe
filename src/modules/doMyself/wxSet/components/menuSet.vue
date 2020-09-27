<template>
  <div id="menu-set-box">
    <p class="set-des">
      您可以在此将自助门户功能配置到您的公众号菜单，也可以将
      <a
        class="color-b"
        href="/setting/serviceStation/customerPortal#protalUrl"
      >客户自助门户</a>内的链接嵌入到您的公众号菜单。
      <br />在配置公众号菜单前，请先确认您的公众号已经经过认证
    </p>
    <div class="set-box">
      <!-- box-left start -->
      <div class="box-left">
        <div class="box-left-top-img">
          <img src="@src/assets/img/wx/menSetTop.png" />
        </div>
        <!-- bottom-menu start -->
        <div class="bottom-menu">
          <div class="bottom-icon">
            <img class="bottom-icon-img" src="@src/assets/img/wx/wxKey.png" />
          </div>
          <!-- move-menu-box start -->
          <draggable class="menu-box" v-model="menu_arr" v-if="edit_type===2">
            <div
              v-for="(item,index) in menu_arr"
              :key="index"
              class="menu-item can-move"
              draggable="true"
            >
              <i v-if="item.type==='add'" class="iconfont icon-add"></i>
              <p class="overHideCon_1" v-else>{{item.name}}</p>

              <draggable
                :class="[`popTopMenuBox-${index}`, 'pop-top-menu-box']"
                :group="{name:'shared'}"
                :disabled="(nowMoveBox>-1 && nowMoveBox!==index && item.sub_button.length>4)?true:false"
                v-if="item.shb_type!=='add'"
                v-model="item.sub_button"
                :fallback-on-body="true"
                swap-threshold="1"
                animation="150"
                @choose="onMenuMoveChoose"
                @unchoose="onMenuMoveUnchoose"
              >
                <div
                  v-for="(items,indexs) in item.sub_button"
                  :key="indexs"
                  class="menu-items can-move"
                  draggable="true"
                >
                  <i v-if="items.shb_type==='add'" class="iconfont icon-add"></i>
                  <p class="overHideCon_1" v-else>{{items.name}}</p>
                </div>
                <div :class="['hide_virtual',item.sub_button.length<=0?'show_virtual':'']"></div>
                <div class="arrow-css" v-if="item.sub_button.length>0"></div>
              </draggable>
            </div>
          </draggable>
          <!-- move-menu-box end -->
          <!-- menu-box start -->
          <div class="menu-box" v-if="edit_type!==2">
            <div
              v-for="(item,index) in menu_arr"
              :key="index"
              :class="main_menu_class(index)"
              @click="valid_menu_form(index)"
            >
              <i v-if="item.shb_type==='add'" class="iconfont icon-add"></i>
              <p class="overHideCon_1" v-else>{{item.name}}</p>

              <div
                class="pop-top-menu-box"
                v-if="item.shb_type!=='add' && now_main_menu===index &&item.sub_button && item.sub_button.length>0"
              >
                <div
                  v-for="(items,indexs) in item.sub_button"
                  :key="indexs"
                  :class="child_menu_class(index, indexs)"
                  @click.stop="valid_menu_form(index,indexs)"
                >
                  <i v-if="items.shb_type==='add'" class="iconfont icon-add"></i>
                  <p class="overHideCon_1" v-else>{{items.name}}</p>
                </div>
                <div class="arrow-css"></div>
              </div>
            </div>
          </div>
          <!-- menu-box end -->
        </div>
        <!-- bottom-menu end -->
      </div>
      <!-- box-left end -->
      <!-- box-right start -->
      <div class="box-right" v-show="now_chooseed_menu && edit_type===1">
        <div class="flex-x box-head">
          <p class="flex-1 overHideCon_1">{{ruleForm.name}}</p>
          <p @click="deleteMenu()">删除菜单</p>
        </div>
        <el-form
          class="menu-con-form"
          :model="ruleForm"
          :rules="rules"
          ref="ruleForm"
          label-width="100px"
          label-position="left"
        >
          <el-form-item label="菜单名称" prop="name">
            <el-input v-model="ruleForm.name" class="name-input" size="small" placeholder="菜单名称"></el-input>
            <p class="tips-con" v-if="now_chooseed_menu.indexs<0">仅支持中英文和数字，字数不超过4个汉字或8个字母</p>
            <p class="tips-con" v-else>仅支持中英文和数字，字数不超过8个汉字或16个字母</p>
          </el-form-item>
          <el-form-item label="菜单内容" prop="menuType" v-show="!now_chooseed_menu.onlyName">
            <el-radio-group v-model="ruleForm.menuType">
              <el-radio label="售后宝功能"></el-radio>
              <el-radio label="跳转页面"></el-radio>
              <el-radio label="回复文本消息"></el-radio>
            </el-radio-group>
          </el-form-item>
          <div class="menu-change-con" v-show="!now_chooseed_menu.onlyName">
            <el-radio-group
              class="change-con-radio-group"
              v-model="ruleForm.menuTypeArr"
              v-if="ruleForm.menuType==='售后宝功能'"
            >
              <p class="tips-con">选择需要为此菜单配置的售后宝功能，订阅者点击后通过登录验证将打开对应页面</p>
              <div class="flex-x change-con-radio">
                <div>
                  <el-radio label="服务请求" value="www.baidu1.com"></el-radio>
                </div>
                <div>
                  <el-radio label="服务进度" value="www.baidu2.com"></el-radio>
                </div>
              </div>
              <div class="flex-x change-con-radio">
                <div>
                  <el-radio label="服务评价" value="www.baidu3.com"></el-radio>
                </div>
                <div>
                  <el-radio label="服务商城" value="www.baidu4.com"></el-radio>
                </div>
              </div>
              <div class="flex-x change-con-radio">
                <div>
                  <el-radio label="知识库" value="www.baidu5.com"></el-radio>
                </div>
              </div>
            </el-radio-group>
            <div v-if="ruleForm.menuType==='跳转页面'">
              <p class="tips-con mar-b-12">订阅者点击该菜单会跳到以下链接</p>
              <el-form-item label="页面地址" prop="input_url" v-show="!now_chooseed_menu.onlyName">
                <el-input
                  v-model="ruleForm.input_url"
                  class="url-input"
                  size="small"
                  placeholder="请输入页面地址"
                ></el-input>
              </el-form-item>
              <!-- <div class="flex-x al-c">
                <div class="flex-x al-c">
                  <p class="font-12 mar-r-12">页面地址</p>
                </div>
                <div class="flex-1">
                  <el-input
                    v-model="ruleForm.input_url"
                    class="url-input"
                    size="small"
                    placeholder="请输入页面地址"
                  ></el-input>
                </div>
              </div>-->
            </div>

            <el-input
              v-if="ruleForm.menuType==='回复文本消息'"
              type="textarea"
              resize="none"
              maxlength="200"
              :rows="5"
              placeholder="请输入内容"
              v-model="ruleForm.reserve"
            ></el-input>
          </div>
        </el-form>
      </div>
      <!-- box-right end -->
    </div>

    <div class="bottom-btn">
      <button class="btn btn-ghost" v-if="edit_type===1" @click="change_edit_type(2)">菜单排序</button>

      <button class="btn btn-primary" v-if="edit_type===0" @click="change_edit_type(1)">编辑菜单</button>
      <button class="btn btn-primary" v-if="edit_type===0" @click="getMenuList(false)">同步菜单</button>
      <button
        class="btn btn-primary"
        v-if="edit_type===1||edit_type===2"
        @click="change_edit_type(edit_type===1?0:1,edit_type===1?true:false)"
      >{{edit_type===1?'保存并发布':'继续编辑'}}</button>
      <button class="btn btn-ghost" v-if="edit_type===1" @click="change_edit_type(0)">取消编辑</button>
    </div>
  </div>
</template>
<script>
import { getMenuListWx, setMenuListWx } from "@src/api/doMyself.js";
// 缓存数据
let menu_arr_stash = [];

let url_obj = {
  服务请求: "https://pubapp.shb.ltd/p/102308#/chooseEvent",
  服务进度: "https://pubapp.shb.ltd/p/102308#/event",
  服务评价: "https://pubapp.shb.ltd/p/102308#/event/evaluate",
  服务商城: "https://pubapp.shb.ltd/p/102308#/shop",
  知识库: "https://pubapp.shb.ltd/p/102308#/wiki",
};
let input_obj = {
  售后宝功能: "config_url",
  跳转网页: "input_url",
};
let menu_main_tem = {
  shb_type: "main_menu",
  url: "",
  input_url: "",
  config_url: "",
  type: "view",
  sub_button: [
    {
      shb_type: "add",
    },
  ],
  name: "菜单名称",
  menuType: "售后宝功能",
  menuTypeArr: "服务请求",
  url: "",
  input_url: "",
  config_url: "",
  reserve: "",
};
let menu_add_tem = {
  shb_type: "add",
};
let menu_children_tem = {
  shb_type: "children_menu",
  type: "view",
  name: "菜单名称",
  menuType: "售后宝功能",
  menuTypeArr: "服务请求",
  url: "",
  input_url: "",
  config_url: "",
  reserve: "",
  sub_button: [],
};
let form_tem = {
  name: "菜单名称",
  menuType: "售后宝功能",
  menuTypeArr: "服务请求",
  input_url: "",
  config_url: "",
  reserve: "",
};

let input_length = (rule, value, callback) => {
  if (!/^[\u4e00-\u9fa5_a-zA-Z0-9]+$/.test(value)) {
    callback(new Error("请输入正确的名称"));
  } else if (computedStrLen(value) > 8) {
    callback(new Error("字数不超过4个汉字或8个字母"));
  } else {
    callback();
  }
};
let input_length_child = (rule, value, callback) => {
  if (!/^[\u4e00-\u9fa5_a-zA-Z0-9]+$/.test(value)) {
    callback(new Error("请输入正确的名称"));
  } else if (computedStrLen(value) > 16) {
    callback(new Error("字数不超过8个汉字或16个字母"));
  } else {
    callback();
  }
};
let url_check = (rule, value, callback) => {
  if (computedStrLen(value) > 1024) {
    callback(new Error("地址不超过1024个字节"));
  } else if (/(http|https):\/\/([\w.]+\/?)\S*/.test(value)) {
    callback();
  } else {
    callback(new Error("请输入前缀是http://或https://的网址"));
  }
};

import draggable from "vuedraggable";
import _ from "lodash";
// 校验字节数
let computedStrLen = function (str) {
  let len = 0;
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    // 单字节加1
    if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
      len++;
    } else {
      len += 2;
    }
  }
  return len;
};
export default {
  name: "menu-set",
  components: {
    draggable,
  },
  props: {
    menuArr: {
      type: Array,
      default: () => [],
    },
  },
  watch: {
    ruleForm: {
      handler(newValue, oldValue) {
        if (!this.now_chooseed_menu) {
          return;
        }
        let now_menu = this.now_chooseed_menu;
        if (now_menu.indexs > -1) {
          let now_data = this.menu_arr[now_menu.index].sub_button[
            now_menu.indexs
          ];
          this.menu_arr[now_menu.index].sub_button[now_menu.indexs] = {
            ...now_data,
            ...newValue,
          };
        } else {
          let now_data = this.menu_arr[now_menu.index];
          this.menu_arr[now_menu.index] = {
            ...now_data,
            ...newValue,
          };
        }
      },
      deep: true,
      immediate: true,
    },
    edit_type: {
      handler(newValue, oldValue) {
        this.now_chooseed_menu = false;
      },
    },
  },
  data() {
    return {
      edit_type: 0, // 当前菜单的编辑方式 0 不可编辑 1 修改菜单内容模式 2 拖拽模式
      show_type: 0, // 不可编辑模式下展现第几个菜单栏
      now_main_menu: 0,
      nowMoveBox: -1, // 当某个菜单子菜单为5个时不可拖入子菜单进入
      menu_arr: [],
      ruleForm: {},
      now_chooseed_menu: false,
    };
  },
  computed: {
    rules() {
      return this.now_chooseed_menu && this.now_chooseed_menu.onlyName==1?{
            name: [
              { required: true, message: "请输入菜单名称", trigger: "change" },
              { validator: input_length_child, trigger: "change" },
            ]
          }: this.now_chooseed_menu && this.now_chooseed_menu.indexs > -1
        ? {
            name: [
              { required: true, message: "请输入菜单名称", trigger: "change" },
              { validator: input_length_child, trigger: "change" },
            ],
            input_url: [
              {
                required: true,
                message: "请输入跳转页面网址",
                trigger: "change",
              },
              { validator: url_check, trigger: "change" },
            ],
          }
        : {
            name: [
              { required: true, message: "请输入菜单名称", trigger: "change" },
              { validator: input_length, trigger: "change" },
            ],
            input_url: [
              {
                required: true,
                message: "请输入跳转页面网址",
                trigger: "change",
              },
              { validator: url_check, trigger: "change" },
            ],
          };
    },
  },
  mounted() {
    this.menu_arr = this.menuArr;
    menu_arr_stash = this.menuArr;
  },
  methods: {
    main_menu_class(index) {
      if (this.now_chooseed_menu && this.now_chooseed_menu.indexs < 0)
        return `menu-item ${this.edit_type === 1 ? "can-point" : ""} ${
          this.now_chooseed_menu.index === index ? "menu-checked" : ""
        }`;
      return `menu-item ${this.edit_type === 1 ? "can-point" : ""}`;
    },
    child_menu_class(index, indexs) {
      return [
        "menu-items",
        this.edit_type === 1 ? "can-point" : "",
        this.now_chooseed_menu
          ? this.now_chooseed_menu.index === index &&
            this.now_chooseed_menu.indexs === indexs
            ? "menu-checked"
            : ""
          : "",
      ];
    },
    pub_valid_menu() {
      return new Promise((resolve, reject) => {
        if (this.edit_type === 1 && this.now_chooseed_menu) {
          this.$refs["ruleForm"].validate((valid) => {
            if (valid) {
              resolve();
            } else {
              console.log("error submit!!");
              reject();
            }
          });
        } else {
          resolve();
        }
      });
    },
    valid_menu_form(index = 0, indexs = -1) {
      this.pub_valid_menu()
        .then(() => {
          this.main_menu_click(index, indexs);
        })
        .catch((err) => {
          console.error("valid_menu_form_error");
        });
    },
    main_menu_click(index = 0, indexs = -1) {
      let maxLength = 3;
      let _arr = this.menu_arr;
      let item = _arr[index];
      this.now_main_menu = index;

      this.resetForm("ruleForm");

      let main_tem = _.cloneDeep(menu_main_tem);
      let add_tem = _.cloneDeep(menu_add_tem);
      if (indexs > -1) {
        maxLength = 5;
        main_tem = _.cloneDeep(menu_children_tem);
        _arr = this.menu_arr[index].sub_button;
        item = _arr[indexs];
      }
      if (this.edit_type === 1) {
        if (item.shb_type === "add") {
          if (_arr.length < maxLength) {
            _arr.splice(_arr.length - 1, 1, main_tem, add_tem);
          } else {
            _arr.splice(_arr.length - 1, 1, main_tem);
          }

          this.main_menu_click(index, indexs > -1 ? indexs : -1);
        } else {
          this.now_chooseed_menu = {
            index,
            indexs,
            onlyName: !!(
              (indexs < 0 &&
                _arr[index].sub_button &&
                _arr[index].sub_button.length > 1) ||
              item.hasOwnProperty("shb_type") === false ||
              (item.hasOwnProperty("shb_type") === true &&
                item.shb_type === "system_menu")
            ),
          };
          let now_chooseed =
            indexs > -1
              ? this.menu_arr[index].sub_button[indexs]
              : this.menu_arr[index];
              this.$set(this, 'ruleForm', { ...now_chooseed })
        }
      }
    },
    // 统一将菜单参数转换成编辑模式可识别的参数
    push_add(arr = []) {
      return new Promise((resolve, reject) => {
        try {
          let arr_ = _.cloneDeep(arr);
          let add_tem = _.cloneDeep(menu_add_tem);
          arr_.map((res) => {
            if (res.sub_button) {
              if (res.sub_button.length < 5) {
                res.sub_button.push(add_tem);
              }
            } else {
              res.sub_button = [];
              res.sub_button.push(add_tem);
            }
            return res;
          });
          if (arr_.length < 3) {
            arr_.push(add_tem);
          }
          resolve(arr_);
        } catch (error) {
          reject(error);
        }
      });
    },
    // 统一将编辑模式参数转换成微信菜单可识别的参数
    slice_add(arr = []) {
      return new Promise((resolve, reject) => {
        try {
          if (arr.length <= 0) {
            resolve(arr);
          }
          let arr_ = _.cloneDeep(arr);
          // 剥离自定义的add类型菜单
          if (arr_[arr_.length - 1].shb_type === "add") {
            arr_.splice(arr_.length - 1, 1);
          }
          arr_.map((res) => {
            if (
              res.sub_button &&
              res.sub_button[res.sub_button.length - 1].shb_type === "add"
            ) {
              res.sub_button.splice(res.sub_button.length - 1, 1);
            }
            return res;
          });
          arr_.forEach((res, index) => {
            if (res.hasOwnProperty("shb_type") === true) {
              arr_[index] = this.filerArrByMenuType(arr_[index]);
            }
            if (res.sub_button && res.sub_button.length > 0) {
              res.sub_button.forEach((res_, index_) => {
                if (res_.hasOwnProperty("shb_type") === true) {
                  arr_[index].sub_button[index_] = this.filerArrByMenuType(
                    arr_[index].sub_button[index_]
                  );
                }
              });
            }
          });
          resolve(arr_);
        } catch (error) {
          reject(error);
        }
      });
    },
    filerArrByMenuType(res) {
      let obj = {
        售后宝功能: {
          url: "", // 后台自己填数据
          config_url: res.config_url,
          input_url: "",
          type: "view",
          reserve: "",
        },
        跳转页面: {
          url: res.input_url,
          config_url: "",
          input_url: res.input_url,
          type: "view",
          reserve: "",
        },
        回复文本消息: {
          url: "",
          config_url: "",
          input_url: "",
          reserve: res.reserve,
          value: res.reserve,
          type: "click",
        },
      };
      return { ...res, ...obj[res.menuType] };
    },
    change_edit_type(type, save = false) {
      if (type === this.edit_type) {
        return;
      }
      this.now_main_menu = 0;
      if (save) {
        this.pub_valid_menu()
          .then(() => {
            if (type === 1) {
              this.push_add(this.menu_arr).then((res) => {
                this.menu_arr = res;
              });
            } else {
              this.slice_add(this.menu_arr).then((res) => {
                this.$emit("pageLoading", true);
                this.setMenuList(res).then((res_) => {
                  if (res_.success) {
                    let result_ = JSON.parse(res_.data.wechatMenu).menu.button
                    this.menu_arr = result_;
                    menu_arr_stash = _.cloneDeep(result_);
                    this.$emit("changeMenuArr", result_);
                    this.$emit("pageLoading", false);
                  } else {
                    this.$platform.alert(res_.message);
                  }
                });
              });
            }
            this.edit_type = type;
          })
          .catch((err) => {
            console.error("change_edit_type error", err);
          });
      } else {
        if (type === 1) {
          this.push_add(this.menu_arr).then((res) => {
            this.menu_arr = res;
          });
        } else {
          this.slice_add(this.menu_arr).then((res) => {
            this.menu_arr = res;

            if (type === 0) this.menu_arr = _.cloneDeep(menu_arr_stash);
          });
        }
        this.edit_type = type;
      }
    },
    resetForm(formName) {
      this.now_chooseed_menu = false;
      this[formName] = _.cloneDeep(form_tem);
      this.$refs[formName].clearValidate();
    },
    async deleteMenu() {
      if (!this.now_chooseed_menu) return;
      let now_chooseed_menu = this.now_chooseed_menu;
      let add_tem = _.cloneDeep(menu_add_tem);
      if (now_chooseed_menu.indexs > -1) {
        // 删除子菜单
        const alert_res = await this.$platform.confirm(
          `删除后${this.ruleForm.name}菜单下设置的内容将被删除`
        );
        if (!alert_res) return;
        this.menu_arr[now_chooseed_menu.index].sub_button.splice(
          now_chooseed_menu.indexs,
          1
        );
        let length = this.menu_arr[now_chooseed_menu.index].sub_button.length;
        if (
          length < 5 &&
          (this.menu_arr[now_chooseed_menu.index].sub_button[
            length - 1
          ].hasOwnProperty("shb_type") === false ||
            this.menu_arr[now_chooseed_menu.index].sub_button[length - 1]
              .shb_type !== "add")
        ) {
          this.menu_arr[now_chooseed_menu.index].sub_button.push(add_tem);
        }
      } else {
        // 删除主菜单 需要提示风险
        const alert_res = await this.$platform.confirm(
          `删除后${this.ruleForm.name}菜单下设置的内容将被删除`
        );
        if (!alert_res) return;
        this.menu_arr.splice(now_chooseed_menu.index, 1);
        console.log(this.menu_arr);
        let length = this.menu_arr.length;
        if (
          length < 3 &&
          (this.menu_arr[length - 1].hasOwnProperty("shb_type") === false ||
            this.menu_arr[length - 1].shb_type !== "add")
        ) {
          this.menu_arr.push(add_tem);
        }
      }
      this.resetForm("ruleForm");
    },
    getMenuList(type = true) {
      // this.$emit("pageLoading", true);
      // URL 本地调试 无/api/weixin  发布需加上
      getMenuListWx({
        type,
      })
        .then((res) => {
          let result = res.data.wechatMenu
            ? JSON.parse(res.data.wechatMenu).menu.button
            : [];
          // 微信菜单数据转换成我们识别的数据
          this.menu_arr = result;
          menu_arr_stash = this.menu_arr;
          this.$emit("changeMenuArr", result);

          setTimeout(() => {
            this.$emit("pageLoading", false);
          }, 500);
          console.log("getSuccess", result, res);
        })
        .catch((err) => {
          this.$emit("pageLoading", false);
        });
    },
    setMenuList(data) {
      return setMenuListWx({
        wechatMenu: JSON.stringify({ menu: { button: data } }),
      });
    },
    onMenuMoveChoose(e) {
      let nowIndex = e.from.classList[0].split("-")[1];
      this.nowMoveBox = nowIndex * 1;
    },
    onMenuMoveUnchoose() {
      this.nowMoveBox = -1;
    },
  },
};
</script>
<style lang="scss" scoped>
.overHideCon_1 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-all;
}
.set-des {
  font-size: 14px;
  color: #000;
  margin-bottom: 25px;
  a {
    text-decoration: none;
  }
}
.color-b {
  color: #3aa7ff;
}
.set-box {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  .box-left {
    width: 290px;
    min-width: 290px;
    height: 516px;
    min-height: 516px;
    border: 1px solid rgba(226, 226, 226, 1);
    box-sizing: border-box;
    border-top: none;
    background: #fff;
    margin-left: 11px;
    margin-right: 40px;
    position: relative;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    .box-left-top-img {
      width: 290px;
      height: 69px;
      position: absolute;
      top: 0;
      left: -1px;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .bottom-menu {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      display: flex;
      height: 41px;
      background: #f7f8f9;
      border-top: 1px solid rgba(226, 226, 226, 1);
      box-sizing: border-box;
      .bottom-icon-img {
        width: 20px;
        height: 20px;
      }
      .bottom-icon {
        width: 24px;
        height: 100%;
        display: flex;
        align-items: center;
        border-right: 1px solid rgba(226, 226, 226, 1);
        justify-content: center;
      }
      .menu-box {
        flex: 1;
        height: 100%;
        display: flex;
        .menu-item:not(:last-child) {
          border-right: 1px solid rgba(226, 226, 226, 1);
        }
        .can-move {
          cursor: move;
        }
        .can-point {
          cursor: pointer;
        }
        .menu-checked {
          outline: 1px solid #55b7b4;
        }
        .menu-item {
          position: relative;
          display: flex;
          box-sizing: border-box;
          flex: 1;
          justify-content: center;
          align-items: center;
          padding: 0 5px;
          > p {
            font-size: 12px;
          }
          .hide_virtual {
            display: none;
          }
          .show_virtual {
            height: 41px;
            width: 100%;
            outline: 1px dotted #55b7b4;
            display: block;
            margin-bottom: 2px;
            position: absolute;
            bottom: 0;
            z-index: 98;
          }
          .pop-top-menu-box {
            width: 98%;
            position: absolute;
            z-index: 98;
            left: 0;
            right: 0;
            margin: auto;
            bottom: 122.5%;
            display: flex;
            flex-direction: column;
            .arrow-css {
              width: 0;
              height: 0;
              border-width: 6px;
              border-style: solid;
              border-color: #f7f8f9 transparent transparent transparent;
              position: absolute;
              z-index: 97;
              left: 0;
              right: 0;
              margin: auto;
              bottom: -10px;
            }
            .menu-items:last-child {
              margin-bottom: none;
            }
            .menu-items {
              position: relative;
              z-index: 98;
              height: 41px;
              color: #000;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 0 5px;
              background: #f7f8f9;
              margin-bottom: 2px;
              > p {
                font-size: 12px;
              }
            }
          }
        }
      }
    }
  }
  .box-right {
    width: 540px;
    height: 377px;
    min-width: 540px;
    min-height: 377px;
    background: #f7f8f9;
    border: 1px solid rgba(226, 226, 226, 1);
    box-sizing: border-box;
    .el-radio {
      font-weight: 400;
    }
    .box-head {
      height: 50px;
      border-bottom: 1px solid #e2e2e2;
      align-items: center;
      padding: 0 20px;
      p {
        font-size: 12px;
      }
      p:last-child {
        color: #ff4d4f;
        cursor: pointer;
      }
    }
    .menu-con-form {
      padding: 15px 20px 0;
      .el-form-item--small.el-form-item {
        margin-bottom: 22px;
      }
      .url-input {
        width: 344px;
      }
      .el-form-item {
        .name-input {
          width: 160px;
        }
        label {
          font-size: 12px;
        }
        .el-radio__label {
          font-size: 14px;
        }
      }
      .tips-con {
        font-size: 12px;
        color: #999;
      }
    }
    .menu-change-con {
      width: 500px;
      height: 136px;
      min-width: 500px;
      min-height: 136px;
      border: 1px solid rgba(226, 226, 226, 1);
      padding: 10px;
      .change-con-radio-group {
        .change-con-radio {
          div {
            flex: 1;
            text-align: left;
            margin-top: 12px;
          }
        }
      }
    }
  }
}
.bottom-btn {
  .btn:not(:first-child) {
    margin-left: 30px;
  }
}
</style>