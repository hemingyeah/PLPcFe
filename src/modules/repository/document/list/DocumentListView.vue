<template>
  <div class="document-list-view">
    <!-- 搜索部分 -->
    <list-search class="list-search" v-model="params" :tag="tag" :total="listTotal" :infoEdit="initData.userInfo.authorities" @search="search" ref="listSearch"></list-search>

    <div class="document-list-bottom">
      <!-- 左侧列表 -->
      <div class="document-list-left">
        <!-- 列表部分 -->
        <list class="list" @tag="setTag" :keyword="params.keyword" @toDetail="toDetail" :value="listMsg" :id.sync="info.id" ref="list"></list>
        <!-- 页脚部分 -->
        <list-footer class="list-footer" @search="search" :total="listTotal" v-model="params"></list-footer>
      </div>

      <!-- 右侧详情 -->
      <div class="document-list-right">
        <document-detail :info="info" :infoEdit="initData.userInfo.authorities" ref="documentDetail" @search="search"></document-detail>
      </div>
    </div>
    
    
  </div>
</template>

<script>
import ListSearch from './component/ListSearch'
import List from './component/List'
import ListFooter from '../../common/ListFooter'
import DocumentDetailView from '../detail/DocumentDetailView'

import * as RepositoryApi from '@src/api/Repository'
import * as Lang from '@src/util/lang/index.js';

export default {
  props: {
    initData: { // 配置信息
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      params: {
        label: '', // 标签
        keyword: '', // 搜索的关键词
        pageNum: 1,
        pageSize: 20,
        orderDetail: { // 排序
          isSystem: 1,
          column: 'createTime',
          type: '',
          sequence: 'desc'
        },
        view: '',
      },
      tag: {
        name: '',
        show: false
      }, // 选中的标签
      listTotal: null,

      listMsg: {}, // 列表全部数据
      info: { // 传给右侧详情的文档id、allowShare
        id: null,
        allowShare: 0
      }
    }
  },

  components: {
    [ListSearch.name]: ListSearch,
    [List.name]: List,
    [ListFooter.name]: ListFooter,
    [DocumentDetailView.name]: DocumentDetailView
  },

  created () {
    this.search()
  },

  methods: {
    // 获取文档库列表，将ListSearch、ListFooter组件传递的参数合并
    async search (params) {
      if(params) Object.assign(this.params, params);
      try {
        let res = await RepositoryApi.getDocumentList(this.params);
        
        if(res.success) {
          this.listTotal = res.result.total;
          res.result.list.forEach(item => {
            item.createtime = Lang.fmt_gmt_time(item.createtime);

            if(item.title.indexOf('<em>') != -1) {
              let replaceReg = new RegExp('<em>', 'g');
              item.handleTitle = item.title.replace(replaceReg, '<span style="color: #FF7B00">');
              let reg = new RegExp('</em>', 'g');
              item.handleTitle = item.handleTitle.replace(reg, '</span>');
            } else {
              item.handleTitle = item.title;
            }

            if(item.content.indexOf('<em>') != -1) {
              let replaceReg = new RegExp('<em>', 'g');
              item.handleContent = item.content.replace(replaceReg, '<span style="color: #FF7B00">');
              let reg = new RegExp('</em>', 'g');
              item.handleContent = item.handleContent.replace(reg, '</span>');
            } else {
              item.handleContent = item.content;
            }
          })
          this.listMsg = res.result;
          this.toDetail(this.listMsg.list[0]);

        } else {
          this.$platform.alert(res.message);
        }
      } catch (err) {
        console.error(err);
      }    
    },
    
    // 给子组件传过来的tag加上show属性
    setTag (tag) {
      this.tag.name = tag;
      this.tag.show = true;

      this.$refs.listSearch.setTag();
    },

    toDetail (item) {
      if(!item) {
        this.info.id = null;
        this.$refs.documentDetail.getDocumnetDetail();
        return;
      }
      this.info.id = item.id;
      this.info.allowShare = item.allowShare;
      this.$refs.documentDetail.getDocumnetDetail();
    },
    
  }
}
</script>

<style lang="scss">
.document-list-view {
  padding: 10px;
  height: 100vh;
  display: flex;
  flex-direction: column;

  .list-search {
    position: relative;
    z-index: 99;
    height: 56px;
    background: #F8F8F8;
    border-bottom: 1px solid #E8EFF0;
    // box-shadow:0px 2px 4px 0px rgba(232,232,232,1);
  }

  .document-list-bottom {
    flex: 1;
    display: flex;

    .document-list-left {
      width: 440px;
      display: flex;
      height: 100%;
      flex-direction: column;

      .list {
        background: #fff;
        flex: 1
      }

      .list-footer {
        margin-top: 3px;
      }
    }

    .document-list-right {
      flex: 1;
      height: 100%;
      width: 0;
      // margin-left: 10px;
      background: #fff;
      border-left: 2px solid #E8EFF0;
    }
  }
}
</style>
