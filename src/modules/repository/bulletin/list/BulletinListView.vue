<template>
  <div class="bulletin-list-view" v-loading.fullscreen.lock="loading">
    <!-- 搜索部分 -->
    <list-search class="list-search" @search="search" :total="listTotal" :infoEdit="initData.userInfo.authorities"></list-search>

    <div class="bulletin-list-bottom">
      <!-- 左侧列表 -->
      <div class="bulletin-list-left">
        <!-- 列表部分 -->
        <list class="list" :keyword="params.keyword" @toDetail="toDetail" :value="listMsg" :id.sync="chosenId" ref="list"></list>
        <!-- 页脚部分 -->
        <list-footer class="list-footer" @search="search" :total="listTotal" v-model="params"></list-footer>
      </div>

      <!-- 右侧详情 -->
      <div class="bulletin-list-right">
        <bullet-detail :info="info" :infoEdit="initData.userInfo.authorities" @search="search" ref="bulletinDetail"></bullet-detail>
      </div>
    </div>

  </div>
</template>

<script>
import ListSearch from './component/ListSearch'
import List from './component/List'
import ListFooter from '../../common/ListFooter'
import BulletinDetailView from '../detail/BulletinDetailView'

import * as RepositoryApi from '@src/api/Repository'

export default {
  props: {
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      params: {
        keyword: '', // 搜索的关键词
        typeId: null,
        pageNum: 1,
        pageSize: 20,
      },
      listTotal: null,
      listMsg: {},
      noticeId: null,
      info: {
        id: null
      },
      chosenId: null,
      loading: false
    }
  },
  components: {
    [ListSearch.name]: ListSearch,
    [List.name]: List,
    [ListFooter.name]: ListFooter,
    [BulletinDetailView.name]: BulletinDetailView
  },
  created () {
    this.search()
  },
  methods: {
    async search (params) {
      if(params) Object.assign(this.params, params);
      try {
        this.loading = true;
        let res = await RepositoryApi.getBulletinList(this.params);
        this.loading = false;
        
        if(res.success) {
          // 查询无数据时
          if(!res.result) {
            this.listTotal = 0;
            this.listMsg = {
              list: []
            };
            this.toDetail(this.listMsg.list[0]);
            return;
          }
          
          this.listTotal = res.result.total;

          res.result.list.forEach(item => {
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
        this.loading = false;
      }    
    },

    toDetail (item) {
      if(!item) {
        this.info.id = null;
        this.$refs.bulletinDetail.getBulletinDetail();
        return;
      }
      this.info.id = item.id;
      this.chosenId = this.info.id;
      this.$refs.bulletinDetail.getBulletinDetail();
      this.$refs.bulletinDetail.getReadPerson();
      this.$refs.bulletinDetail.getUnreadPerson();
    }
  }
}
</script>

<style lang="scss">
.bulletin-list-view {
  padding: 10px;
  height: 100vh;

  .list-search {
    position: relative;
    z-index: 99;
    border-bottom: 1px solid #E8EFF0;
    height: 56px;
    background: #F8F8F8;
  }

  .bulletin-list-bottom {
    display: flex;
    overflow: hidden;
    height: calc(100vh - 76px);

    .bulletin-list-left {
      width: 450px;
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

    .bulletin-list-right {
      flex: 1;
      height: 100%;
      width: 0;
      background: #fff;
      border-left: 2px solid #E8EFF0;
    }
  }
}
</style>
