<template>
  <div class="document-update-log">
    <div class="title">更新日志</div>

    <div class="document-timeline" ref="timeline">
      <base-timeline 
        :data="recordPage.list" 
        :record-render="renderRecord" 
        :loading="recordLoading"
        :loadmore="recordPage.hasNextPage"
        @load="loadmore"/>
    </div>
  </div>
</template>

<script>
import Page from '@model/Page';

export default {
  name: 'update-log',
  data () {
    return {
      recordPage: new Page(),
      recordLoading: false,
    }
  },
  methods: {
    loadmore () {

    },
    /** 根据记录的action渲染对应的内容，支持jsx和render函数 */
    renderRecord (h, item) {

    }
  }
}
</script>

<style lang="scss">
.document-update-log {
  
  .title {
    height: 45px;
    line-height: 45px;

    font-size: 16px;

    padding-left: 15px;
    border-bottom: 1px solid #D8E5EE;
  }
}
</style>