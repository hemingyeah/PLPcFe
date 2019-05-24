<template>
  <!-- star 用户向导 -->
  <base-modal :show.sync="isShowUserGuide" width="600px" class="user-guide-modal-dialog" :class="isGuideLast ? 'base-modal-header-hidden' : ''">
    <div slot="title">
      <h3 class="user-guide-modal-header" slot="reference">立刻设置您的个性化系统</h3>
    </div>
    <div class="user-guide-view" @click.prevent v-if="isShowUserGuide">
      <guide-view :init-data="initData" @isLast="guideLast" @guideUpdateModalShow="guideUpdateModalShow">
      </guide-view>
    </div>
  </base-modal>
  <!-- end 用户向导 -->
</template>

<script>
import GuideView from './../../guide/GuideView.vue';

export default {
  name: 'user-guide',
  inject: ['initData'],
  data() {
    return {
      // 用户向导
      isShowUserGuide: false,
      isGuideLast: false,
    }
  },
  methods: {
    guideLast(data) {
      this.isGuideLast = data;
    },
    guideUpdateModalShow() {
      this.isShowUserGuide = false;
    },
    show() {
      this.isShowUserGuide = true;
    }
  },
  components: {
    [GuideView.name]: GuideView
  }
}
</script>

<style lang="scss">

</style>
