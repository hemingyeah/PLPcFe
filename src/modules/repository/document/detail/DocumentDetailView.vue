<template>
  <div
    class="document-list-detail"
    :style="{height: height}"
    v-if="detailShow"
    v-loading.fullscreen.lock="loading"
  >
    <template v-if="detail && detail.title">
      <!-- 详情头部 -->
      <div class="detail-top">
        <div class="author-container">
          <div class="author">
            <img class="author-img" :src="detail.createUserHead" v-if="detail.createUserHead" />
            <img class="author-img" src="../../../../assets/img/avatar.png" v-else />
            <div class="author-info">
              <p class="name">{{detail.createUserName}}</p>
              <p class="time">创建于：{{detail.createTimeShow | fmt_datehour}}</p>
            </div>
          </div>

          <div class="author right" v-if="detail.createTime != detail.updateTime">
            <img class="author-img" :src="detail.updateUserHead" v-if="detail.updateUserHead" />
            <img class="author-img" src="../../../../assets/img/avatar.png" v-else />
            <div class="author-info">
              <p class="name">{{detail.updateUserName}}</p>
              <p class="time">更新于：{{detail.updateTimeShow | fmt_datehour}}</p>
            </div>
          </div>
        </div>

        <div class="operating" v-if="!isReview">
          <div class="draftBox" v-if="detail.examineState && detail.examineState != 0">
            <el-tag
              :type="detail.examineState == 1 ? '' : 'danger'"
            >{{detail.examineState == 1 ? '待审核' : '已拒绝'}}</el-tag>
          </div>

          <div style="display: inline-block">
            <span class="management" v-if="detail.examineState != 1 && allowEdit">
              <i class="iconfont icon-bianji icon-operating" @click="editArticle()"></i>
              <i
                class="iconfont icon-qingkongshanchu icon-operating"
                @click="deleteArticle();trackEventHandler('detele')"
              ></i>
            </span>

            <span
              class="share"
              v-if="!detail.isDraft && allowEdit"
              @click="shareDocument();trackEventHandler('share')"
            >
              <i class="iconfont icon-share icon-article-share"></i>
            </span>

            <span
              class="open"
              v-if="allowEdit && linkControl"
              @click="changeRelease();trackEventHandler('share')"
            >
              <i class="iconfont icon-quanziguanli icon-article-share" style="margin-right:4px"></i>
              {{detail.circleState == 1 ? '取消发布' : '发布到圈子'}}
            </span>

            <span class="open" @click="openFrame();trackEventHandler('open')" v-if="isList">新页面打开</span>

            <button
              class="base-button green-btn"
              @click="approve"
              v-if="showDetailApprove && detail.examineState == 1"
            >审批</button>
            <button
              class="base-button green-btn"
              @click="revoke"
              v-if="detail.examineState == 1 && revokeShow"
              style="margin-left:5px"
            >撤回审批</button>
          </div>
        </div>

        <div class="operating" v-else>
          <button class="base-button green-btn" @click="approve">审批</button>
          <button
            class="base-button green-btn"
            @click="revoke"
            v-if="revokeShow"
            style="margin-left:5px"
          >撤回审批</button>
        </div>
      </div>

      <!-- 文章详情 -->
      <div class="detail-content" :style="{padding: padding}">
        <div class="info">
          <p class="title">{{detail.title}}</p>
          <div class="ql-container ql-snow content" :class="fontClass" style="border:none">
            <div class="ql-editor">
              <div v-html="detail.content" class="wiki-content"></div>
            </div>
          </div>
        </div>
        <!-- 详情页脚部分 -->
        <div
          class="footer"
          v-if="(detail.label && detail.label.length > 0) || (detail.attachment && detail.attachment.length > 0)"
        >
          <div class="tags" v-if="detail.label && detail.label.length > 0">
            <i class="iconfont icon-tag icon-tags"></i>
            <el-tag class="detail-tag" v-for="(tag,index) in detail.label" :key="index">{{tag}}</el-tag>
          </div>

          <div class="annex" v-if="detail.attachment && detail.attachment.length > 0">
            <span class="annex-left">附件：</span>
            <div class="annex-right">
              <div class="base-comment-attachment base-file__preview">
                <base-file-item
                  v-for="file in detail.attachment"
                  :key="file.id"
                  :file="file"
                  size="small"
                ></base-file-item>
              </div>
            </div>
          </div>
        </div>
      </div>

      <base-modal class="type-modal" width="400px" :show.sync="shareBoxShow" title=" ">
        <div>
          <p>请选择分享方式</p>
        </div>

        <div slot="footer" class="edit-footer">
          <el-button @click="inlineShare">对内分享</el-button>
          <el-button type="primary" class="green-btn" @click="outlineShare">对外分享</el-button>
        </div>
      </base-modal>

      <approve-dialog :approve-data="approveData" ref="approveDialog" />
    </template>
  </div>
  <div v-else class="document-list-detail empty">
    <div>
      <img class="empty-img" src="../../../../assets/img/empty.png" />
    </div>
    <span class="empty-msg">{{deleteMsg || '暂无数据'}}</span>
  </div>
</template>

<script>
import * as RepositoryApi from "@src/api/Repository";
import * as Lang from "@src/util/lang/index.js";

import ApproveDialog from "./component/ApproveDialog.vue";
import Clipboard from "clipboard";

export default {
  name: "document-detail",
  props: {
    info: {
      type: Object,
      default: () => ({}),
    },
    initData: {
      type: Object,
      default: () => ({}),
    },
    infoEdit: {
      type: Object,
      default: () => ({}),
    },
    isList: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    [ApproveDialog.name]: ApproveDialog,
  },
  data() {
    return {
      allowEdit: false,
      form: this.buildForm(), // 附件存储格式
      wikiId: "", // 通知公告id
      showDetailApprove: false,
      approveData: {},
      isReview: false,
      refuseInfo: {
        text: "",
      },
      show: false,
      shareBoxShow: false,
      rules: {
        text: [
          {
            required: true,
            message: "请输入拒绝原因",
            trigger: "blur",
          },
        ],
      },
      detail: {}, // 文章详情
      shareInfo: {
        selectedUsers: [],
      },
      loading: false,
      deleteMsg: null,
      revokeShow: false,
      url: "",
      detailShow: true,
      shareUrl: "",
    };
  },
  mounted() {
    this.getId();
  },
  methods: {
    buildForm() {
      return {
        content: "",
        attachments: [],
        showInOwn: 0,
      };
    },

    getId() {
      if (window.location.href.indexOf("?") != -1) {
        let array = window.location.href.split("?")[1].split("&");
        let params = [];
        array.forEach((item) => {
          params.push({ name: item.split("=")[0], value: item.split("=")[1] });
        });

        let shenpi = false;
        params.forEach((item) => {
          if (item.name == "wikiId") {
            this.wikiId = item.value;
          }
          if (item.name == "objId") {
            this.wikiId = item.value;
          }
          if (item.name == "id") {
            this.wikiId = item.value;
          }
          if (item.name == "action" && item.value == "approve") {
            this.isReview = true;
          }
          if (item.name == "from" && item.value == "approve") {
            shenpi = true;
          }
        });
        if (
          !shenpi &&
          !this.initData.userInfo.authorities.INFO_VIEW &&
          !this.initData.userInfo.authorities.INFO_EDIT &&
          !this.initData.userInfo.authorities.VIP_INFO_CREATE
        ) {
          this.deleteMsg = "您没有权限查看该页面";
          this.detailShow = false;
          return;
        }
        this.getDocumnetDetail();
      }
    },

    async getApproveDetail() {
      try {
        let params = {
          objId: this.info.id ? this.info.id : this.wikiId ? this.wikiId : null,
        };
        let res = await RepositoryApi.getApprove(params);

        if (res.success) {
          this.approveData = res.result;
          let time = Lang.fmt_gmt_time(this.approveData.createTime);
          this.approveData.createTime = Lang.formatDate(
            time,
            "YYYY-MM-DD HH:mm:ss"
          );
          this.approveData.approvers.forEach((item) => {
            if (item.userId == this.initData.userInfo.userId)
              this.showDetailApprove = true;
          });
          this.approveData.isList = this.isList;
          if (this.detail.originalId) {
            this.approveData.wikiId = this.detail.originalId;
          }
          if (this.approveData.proposer == this.initData.userInfo.userId) {
            this.revokeShow = true;
          }
        } else {
          this.$platform.notification({
            title: res.message,
            type: "error",
          });
        }
      } catch (err) {
        console.error(err);
      }
    },

    // 获取文档库详情
    async getDocumnetDetail() {
      try {
        let params = {
          wikiId: this.info.id
            ? this.info.id
            : this.wikiId
            ? this.wikiId
            : null,
          updateReadTimes: true,
        };
        this.detailShow = true;
        if (!params.wikiId) {
          this.detail = null;
          this.detailShow = false;
          return;
        }
        this.loading = true;
        let res = await RepositoryApi.getInlineDetail(params);
        this.loading = false;

        if (res.success) {
          if (res.message == "已删除") {
            this.detail = null;
            this.deleteMsg = "已被删除";
            this.detailShow = false;
          } else {
            this.detail = res.result;
            this.detail.createTimeShow = Lang.fmt_gmt_time(
              this.detail.createTime
            );
            if (this.detail.updateTime) {
              this.detail.updateTimeShow = Lang.fmt_gmt_time(
                this.detail.updateTime
              );
            }
            if (this.initData.userInfo.authorities.INFO_EDIT) {
              this.allowEdit = true;
            } else {
              if (
                this.detail.createUser == this.initData.userInfo.userId &&
                this.initData.userInfo.authorities.VIP_INFO_CREATE
              ) {
                this.allowEdit = true;
              } else {
                this.allowEdit = false;
              }
            }
            if (this.isReview) {
              this.getApproveDetail();
              this.approve();
              return;
            }
            if (this.detail.examineState && this.detail.examineState == 1) {
              this.getApproveDetail();
            }
          }
        } else {
          this.$platform.notification({
            title: res.message,
            type: "error",
          });
        }
      } catch (err) {
        console.error(err);
        this.loading = false;
      }
    },

    // 新页面打开通知公告详情
    openFrame() {
      let fromId = window.frameElement.getAttribute("id");

      this.$platform.openTab({
        id: `document_detail_${this.detail.id}`,
        title: "知识库列表",
        url: `/wiki/detail/page?wikiId=${this.detail.id}`,
        reload: true,
        close: true,
        fromId,
      });
    },

    // 点击加号显示标签输入框
    choosePerson() {
      let max = -1;

      let options = {
        title: "请选择分享人员",
        seeAllOrg: true,
        // selected: this.shareInfo.selectedUsers,
        max,
        action: "/wiki/approver/list",
      };
      return this.$fast.contact
        .choose("dept", options)
        .then((result) => {
          if (result.status == 0) {
            let data = result.data || {};
            let users = data.users || [];

            this.shareInfo.selectedUsers = users;
            this.$el.dispatchEvent(
              new CustomEvent("form.validate", { bubbles: true })
            );
            this.submitShare();
          }
        })
        .catch((err) => console.error(err));
    },

    // 内部分享选择人员确定后
    async submitShare() {
      if (!this.shareInfo.selectedUsers) return;

      try {
        let userIds = this.shareInfo.selectedUsers.map((item) => item.userId);
        let res = await RepositoryApi.shareDocument(this.detail.id, userIds);

        if (res.success) {
          this.$platform.notification({
            title: "分享成功，该分享人员将会收到消息通知",
            type: "success",
          });
        } else {
          this.$platform.notification({
            title: res.message,
            type: "error",
          });
        }
      } catch (err) {
        console.error(err);
      }
    },

    shareDocument() {
      if (this.detail.allowShare) {
        this.getShareUrl();
        this.shareBoxShow = true;
      } else {
        this.inlineShare();
      }
    },

    // 内部分享，选择人员或者组织
    inlineShare() {
      this.shareBoxShow = false;
      this.choosePerson();
    },

    async getShareUrl() {
      try {
        let protocol = window.location.protocol;
        let host = window.location.host;
        let url = `${protocol}//${host}/v_open/wiki/view?wikiId=${this.detail.id}`;
        this.shareUrl = await RepositoryApi.getShareLink(url);
      } catch (error) {
        console.error("error", error);
      }
    },

    outlineShare() {
      // 外部文章选择外部分享时
      let _this = this;
      this.shareBoxShow = false;
      let url = this.shareUrl;

      // 获取body
      let body = document.getElementsByTagName("body")[0];

      let copyFrom = document.createElement("a");
      copyFrom.setAttribute("id", "target");
      copyFrom.setAttribute("target", "_blank");
      copyFrom.setAttribute("href", url);
      copyFrom.innerHTML = url;

      // 创建按钮
      let agent = document.createElement("button");
      // body增加超链接
      body.appendChild(copyFrom);
      // body增加按钮
      body.appendChild(agent); // 采用Clipboard.js方案 // trouble：没有可以传入的HTML元素，但我们可以动态创建一个DOM对象作为代理，复制超链接
      let clipboard = new Clipboard(agent, {
        target() {
          return document.getElementById("target");
        },
      });

      clipboard.on("success", function (e) {
        _this.$platform.notification({
          title: "已将链接复制到剪贴板，快去粘贴吧！",
          type: "success",
        });
      });

      clipboard.on("error", function (e) {
        _this.$platform.notification({
          title: "分享失败，请重新操作",
          type: "error",
        });
      });
      // 点击按钮
      agent.click();
      // 移除创建的元素
      body.removeChild(copyFrom);
      body.removeChild(agent);
    },

    // 编辑文章操作，查询详情接口，有人正在编辑提示不跳转
    async editArticle() {
      try {
        let params = {
          wikiId: this.info.id
            ? this.info.id
            : this.wikiId
            ? this.wikiId
            : null,
          updateReadTimes: false,
        };
        let res = await RepositoryApi.getInlineDetail(params);

        if (res.success) {
          let detail = res.result;

          if (detail.isLock && detail.examineState != 1) {
            this.$platform.notification({
              title: "该文章正在被编辑，需要等待他编辑完成后才能继续编辑。",
              type: "error",
            });
          } else {
            let fromId = window.frameElement.getAttribute("id");

            this.$platform.openTab({
              id: `wiki_create_${params.wikiId}`,
              title: "知识库编辑",
              url: `/wiki/edit/page?wikiId=${params.wikiId}`,
              reload: true,
              close: true,
              fromId,
            });
          }
        } else {
          this.$platform.notification({
            title: res.message,
            type: "error",
          });
        }
      } catch (err) {
        console.error(err);
      }
    },

    // 删除文章
    async deleteArticle() {
      try {
        if (!(await this.$platform.confirm("确定删除该文章吗？"))) return;

        let params = {
          wikiId: this.detail.id,
        };

        let res = await RepositoryApi.deleteDocument(params);

        if (res.success) {
          this.$platform.notification({
            title: "文章已删除成功。",
            type: "success",
          });

          if (!this.isList) {
            let id = window.frameElement.dataset.id;
            this.$platform.closeTab(id);

            let fromId = window.frameElement.getAttribute("id");
            this.$platform.openTab({
              id: "M_INFO_DOC",
              title: "知识库列表",
              url: "/wiki",
              reload: true,
              close: true,
              fromId,
            });
          } else {
            if (this.info.isLast) {
              this.$parent.resetPageNum();
            } else {
              this.$emit("search");
            }
          }
        } else {
          this.$platform.notification({
            title: res.message,
            type: "error",
          });
        }
      } catch (e) {
        console.error(e);
      }
    },

    search() {
      this.$emit("search");
    },

    approve() {
      this.$refs.approveDialog.open();
    },

    async revoke() {
      try {
        if (!(await this.$platform.confirm("确定要撤回审批吗？"))) return;

        let params = {
          id: this.approveData.id,
        };

        let res = await RepositoryApi.revoke(params);

        if (res.success) {
          if (!this.isList) {
            window.location.reload();
          } else {
            this.$emit("search");
          }
        } else {
          this.$platform.notification({
            title: res.message,
            type: "error",
          });
        }
      } catch (e) {
        console.error(e);
      }
    },

    // TalkingData事件埋点
    trackEventHandler(type) {
      if (type === "delete") {
        window.TDAPP.onEvent("pc：知识库详情-删除事件");
        return;
      }
      if (type === "share") {
        window.TDAPP.onEvent("pc：知识库详情-分享事件");
        return;
      }
      if (type === "open") {
        window.TDAPP.onEvent("pc：知识库详情-新页面打开");
        return;
      }
    },
    changeRelease() {
      this.$confirm(
        this.detail.circleState == 1 ? "是否取消发布" : "是否发布到圈子",
        "提示",
        {
          confirmButtonText: "确定",
        }
      )
        .then(() => {
          RepositoryApi.releaseCircle({
            id: this.detail.id,
            circleState: 1 - this.detail.circleState * 1,
          }).then((res) => {
            if (res.code == 0) {
              this.$message({
                message: res.message,
                duration: 1500,
                type: "success",
              });
              this.detail.circleState = 1 - this.detail.circleState * 1;
              this.$emit("releaseCircle", {
                id: this.detail.id,
                circleState: 1 - this.detail.circleState * 1,
              });
            } else {
              this.$message({
                message: res.message,
                duration: 1500,
                type: "error",
              });
            }
          });
        })
        .catch(() => {});
    },
  },
  computed: {
    height() {
      return this.isList ? "100%" : "100vh";
    },

    padding() {
      return this.isList ? "0 50px" : "0 100px";
    },

    fontClass() {
      return document.body.clientWidth > 1800 ? "font-class" : "";
    },

    // 联客商城灰度开关
    linkControl() {
      return this.initData.openLinkC;
    },
  },
};
</script>

<style lang="scss">
.document-list-detail {
  display: flex;
  flex-direction: column;
  overflow: hidden;

  background: #fff;

  .detail-top {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    min-height: 60px;
    max-height: 120px;
    padding: 10px 15px;
    border-bottom: 1px solid #e8eff0;

    .author-container {
      .author {
        font-size: 0;
        display: inline-block;

        .author-img {
          vertical-align: middle;
          display: inline-block;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          margin-right: 5px;
        }

        .author-info {
          vertical-align: middle;
          display: inline-block;

          .name {
            font-size: 14px;
            margin-bottom: 5px;
          }

          .time {
            font-size: 12px;
            color: #909399;
            margin: 0;
          }
        }
      }

      .right {
        margin-left: 10px;
      }
    }

    .operating {
      line-height: 40px;

      .published {
        display: inline-block;
      }

      .draftBox {
        display: inline-block;
        margin-right: 10px;
      }

      .icon-permission {
        font-size: 14px;
        color: #b0bcc3;
        margin-right: 3px;
      }

      .management {
        .icon-edit {
          display: inline-block;
          width: 25px;
          height: 25px;
          font-size: 14px;
          color: #38a6a6;
        }

        .icon-delete {
          display: inline-block;
          width: 25px;
          height: 25px;
          font-size: 14px;
          color: #38a6a6;
        }
      }

      .icon-operating {
        display: inline-block;
        width: 30px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        font-size: 16px;
        color: #38a6a6;

        cursor: pointer;
      }

      .share {
        display: inline-block;

        width: 20px;
        height: 20px;
        line-height: 20px;

        cursor: pointer;

        .icon-article-share {
          font-size: 16px;
          color: #38a6a6;
        }
      }

      .open {
        display: inline-block;
        height: 30px;
        line-height: 30px;
        margin-left: 10px;
        color: #55b7b4;

        cursor: pointer;
      }

      .green-btn {
        background: #55b7b4;
        border: transparent;
        margin-left: 10px;
      }

      .white-btn {
        background: #fff;
        color: #333;
        border: 1px solid #e2e2e2;

        &:hover {
          border-color: #55b7b4;
          background: #66bebc;
          color: #fff;
        }
      }
    }
  }

  .detail-content {
    flex: 1;
    overflow: auto;

    .info {
      .title {
        margin: 0;
        padding: 16px 0;
        text-align: center;
        font-size: 20px;
      }

      .content {
        padding-bottom: 30px;
        word-break: break-all;

        p > img {
          max-width: 100%;
        }

        p {
          line-height: 28px;
        }
      }

      .font-class {
        font-size: 16px !important;

        p {
          line-height: 30px;
        }
      }
    }

    .footer {
      padding: 12px;
      box-shadow: 0px 2px 8px 0px rgba(144, 171, 184, 0.5);
      border-radius: 4px;
      font-size: 0;
      margin-bottom: 50px;

      .tags {
        // display: inline-block;
        vertical-align: top;
        font-size: 0;
        padding-bottom: 10px;

        .icon-tags {
          vertical-align: middle;
          font-size: 16px;
          color: #b0bcc3;
        }

        .detail-tag {
          vertical-align: middle;
          max-width: 76px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;

          margin-left: 4px;
          border: none;
          background: #e8eff0;
          color: #606266;
        }
      }

      .dividing-line {
        // display: inline-block;
        height: 22px;
        width: 1px;
        background: #848e92;
        margin: 0 20px;
        vertical-align: top;
      }

      .annex {
        vertical-align: top;
        display: inline-block;
        font-size: 0;

        .annex-left {
          vertical-align: top;
          display: inline-block;
          font-size: 14px;
          line-height: 35px;
        }

        .annex-right {
          vertical-align: top;
          display: inline-block;

          .annex-item {
            font-size: 14px;
          }

          .base-file-info {
            white-space: inherit;
          }
        }
      }
    }
  }

  .type-modal {
    .base-modal-body {
      padding: 10px 30px 0;
    }

    .base-modal-footer {
      text-align: right;
    }

    .el-button:hover,
    .el-button:focus {
      color: #55b7b4;
      border-color: #cce9e9;
      background-color: #eef8f8;
    }

    .el-button--primary:hover,
    .el-button--primary:focus {
      background: #77c5c3;
      border-color: #77c5c3;
      color: #ffffff;
    }

    .green-btn {
      background: #55b7b4;
      border: transparent;
      margin-left: 10px;
    }
  }
}

.empty {
  text-align: center;
  padding-top: 100px;
  height: 100vh;

  .empty-img {
    width: 100px;
    height: 100px;
  }

  .empty-msg {
    display: block;
    padding-top: 10px;
    font-size: 14px;
  }
}

.base-file-del {
  display: none;
}
</style>