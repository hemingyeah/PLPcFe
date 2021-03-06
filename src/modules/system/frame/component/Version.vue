<template>
  <transition name="slide-down">
    <div class="version-mask" v-if="show">
      <div class="version transition-container">
        <div class="version-banner">
          <img src="../../../../assets/img/version-banner-v2.png">
        </div>
        <h3 class="version-title">售后宝 | {{ editionText }} {{versionNum}} 更新说明</h3>
        <div class="version-description" v-html="description"></div>
        <div class="version-bottom">
          <button type="button" class="btn btn-text" @click="show = false">知道了</button>
          <button type="button" class="btn btn-text version-btn" @click="seeHelp">了解更多</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import http from '@src/util/http';
import platform from '@src/platform'
import Platform from '@src/util/Platform'

const VERSION_NUM_KEY = 'shb_version_num';
const EditionMap = {
  '1': 'VIP版',
  '2': '标准版',
  '3': '企业版',
  '4': '体验版'
}

export default {
  name: 'version',
  inject: ['initData'],
  props: {
    edition: {
      type: Number
    },
    version: String
  },
  data(){
    return {
      show: false,
      versionNum: '',
      description: '',
    }
  },
  watch:{
    'show'(val){
      if(!val){
        this.$emit('showSystemPopup', true)
      }
    }
  },
  computed: {
    tenantType() {
      return this.initData.tenantType;
    },
    editionText() {
      return EditionMap[this.edition] || EditionMap[1]
    }
  },
  methods: {
    /** 检测是否有版本更新提示 */
    async checkVersion(){
      let currVersion = localStorage.getItem(VERSION_NUM_KEY);
      let version = this.version;
      if(version && (!currVersion || currVersion != version)){
        // 只有在显示提示信息后，才更新本地缓存
        if(await this.showVersion()) localStorage.setItem(VERSION_NUM_KEY, this.version);       
      }else{
        this.$emit('showSystemPopup', true)
      }
    },
    async showVersion(){
      try {
        let result = await http.get('/getLastVersion');
        let lastVersion = result.data || {};
        
        this.versionNum = lastVersion.versionNum.toLocaleLowerCase().replace('vip', '');
        this.description = lastVersion.description;
        this.show = true;
        
        return true;
      } catch (error) {
        console.error(error);
      }  

      return false;
    },
    seeHelp(){
      let updatelog = !Platform.isDingTalk() ? 'updatelog2' : 'updatelog'
      platform.openLink(`https://www.yuque.com/shb/${updatelog}/${this.version.replace(' ', '')}`);
      this.show = false;
    }
  },
  mounted(){
    this.checkVersion();

    // 导出显示版本信息接口，方面子页面调用
    window.shb_global_showVersion = this.showVersion;
  }
}
</script>

<style lang="scss">
.version-mask{
  @include mask();
  z-index: 999;
  overflow: auto;
}

.version{
  position: relative;
  margin: 100px auto 20px auto;
  background-color: #fff;
  width: 420px;
  box-shadow: 1px 1px 8px rgba(0,0,0,0.15);
  color: #333;
}

.version-banner{
  position: relative;
  padding-top: 1px;
  user-select: none;

  img{
    width: 100%;
    display: block;
    overflow: hidden;
    margin: -35px 0 0 0;
  }
}

.version-title{
  font-size: 20px;
  text-align: center;
  padding: 8px 0 15px 0;
  margin: 0;
}

.version-description{
  padding: 5px 30px 20px 30px;
  max-height: 240px;
  overflow: auto;

  p{
    margin-bottom: 8px !important;

    &:last-child{
      margin-bottom: 0 !important;
    }
  }
}

.version-description p{
  line-height: 20px;

  &:last-child{
    margin-bottom: 0 !important;
  }
}
.version-bottom{
  text-align: center;
  padding: 10px 15px;
  overflow: hidden;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
  border-top: 1px solid #f0f0f0;

  button.btn{
    width: 100px;
    height: 32px;
    padding: 0;
    color: $color-primary;
    line-height: 32px;
  }
}

.version-btn{
  font-size: 14px;
  color: #fff !important;
  border: none;
  outline: none;
  background-color: $color-primary;
  border-radius: 4px;
  box-shadow: 0 1px 4px 0px rgba($color-primary,0.5);
  &:hover {
    border-color: $color-primary !important;
    background-color: $color-primary !important;
  }
}
</style>