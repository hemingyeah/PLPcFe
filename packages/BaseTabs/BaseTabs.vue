<template>
  <div class="base-tabs">
    <div class="base-tabs-head">
      <ul class="base-tabs-nav">
        <li v-for="page in pages" 
            :key="page.id" 
            :class="{'base-tabs-actived': page.id == value}" 
            @click="active(page)">
          <a href="javascript:;" @click.stop="reload(page)">刷新</a>
          {{page.title}} 
          <a href="javascript:;" @click.stop="remove(page)">x</a>
        </li>
      </ul>
    </div>
    <div class="base-tabs-content">
      <div class="base-tabs-page" v-for="page in pages" :key="page.id" v-show="page.id == value">
        <iframe :src="page.url" :id="`iframe_${page.id}`"></iframe>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'base-tabs',
  props: {
    pages: {
      type: Array,
      default: {}
    },
    value: {
      type: String,
      default: ''
    }
  },
  methods: {
    remove(item){
      this.$emit('remove', item)
    },
    reload(item){
      let iframeId = `iframe_${item.id}`;
      let iframe = document.getElementById(iframeId);
      if(iframe){
        let win = iframe.contentWindow
        win && win.location.reload();
      }
    },
    active(item){
      this.$emit('input', item.id)
    }
  }
}
</script>

<style lang="scss">
.base-tabs{
  height: 100%;
}

.base-tabs-head{
  width: 100%;
  height: 40px;
  overflow: hidden;
}

.base-tabs-nav{
  list-style: none;
  margin: 0;
  padding: 0;
  height: 40px;
  line-height: 40px;

  display: flex;
  flex-flow: row nowrap;

  li{
    display: block;
    min-width: 100px;
    margin: 0 5px;
    cursor: pointer;
  }
}

.base-tabs-content{
  height: calc(100% - 40px);
}
.base-tabs-page{
  height: 100%;
  position: relative;
}

.base-tabs-actived{
  background-color: #00ac97;
}
</style>

