<template>
  <div class="app-frame-tab-window" v-show="frameTab.show">
    <iframe :id="`frame_${frameTab.id}`" :src="frameTab.url"></iframe>
  </div>
</template>

<script>
export default {
  name: 'frame-tab-content',
  props: {
    frameTab: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

