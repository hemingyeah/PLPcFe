<template>
  <div class="bulletin-list-container">

    <div class="list-content" ref="lisrContent">
      <div class="list-noData" v-if="value.list && value.list.length <= 0">暂无数据</div>

      <div class="list-item" :class="id == item.id ? 'choosed-item' : ''" v-else v-for="item in value.list" :key="item.id">

        <div class="item-top">
          <i class="iconfont icon-fd-attachment" v-if="item.hasAttachment"></i>
          <p class="item-title" ref="title" @click="toDetail(item)" v-html="item.handleTitle"></p>
        </div>

        <div class="item-cursor" @click="toDetail(item)">
          <div class="item-info">
            <span class="name">{{item.createUserName}}</span>
            <span class="time">发布于：{{item.createTime | fmt_datehour}}</span>
            <span class="type">{{item.type}}</span>
          </div>

          <p class="item-content" ref="content" v-html="item.handleContent">{{item.content}}</p>
        </div>

        <div class="item-footer">
          <span class="item-num">已读（{{item.readNum}}）</span>
          <span class="item-num">未读（{{item.unreadNum}}）</span>
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
    },
    value: {
      type: Object,
      default: () => ({})
    },
    id: {
      type: String,
      default: ''
    }
  },
  methods: {
    resetScrollTop () {
      this.$refs.lisrContent.scrollTop = 0;
    },

    toDetail (item) {
      this.$emit('update:id', item.id);
      this.$emit('toDetail', item)
    }
  }
}
</script>

<style lang="scss">
.bulletin-list-container {
  display: flex;
  flex-direction: column;

  background: #fff;
  height: 100%;
  overflow: hidden;

  .list-content {
    overflow: auto;
    flex: 1;

    .list-noData {
      line-height: 40px;
      text-align: center;
      color: #909399;
    }
  }

  .list-item {
    padding: 10px 11px;
    border-bottom: 1px solid #E8EFF0;

    .item-top {
      font-size: 0;
      height: 24px;
      line-height: 24px;

      .icon-fd-attachment {
        vertical-align: middle;
        font-size: 12px;
        margin-right: 5px;
      }

      .item-title {
        display: inline-block;
        margin: 0;
        font-size: 14px;
        font-weight: 500;
        vertical-align: middle;
        width: 390px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        cursor: pointer;
      }
    }
    

    .item-cursor {
      cursor: pointer;

      .item-info {
        font-size: 12px;
        color: #909399;
        width: 100%;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;

        .type {
          margin-left: 20px;
        }
      }

      .item-content {
        margin: 4px 0;
        color: #909399;
        line-height: 17px;
        font-size: 12px;

        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        word-break: break-all;

        img {
          width: 40px;
        }
      }
    }
    

    .item-footer {
      display: inline-block;
      font-size: 12px;

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