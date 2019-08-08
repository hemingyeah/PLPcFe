<template>
  <div class="document-list-container">
    <div class="list-top">符合搜索结果的共<span style="color: #FF7B00">12</span>条</div>
    <div class="list-item">
      <div class="item-top">
        <p class="item-title" ref="title">{{item.title}}</p>
        <el-tag class="review-tag" v-if="item.property == '草稿箱'" :type="item.review == '待审核' ? '' : 'danger'">{{item.review}}</el-tag>
      </div>
      <div class="item-info">
        <span class="name">{{item.name}}</span>
        <span class="time">发布于：{{item.time}}</span>
        <span class="type">{{item.type}}</span>
      </div>
      <p class="item-content" ref="content">{{item.content}}</p>
      <div class="item-footer">
        <div class="type">
          <i class="iconfont icon-chuanjianbaogao icon-tags"></i>
          <el-tag class="search-tag" @click="handleTags(tag)" v-for="(tag,index) in item.tags" :key="index">{{tag}}</el-tag>
        </div>
        <div class="footer-right" v-if="item.property == '我发布的'">
          <span class="permission">
            <i class="iconfont icon-account1 icon-permission" v-if="item.permission"></i>
            <i class="iconfont icon-quanxianguanli icon-permission" v-else></i>
            {{item.permission ? '内部' : '外部'}}
          </span>
          <span class="readNum">阅读（{{item.readNum}}）</span>
          <span class="share">
            <i class="iconfont icon-send icon-share"></i>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'list',
  props: {
    keyword: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      item: {
        property: '草稿箱',
        title: '最前线|微信内测新功能，提升阅读效率没那么容易',
        name: '张某某',
        time: '2019年7月7日 19:03',
        review: '已拒绝',
        type: '分类1/分类1.1',
        content: '作为一枚初入鹅厂的鲜鹅，对这里的一切都充满着求知欲。看到我们的KM平台如此生机勃勃，各种技术分享交流如火如荼，在努力的汲取着养分的同时也期待自己能为这个生态圈做出贡献。',
        tags: ['诚信', '友善', '进取'],
        permission: true,
        readNum: 10086
      }
    }
  },
  created () {
    this.highlight()
  },
  methods: {
    handleTags (tag) {
      this.$emit('tag', tag);
    },
    highlight () {
      if(!this.keyword) return;
      let replaceReg = new RegExp(this.keyword, 'g');
      let replaceString = `<span style="color: #FF7B00">${ this.keyword }</span>`;
      this.$refs.content.innerHTML = this.item.content.replace(replaceReg, replaceString);
      this.$refs.title.innerHTML = this.item.title.replace(replaceReg, replaceString);
    }
  },
  watch: {
    keyword (n, o) {
      this.highlight();
    }
  }
}
</script>

<style lang="scss">
.document-list-container {
  background: #fff;

  .list-top {
    height: 40px;
    line-height: 40px;
    padding: 0 11px;
    color: #909399;
  }

  .list-item {
    padding: 11px;
    border-bottom: 1px solid #E8EFF0;

    .item-top {
      font-size: 0;

      .item-title {
        display: inline-block;
        width: 300px;
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        vertical-align: middle;
      }

      .review-tag {
        vertical-align: middle;
        margin-left: 24px;
      }
    }
    

    .item-info {
      padding: 4px 0;
      font-size: 12px;
      color: #909399;

      .type {
        margin-left: 20px;
      }
    }

    .item-content {
      margin: 0;
      padding: 4px 0;
      color: #909399;
      line-height: 22px;
    }

    .item-footer {
      padding-top: 10px;
      display: flex;
      justify-content: space-between;

      .icon-tags {
        font-size: 14px;
        color: #B0BCC3;
      }

      .search-tag {
        margin-left: 4px;
        border: none;
        background: #E8EFF0;
        color: #606266;
      }

      .icon-permission {
        font-size: 14px;
        color: #B0BCC3;
        margin-right: 3px;
      }

      .readNum {
        margin: 0 15px;
      }

      .icon-share {
        font-size: 14px;
        color: #38A6A6;
      }
    }
  }
}
</style>