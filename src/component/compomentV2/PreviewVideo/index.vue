<!--  -->
<template>
  <div id="normal-preview-video">
    <base-modal title="视频预览"
                :show.sync="visible"
                width="500px"
                class="batch-editing-customer-dialog">
      <div class="preview-video-box">
        <video class="preview-video"
               :src="url"
               controls="controls"
               autoplay="autoplay">
          您的浏览器不支持 video 标签。
        </video>
      </div>

    </base-modal>
  </div>
</template>

<script>
export default {
  props: {
    url: {
      type: String,
    },
  },
  data () {
    return {
      visible: true,
    };
  },
};
</script>
<style lang="scss" scoped>
.preview-video-box {
  padding: 12px;
  .preview-video {
    width: 100%;
    height: 100%;
    max-height: 50vh;
  }
}
</style>
