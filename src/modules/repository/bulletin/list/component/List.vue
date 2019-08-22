<template>
  <div class="bulletin-list-container">

    <div class="list-top">符合搜索结果的共<span style="color: #FF7B00">{{total}}</span>条</div>

    <div class="list-item" :class="{'choosed-item': id}">

      <div class="item-top">
        <p class="item-title" ref="title" @click="toDetail(item)">{{item.title}}</p>
      </div>

      <div class="item-info">
        <span class="name">{{item.name}}</span>
        <span class="time">发布于：{{item.time}}</span>
        <span class="type">{{item.type}}</span>
      </div>

      <p class="item-content" ref="content">{{item.content}}</p>

      <div class="item-footer">
        <span class="item-num">已读（{{item.readNum}}）</span>
        <span class="item-num">未读（{{item.noReadNum}}）</span>
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
        title: '最前线|微信内测新功能，提升阅读效率没那么容易',
        name: '张某某',
        time: '2019年7月7日 19:03',
        type: '分类1/分类1.1',
        content: '作为一枚初入鹅厂的鲜鹅，对这里的一切都充满着求知欲。看到我们的KM平台如此生机勃勃，各种技术分享交流如火如荼，在努力的汲取着养分的同时也期待自己能为这个生态圈做出贡献。',
        readNum: 10086,
        noReadNum: 3344
      },
      total: 12,
      id: true,
    }
  },
  methods: {
    // 根据关键词设置高亮字段
    highlight () {
      if(!this.keyword) return;
      let replaceReg = new RegExp(this.keyword, 'g');
      let replaceString = `<span style="color: #FF7B00">${ this.keyword }</span>`;
      this.$refs.content.innerHTML = this.item.content.replace(replaceReg, replaceString);
      this.$refs.title.innerHTML = this.item.title.replace(replaceReg, replaceString);
    },

    toDetail (item) {
      this.id = '02900f0c-c481-11e9-bfc9-00163e304a25';
      let info = {
        id: this.id
      }
      this.$emit('toDetail', info)
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
.bulletin-list-container {
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
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        vertical-align: middle;

        cursor: pointer;
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

      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }

    .item-footer {
      padding-top: 10px;
      display: inline-block;

      .item-num {
        display: inline-block;
        margin-right: 10px;
      }
    }
  }

  .choosed-item {
    background: #F5F7FA;
  }
}
</style>