<template>
  <div class="document-list-view">
    <!-- 搜索部分 -->
    <list-search
      class="list-search"
      v-model="params"
      :tag="tag"
      :total="listTotal"
      :info-edit="initData.userInfo.authorities"
      @search="search"
      ref="listSearch"
    ></list-search>

    <div class="document-list-bottom">
      <!-- 左侧列表 -->
      <div class="document-list-left">
        <!-- 列表部分 -->
        <list
          class="list"
          @tag="setTag"
          :keyword="params.keyword"
          @toDetail="toDetail"
          :init-data="initData"
          :value="listMsg"
          :id.sync="info.id"
          ref="list"
          v-if="listMsg.list && listMsg.list.length > 0"
        ></list>
        <div v-else class="list empty">
          <img class="empty-img" src="../../../../assets/img/empty.png" />
          <span class="empty-msg">暂无数据</span>
        </div>
        <!-- 页脚部分 -->
        <list-footer
          class="list-footer"
          @search="search"
          :total="listTotal"
          v-model="params"
          ref="listFooter"
        ></list-footer>
      </div>

      <!-- 右侧详情 -->
      <div class="document-list-right">
        <document-detail
          :info="info"
          :init-data="initData"
          ref="documentDetail"
          @search="search"
          :is-list="true"
          @releaseCircle="releaseCircle"
        ></document-detail>
      </div>
    </div>
  </div>
</template>

<script>
import ListSearch from "./component/ListSearch";
import List from "./component/List";
import ListFooter from "../../common/ListFooter";
import DocumentDetailView from "../detail/DocumentDetailView";

import * as RepositoryApi from "@src/api/Repository";
import * as Lang from "@src/util/lang/index.js";

export default {
  props: {
    initData: {
      // 配置信息
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      params: {
        label: "", // 标签
        keyword: "", // 搜索的关键词
        pageNum: 1,
        pageSize: this.getPageSize(),
        orderDetail: {
          // 排序
          isSystem: 1,
          column: "",
          type: "",
          sequence: "desc",
        },
        view: "all",
        type: [],
        fasterFindId: '',
      },
      tag: {
        name: "",
        show: false,
      }, // 选中的标签
      listTotal: null,

      listMsg: {}, // 列表全部数据
      info: {
        // 传给右侧详情的文档id、allowShare
        id: null,
        allowShare: 0,
        isLast: false,
      },
    };
  },

  components: {
    [ListSearch.name]: ListSearch,
    [List.name]: List,
    [ListFooter.name]: ListFooter,
    [DocumentDetailView.name]: DocumentDetailView,
  },

  mounted() {
    this.search();
    window.__exports__refresh = this.search;
  },

  methods: {
    // 获取文档库列表，将ListSearch、ListFooter组件传递的参数合并
    async search(params, flag) {
      if (params) Object.assign(this.params, params);
      if (flag) {
        localStorage.setItem("wiki_pageSize", this.params.pageSize);
      }
      this.$refs.listSearch.initView();
      this.$refs.listSearch.getTypes();
      try {
        this.$refs.documentDetail.loading = true;
        let res = await RepositoryApi.getDocumentList(this.params);

        if (res.success) {
          if (this.$refs.list) this.$refs.list.resetScrollTop();
          this.listTotal = res.result.total;
          if (res.result.list.length == 1 && res.result.nextPage == 0) {
            res.result.list[0].isLast = true;
          }

          res.result.list.forEach((item) => {
            if (item.createtime)
              item.createtime = Lang.fmt_gmt_time(item.createtime);

            if (item.title.indexOf("<em>") != -1) {
              let replaceReg = new RegExp("<em>", "g");
              item.handleTitle = item.title.replace(
                replaceReg,
                '<span style="color: #FF7B00">'
              );
              let reg = new RegExp("</em>", "g");
              item.handleTitle = item.handleTitle.replace(reg, "</span>");
            } else {
              item.handleTitle = item.title;
            }

            if (item.content.indexOf("<em>") != -1) {
              let replaceReg = new RegExp("<em>", "g");
              item.handleContent = item.content.replace(
                replaceReg,
                '<span style="color: #FF7B00">'
              );
              let reg = new RegExp("</em>", "g");
              item.handleContent = item.handleContent.replace(reg, "</span>");
            } else {
              item.handleContent = item.content;
            }
          });
          this.listMsg = res.result;
          this.toDetail(this.listMsg.list[0]);
        } else {
          this.$refs.documentDetail.loading = false;
          this.$platform.notification({
            title: res.message,
            type: "error",
          });
        }
      } catch (err) {
        console.error(err);
        this.$refs.documentDetail.loading = false;
      }
    },

    getPageSize() {
      return parseInt(localStorage.getItem("wiki_pageSize")) || 10;
    },

    // 给子组件传过来的tag加上show属性
    setTag(tag) {
      this.tag.name = tag;
      this.tag.show = true;

      this.$refs.listSearch.setTag();
    },

    toDetail(item) {
      if (!item) {
        this.info.id = null;
        this.$refs.documentDetail.getDocumnetDetail();
        this.$refs.documentDetail.loading = false;
        return;
      }
      this.info.id = item.id;
      this.info.allowShare = item.allowShare;
      this.info.isLast = item.isLast ? item.isLast : false;
      this.$refs.documentDetail.getDocumnetDetail();
    },

    resetPageNum() {
      this.$refs.listFooter.resetPageNum();
    },
    releaseCircle(e) {
      if (e.id) {
        let data = this.listMsg;
        data.list = this.listMsg.list.map((item) => {
          if (item.id == e.id) {
            item.circleState = e.circleState;
          }
          return item;
        });
        this.$set(this, "listMsg", data);
      }
    },
  },
};
</script>

<style lang="scss">
.document-list-view {
  padding: 10px;
  height: 100vh;

  .list-search {
    position: relative;
    z-index: 99;
    height: 56px;
    background: #f8f8f8;
    border-bottom: 1px solid #e8eff0;
  }

  .document-list-bottom {
    display: flex;
    overflow: hidden;
    height: calc(100vh - 76px);

    .document-list-left {
      display: inline-block;
      width: 440px;
      display: flex;
      height: 100%;
      flex-direction: column;

      .list {
        background: #fff;
        flex: 1;
      }

      .empty {
        text-align: center;
        padding-top: 100px;

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

      .list-footer {
        margin-top: 3px;
      }
    }

    .document-list-right {
      display: inline-block;
      flex: 1;
      height: 100%;
      width: 0;
      background: #fff;
      border-left: 2px solid #e8eff0;
    }
  }
}

.search-cascader-panel {
  .el-cascader-menu__item,
  .is-active {
    line-height: 18px;
    display: flex;
    justify-content: space-between;

    & > span > .icon-qingkongshanchu {
      opacity: 0;
    }

    &:hover > span > .icon-qingkongshanchu {
      opacity: 1;
    }

    & > span > .icon-bianji {
      opacity: 0;
    }

    &:hover > span > .icon-bianji {
      opacity: 1;
    }

    .icon-bianji {
      margin-right: 5px;
      &:hover {
        color: #38a6a6;
      }
    }

    .icon-qingkongshanchu {
      margin-right: 15px;
      &:hover {
        color: #38a6a6;
      }
    }
  }
}
</style>
