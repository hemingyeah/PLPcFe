<template>
  <div class="bulletin-list-detail" ref="bulletinDetail" :style="{height: height}">
    <!-- 详情头部 -->
    <div class="detail-top">

      <div class="author">
        <img class="author-img" :src="info.author.img">
        <div class="author-info">
          <p class="name">{{info.author.name}}</p>
          <p class="time">发布于：{{info.author.time}}</p>
        </div>
      </div>

      <div class="operating">

        <div class="common">
          <span class="item-num">已读（{{info.readNum}}）</span>
          <span class="item-num">未读（{{info.noReadNum}}）</span>
        </div>

        <span class="management">
          <i class="iconfont icon-bianji icon-operating" @click="editArticle"></i>
          <i class="iconfont icon-qingkongshanchu icon-operating" @click="deleteArticle"></i>
        </span>

        <span class="open" @click="openFrame" v-if="showOpenFrame">新页面打开</span>

      </div>
    </div>

    <!-- 文章详情 -->
    <div class="detail-content" :style="{padding: padding}">

      <div class="info">
        <p class="title">{{info.title}}</p>
        <div class="content">{{info.content}}</div>
      </div>
      <!-- 详情页脚部分 -->
      <div class="footer">
        <!-- 已读、未读人员显示 -->
        <div class="person">

          <div class="read-person">
            <span class="title">已读</span>
            <el-tooltip :content="item.name" placement="top" v-for="(item, index) in info.readPerson" :key="index">
              <img class="person-img" :src="item.img" v-if="index < 5">
            </el-tooltip>
            <div class="more-preson" v-if="info.readPerson.length > 5" @click="seeMore('read')">+{{info.readPerson.length - 5}}
              <div class="see-more" v-if="showMoreRead" ref="seeMore">
                <el-tooltip :content="item.name" placement="top" v-for="(item, index) in info.readPerson" :key="index">
                  <img class="person-img" :src="item.img" v-if="index >= 5">
                </el-tooltip>
              </div>
            </div>
          </div>

          <div class="read-person">
            <span class="title right">未读</span>
            <el-tooltip :content="item.name" placement="top" v-for="(item, index) in info.noReadPerson" :key="index">
              <img class="person-img" :src="item.img" v-if="index < 5">
            </el-tooltip>
            <div class="more-preson" v-if="info.noReadPerson.length > 5" @click="seeMore('noRead')">+{{info.noReadPerson.length - 5}}
              <div class="see-more" v-if="showMoreNoRead" ref="seeMore">
                <el-tooltip :content="item.name" placement="top" v-for="(item, index) in info.noReadPerson" :key="index">
                  <img class="person-img" :src="item.img" v-if="index >= 5">
                </el-tooltip>
              </div>
            </div>
          </div>

        </div>
        <!-- 附件部分 -->
        <div class="annex">
          <span class="annex-left">附件：</span>
          <div class="annex-right">
            <div class="annex-item">menu.pdf</div>
            <div class="annex-item">menu.pdf</div>
            <!-- <div class="base-comment-attachment base-file__preview" v-if="form.attachments.length > 0">
              <base-file-item v-for="file in form.attachments" :key="file.id" :file="file" size="small"></base-file-item>
            </div> -->
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'bullet-detail',
  data () {
    return {
      form: this.buildForm(), // 附件存储格式
      articleId: 'NIHIF678', // 通知公告id
      showOpenFrame: true, // 是否显示 新页面打开
      info: {
        author: {
          img: 'https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg',
          name: '张某某',
          time: '2019年7月7日 19:03',
        },
        readNum: 10086,
        noReadNum: 3344,
        title: '最前线|微信内测新功能，提升阅读效率没那么容易',
        content: '作为一枚初入鹅厂的鲜鹅，对这里的一切都充满着求知欲。看到我们的KM平台如此生机勃勃，各种技术分享交流如火如荼，在努力的汲取着养分的同时也期待自己能为这个生态圈做出贡献。正好新人导师让我看看能否把产品目前使用的FileUploader从老的组件库分离出来的，自己也查阅了相关的各种资料，对文件上传的这些事有了更进一步的了解。把这些知识点总结一下，供自己日后回顾，也供有需要的同学参考，同时也欢迎各位大牛拍砖指点共同学习。',
        readPerson: [{
          name: '张某某',
          img: 'https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg',
        }, {
          name: '张某某',
          img: 'https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg',
        }, {
          name: '张某某',
          img: 'https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg',
        }, {
          name: '张某某',
          img: 'https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg',
        }, {
          name: '张某某',
          img: 'https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg',
        }, {
          name: '张某某',
          img: 'https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg',
        }, {
          name: '张某某',
          img: 'https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg',
        }, {
          name: '张某某',
          img: 'https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg',
        }, {
          name: '张某某',
          img: 'https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg',
        }, {
          name: '张某某',
          img: 'https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg',
        }, {
          name: '张某某',
          img: 'https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg',
        }, {
          name: '张某某',
          img: 'https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg',
        }, {
          name: '张某某',
          img: 'https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg',
        }, {
          name: '张某某',
          img: 'https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg',
        }],
        noReadPerson: [{
          name: '张某某',
          img: 'https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg',
        }, {
          name: '张某某',
          img: 'https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg',
        }, {
          name: '张某某',
          img: 'https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg',
        }, {
          name: '张某某',
          img: 'https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg',
        }, {
          name: '张某某',
          img: 'https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg',
        }, {
          name: '张某某',
          img: 'https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg',
        }, {
          name: '张某某',
          img: 'https://static-legacy.dingtalk.com/media/lADPDgQ9qrulS2fNA7zNA9I_978_956.jpg',
        }]
      }, // 文章详情
      showMoreRead: false, // 是否显示已读人员浮框
      showMoreNoRead: false // 是否显示未读人员浮框
    }
  },
  mounted () {
    // 根据formId来判断是否是在新页面打开
    if(!window.frameElement) {
      this.showOpenFrame = false;
      return;
    }
    let formId = window.frameElement.getAttribute('id');
    if(formId.indexOf('bulletin_detail') != -1) this.showOpenFrame = false;
  },
  methods: {
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
        id: `bulletin_detail_${ this.articleId }`,
        title: '通知公告详情',
        url: `/bulletin/detail?id=${ this.articleId }`,
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
      
    },

    async deleteArticle () {
      try {
        if (!await this.$platform.confirm('确定删除该文章吗？')) return;
        // const result = await this.$http.get(`/customer/delete/${this.customer.id}`);
        // if (!result.status) {
        //   let fromId = window.frameElement.getAttribute('fromid');
        //   this.$platform.refreshTab(fromId);

        //   window.location.reload();
        // }
      } catch (e) {
        console.error(e);
      }
    }
  },
  computed: {
    height () {
      return this.showOpenFrame ? 'auto' : '100vh';
    },

    padding () {
      return this.showOpenFrame ? '0 50px' : '0 100px';
    }
  }
}
</script>

<style lang="scss">
.bulletin-list-detail {
  background: #fff;

  .detail-top {
    display: flex;
    justify-content: space-between;
    height: 74px;
    padding: 16px 24px 16px 16px;
    border-bottom: 1px solid #E8EFF0;

    .author {
      font-size: 0;

      .author-img {
        vertical-align: middle;
        display: inline-block;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 15px;
      }
      
      .author-info {
        vertical-align: middle;
        display: inline-block;

        .name {
          font-size: 16px;
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
      line-height: 42px;

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

    .info {

      .title {
        margin: 0;
        padding: 35px 0;
        text-align: center;
        font-size: 32px;
      }

      .content {
        font-size: 16px;
        line-height: 30px;
        padding-bottom: 30px;
      }
    }

    .footer {
      padding: 12px;
      box-shadow:0px 2px 8px 0px rgba(144,171,184,0.5);
      border-radius: 4px;
      font-size: 0;

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
</style>