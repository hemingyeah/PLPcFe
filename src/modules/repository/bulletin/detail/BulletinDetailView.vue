<template>
  <div class="bulletin-list-detail" ref="bulletinDetail" :style="{height: height}" v-if="detail" v-loading.fullscreen.lock="loading">
    <!-- 详情头部 -->
    <div class="detail-top">

      <div class="author">
        <img class="author-img" :src="detail.createUserHead" v-if="detail.createUserHead">
        <img class="author-img" src="../../../../assets/img/avatar.png" v-else>
        <div class="author-info">
          <p class="name">{{detail.createUserName}}</p>
          <p class="time">发布于：{{detail.createTime | fmt_datehour}}</p>
        </div>
      </div>

      <div class="operating">

        <div class="common">
          <span class="item-num">已读（{{detail.readNum}}）</span>
          <span class="item-num">未读（{{detail.unreadNum}}）</span>
        </div>

        <span class="management" v-if="allowEdit">
          <i class="iconfont icon-qingkongshanchu icon-operating" @click="deleteArticle"></i>
        </span>

        <span class="open" @click="openFrame" v-if="showOpenFrame">新页面打开</span>

      </div>
    </div>

    <!-- 文章详情 -->
    <div class="detail-content" :style="{padding: padding}">

      <div class="info">
        <p class="title">{{detail.title}}</p>
        <div class="ql-container ql-snow content" style="border:none">
          <div class="ql-editor">
            <div v-html="detail.content"></div>
          </div>
        </div>
      </div>
      <!-- 详情页脚部分 -->
      <div class="footer" v-if="(reads.reads.length > 0 && reads.unreads.length > 0) || (detail.attachment && detail.attachment.length > 0)">
        <!-- 已读、未读人员显示 -->
        <div class="person">

          <div class="read-person" v-if="reads.reads.length > 0">
            <span class="title">已读</span>
            <el-tooltip :content="item.displayName" placement="top" v-for="(item, index) in reads.reads" :key="index">
              <img class="person-img" :src="item.head" v-if="index < 5">
              <img class="person-img" src="../../../../assets/img/avatar.png" v-if="index < 5 && !item.head">
            </el-tooltip>
            <div class="more-preson" v-if="reads.reads.length > 5" @click="seeMore('read')">+{{reads.reads.length - 5}}
              <div class="see-more" v-if="showMoreRead" ref="seeMore">
                <el-tooltip :content="item.displayName" placement="top" v-for="(item, index) in reads.reads" :key="index">
                  <img class="person-img" :src="item.head" v-if="index >= 5">
                  <img class="person-img" src="../../../../assets/img/avatar.png" v-if="index >= 5 && !item.head">
                </el-tooltip>
              </div>
            </div>
          </div>

          <div class="read-person" v-if="reads.unreads.length > 0">
            <span class="title right" :style="{marginLeft: marginLeft}">未读</span>
            <el-tooltip :content="item.displayName" placement="top" v-for="(item, index) in reads.unreads" :key="index">
              <img class="person-img" :src="item.head" v-if="index < 5 && item.head">
              <img class="person-img" src="../../../../assets/img/avatar.png" v-if="index < 5 && !item.head">
            </el-tooltip>
            <div class="more-preson" v-if="reads.unreads.length > 5" @click="seeMore('noRead')">+{{reads.unreads.length - 5}}
              <div class="see-more right" v-if="showMoreNoRead" ref="seeMore">
                <el-tooltip :content="item.displayName" placement="top" v-for="(item, index) in reads.unreads" :key="index">
                  <img class="person-img" :src="item.head" v-if="index >= 5 && item.head">
                  <img class="person-img" src="../../../../assets/img/avatar.png" v-if="index >= 5 && !item.head">
                </el-tooltip>
              </div>
            </div>
          </div>

        </div>
        <!-- 附件部分 -->
        <div class="annex" v-if="detail.attachment && detail.attachment.length > 0">
          <span class="annex-left">附件：</span>
          <div class="annex-right">
            <div class="base-comment-attachment base-file__preview">
              <base-file-item v-for="file in detail.attachment" :key="file.id" :file="file" size="small"></base-file-item>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
import * as RepositoryApi from '@src/api/Repository'
import * as Lang from '@src/util/lang/index.js';

export default {
  name: 'bullet-detail',
  props: {
    info: {
      type: Object,
      default: () => ({})
    },
    initData: {
      type: Object,
      default: () => ({})
    },
    infoEdit: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      allowEdit: this.infoEdit.INFO_VIEW ? this.infoEdit.INFO_EDIT && this.infoEdit.INFO_EDIT == 3 : this.initData.userInfo.authorities.INFO_EDIT && this.initData.userInfo.authorities.INFO_EDIT == 3,
      noticeId: '',
      form: this.buildForm(), // 附件存储格式
      showOpenFrame: true, // 是否显示 新页面打开
      params: {
        noticeId: ''
      },
      detail: {}, // 文章详情
      reads: {
        reads: [],
        unreads: []
      },
      showMoreRead: false, // 是否显示已读人员浮框
      showMoreNoRead: false, // 是否显示未读人员浮框
      loading: false
    }
  },
  mounted () {
    this.getId();
    // 根据formId来判断是否是在新页面打开
    if(!window.frameElement) {
      this.showOpenFrame = false;
      return;
    }
    let formId = window.frameElement.getAttribute('id');
    if(formId.indexOf('bulletin_detail') != -1) this.showOpenFrame = false; 
  },
  methods: {
    getId () {
      if(window.location.href.indexOf('?') != -1) {
        let array = window.location.href.split('?');
        let params = array[1].split('=');
        if(params[0] == 'noticeId') {
          this.noticeId = params[1];
          this.showOpenFrame = false;
        }
        this.getBulletinDetail();
        this.getReadPerson();
        this.getUnreadPerson();
      }
    },
    // 获取通知公告详情
    async getBulletinDetail () {
      try {
        this.loading = true;
        this.params.noticeId = this.info.id ? this.info.id : this.noticeId ? this.noticeId : null;
        if(!this.params.noticeId) {
          this.detail = null;
          return;
        }
        let res = await RepositoryApi.getBulletinDetail(this.params);
        if(res.success) {
          this.detail = res.result;
          this.detail.createTime = Lang.fmt_gmt_time(this.detail.createTime, 0);
          this.loading = false;
        } else {
          this.$platform.alert(res.message);
          this.loading = false;
        }
      } catch (err) {
        console.error(err)
      }
    },

    // 获取最近5条已读未读用户
    async getReadOrNotLatest () {
      try {
        let res = await RepositoryApi.getReadOrNotLatest(this.params);
        if(res.success) {
          this.reads.reads = res.result.reads;
          this.reads.unreads = res.result.unreads;
        } else {
          this.$platform.alert(res.message);
        }
      } catch (err) {
        console.error(err)
      }
    },

    // 获取所有已读用户,点击加号时获取
    async getReadPerson () {
      try {
        let res = await RepositoryApi.getReadPerson(this.params);
        if(res.success) {
          this.reads.reads = res.result;
        } else {
          this.$platform.alert(res.message);
        }
      } catch (err) {
        console.error(err)
      }
    },

    // 获取所有未读用户，点击加号时获取
    async getUnreadPerson () {
      try {
        let res = await RepositoryApi.getUnreadPerson(this.params);
        if(res.success) {
          this.reads.unreads = res.result;
        } else {
          this.$platform.alert(res.message);
        }
      } catch (err) {
        console.error(err)
      }
    },

    buildForm(){
      return {
        content: '',
        attachments: [],
        showInOwn: 0,
      }
    },

    // 新页面打开通知公告详情
    openFrame () {
      let fromId = window.frameElement.getAttribute('id');
      
      this.$platform.openTab({
        id: `bulletin_detail_${ this.params.noticeId }`,
        title: '通知公告详情',
        url: `/info/notice/detail/page?noticeId=${ this.params.noticeId }`,
        reload: true,
        close: true,
        fromId
      });
    },

    // 打开已读、未读人员浮框
    seeMore (value) {
      if (value == 'read') this.showMoreRead = true;
      if (value == 'noRead') this.showMoreNoRead = true;

      this.toggleSeeMore();
    },

    // 监听click事件，根据条件关闭已读、未读人员浮框
    toggleSeeMore () {
      if(this.showMoreRead || this.showMoreNoRead) {
        document.addEventListener('click', (e) => {
          if(!this.$refs.seeMore || !this.$refs.bulletinDetail) return;
          if(!this.$refs.seeMore.contains(e.target) && this.$refs.bulletinDetail.contains(e.target)) {
            this.showMoreRead = this.showMoreRead ? !this.showMoreRead : this.showMoreRead;
            this.showMoreNoRead = this.showMoreNoRead ? !this.showMoreNoRead : this.showMoreNoRead;
          }
        })
      } else {
        document.removeEventListener('click', (e) => {
          console.log('取消')
        })
      }
    },

    editArticle () {
      let fromId = window.frameElement.getAttribute('id');
      
      this.$platform.openTab({
        id: 'bulletin_edit',
        title: '编辑通知公告',
        url: '/bulletin/create',
        reload: true,
        close: true,
        fromId
      });
    },

    // 删除通知公告
    async deleteArticle () {
      try {
        if (!await this.$platform.confirm('确定删除该文章吗？')) return;
        let res = await RepositoryApi.deleteBulletin(this.params);
        if(res.success) {
          this.$platform.alert('文章已删除成功。')

          if(!this.showOpenFrame) {
            let id = window.frameElement.dataset.id;
            this.$platform.closeTab(id);
          }
          

          let fromId = window.frameElement.getAttribute('id');
      
          this.$platform.openTab({
            id: 'M_INFO_NOTICE',
            title: '通知公告',
            url: '/info/notice/list/page',
            reload: true,
            close: true,
            fromId
          });
        } else {
          this.$platform.alert(res.message);
        }
      } catch (e) {
        console.error(e);
      }
    }
  },
  computed: {
    height () {
      return this.showOpenFrame ? '100%' : '100vh';
    },

    padding () {
      return this.showOpenFrame ? '0 50px' : '0 100px';
    },

    marginLeft () {
      return this.reads.reads.length > 0 ? '20px' : '0'
    }
  }
}
</script>

<style lang="scss">
.bulletin-list-detail {
  display: flex;
  flex-direction: column;
  overflow: hidden;

  background: #fff;

  .detail-top {
    display: flex;
    justify-content: space-between;
    height: 60px;
    padding: 10px 24px 10px 16px;
    border-bottom: 1px solid #E8EFF0;

    .author {
      font-size: 0;

      .author-img {
        vertical-align: middle;
        display: inline-block;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        margin-right: 15px;
      }
      
      .author-info {
        vertical-align: middle;
        display: inline-block;

        .name {
          font-size: 14px;
          margin-bottom: 4px;
        }

        .time {
          font-size: 12px;
          color: #909399;
          margin: 0;
        }
      }
    }

    .operating {
      line-height: 40px;

      .common {
        display: inline-block;
        margin-right: 10px;

        .item-num {
          margin-left: 10px;
        }
      }

      .management {

        .icon-edit {
          display: inline-block;
          width: 25px;
          height: 25px;
          font-size: 14px;
          color: #38A6A6;
        }

        .icon-delete {
          display: inline-block;
          width: 25px;
          height: 25px;
          font-size: 14px;
          color: #38A6A6;
        }
      }

      .icon-operating {
        display: inline-block;
        width: 30px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        font-size: 14px;
        color: #38A6A6;

        cursor: pointer;
      }

      .open {
        display: inline-block;
        height: 30px;
        line-height: 30px;
        margin-left: 10px;
        color: #55B7B4;

        cursor: pointer;
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
        font-size: 20  px;
      }

      .content {
        font-size: 16px;
        line-height: 30px;
        padding-bottom: 30px;

        word-break: break-all;

        p > img {
          max-width: 100%;
        }
      }
    }

    .footer {
      padding: 12px;
      box-shadow:0px 2px 8px 0px rgba(144,171,184,0.5);
      border-radius: 4px;
      font-size: 0;
      margin-bottom: 50px;

      .person {
        display: flex;

        .read-person {
          flex: 1;

          .title {
            vertical-align: middle;
            display: inline-block;

            font-size: 15px;

            margin-right: 20px;
          }

          .right {
            margin-left: 20px;
          }

          .person-img {
            vertical-align: middle;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            margin-right: 8px;
          }

          .more-preson {
            position: relative;
            vertical-align: middle;
            display: inline-block;
            width: 32px;
            height: 32px;

            font-size: 12px;
            line-height: 32px;
            text-align: center;
            color: #696974;

            border-radius: 50%;
            border: 1px solid #E2E2EA;

            cursor: pointer;

            .see-more {
              position: absolute;
              bottom: 45px;
              left: -117px;
              text-align: left;
              width: 232px;
              padding: 15px 5px 5px 15px;
              border: 1px solid #ccc;
              border-radius: 10px;
              background: #fff;

              &::after {
                content: "";
                position: absolute;
                bottom: -20px;
                left: 120px;
                border: 10px solid;
                border-color: #ccc transparent transparent;
              }

              .person-img {
                margin-right: 10px;
                margin-bottom: 8px;
              }
            }

            .right {
              left: -155px;

              &::after {
                left: 138px;
              }
            }
          }
        }
      }

      .annex {
        vertical-align: top;
        display: inline-block;
        font-size: 0;
        padding-top: 12px;

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
        }
      }
    }
  }
}

.base-file-del {
  display: none;
}
</style>