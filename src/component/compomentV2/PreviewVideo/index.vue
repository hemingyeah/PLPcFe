<!--  -->
<template>
  <div id="normal-preview-video">
    <el-dialog
      title="视频预览"
      :visible.sync="visible"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="preview-video-box">
        <video
          class="preview-video"
          :src="url"
          controls="controls"
          autoplay="autoplay"
        >
          您的浏览器不支持 video 标签。
        </video>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    url: {
      type: String,
    },
  },
  data() {
    return {
      visible: true,
    };
  },
  created() {},
  mounted() {},
};
</script>
<style lang="scss" scoped>
.preview-video-box {
  padding: 12px;
  .preview-video {
    width: 100%;
    height: 100%;
  }
}
</style>
