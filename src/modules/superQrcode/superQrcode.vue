<template>
  <div class="setting-wrapper">
    <div id="product-superqrcode-set"></div>
    <div class="left-menu">
      <h3>产品二维码配置</h3>
      <el-cascader class="catalog"
                   id="product-superqrcode-set-1"
                   v-model="catalogId"
                   expand-trigger="hover"
                   filterable
                   :options="catalogList"
                   :show-all-levels="false"
                   :props="{
                     expandTrigger: 'hover',
                     value: 'id',
                     label: 'name',
                     children: 'tasks'
                   }"
                   @change="catalogChange"
                   @visible-change='cascaderShow'></el-cascader>
      <p class="no-catalog"
         v-if="noCatalog">未关联类型超级二维码模板</p>

      <ul class="options">
        <li v-for="(item, index) in noCatalog?options.filter(item=>item.show):options"
            :id="item.id"
            :key="index"
            class="bg-w"
            :class="getClass(item)"
            @click="chooseOption(item)">
          {{ item.label }}
          <i class="el-icon-check icon_check"
             v-if="item.saved"></i>
        </li>
      </ul>
    </div>

    <div class="main">
      <div class="setting-bg">
        <div class="setting-data-box">
          <div class="index-wrapper"
               v-if="nowOption === 'pic' || nowOption === 'intro' || nowOption === 'service'">
            <div v-if="
                   !settingInfo.companyImages
                 "
                 @click="changeType('pic')"
                 class="setting-swipe setting-swipe-noimg"
                 :class="nowOption === 'pic' ? 'choose-border' : ''"></div>
            <div v-if="settingInfo.companyImages && settingInfo.companyImages.length === 1"
                 @click="changeType('pic')"
                 class="setting-swipe"
                 :class="nowOption === 'pic' ? 'choose-border' : ''"
                 :style="bgStyle(settingInfo.companyImages[0].url)"></div>
            <el-carousel v-if="settingInfo.companyImages && settingInfo.companyImages.length>1"
                         height="140px"
                         arrow="never"
                         :class="nowOption === 'pic' ? 'choose-border' : ''">
              <el-carousel-item v-for="item in settingInfo.companyImages"
                                :key="item.id">
                <img :src="item.url"
                     class="swipe-img"
                     @click="changeType('pic')" />
              </el-carousel-item>
            </el-carousel>

            <h3>产品名称</h3>
            <div class="intro"
                 @click="changeType('intro')"
                 :class="introClass">
              <span>{{ settingInfo.productIntroduction }}</span>
              <a v-if="!noCatalog"
                 class="intro-change"
                 @click="showDetail = !showDetail">{{
                   showDetail ? "收起" : "展开"
                 }}</a>
            </div>

            <ul class="two-panel">
              <li @click="changeType('contact')">
                <img src="../../assets/img/customer_ser.png" />
                <span>马上联系</span>
              </li>
              <li @click="changeType('service')">
                <img src="../../assets/img/selfService.png" />
                <span>自助服务</span>
              </li>
            </ul>

            <div class="box-card">
              <h4>某某设备管理科技有限公司</h4>
              <p style="width: 78%"
                 @click="changeType('comInfo')">
                XXX设备管理科技有限公司是一家致力于生产高新技术产品的企业...
              </p>
              <img src="../../assets/img/myShop/logo.png" />
              <a href="javascript:;">详情 ></a>
            </div>

            <div class="service-box"
                 v-if="nowOption==='service'">
              <ul>
                <li v-for="(item,index) in eventTypeList"
                    :key="item.id">
                  <img :src="index | getSrc">
                  <p>{{item.name}}</p>
                </li>
              </ul>
            </div>

          </div>

          <div v-if="nowOption === 'contact'"
               class="contact-wrapper">
            <div class="contact-top">
              <div class="contact-info">
                <img src="../../assets/img/cusService.png">
                <div class="contact-info-right">
                  <h3>胜利</h3>
                  <p>
                    <i class="iconfont icon-dianhua2"></i>
                    18888888888
                  </p>
                  <p>
                    <i class="iconfont icon-address"></i>
                    浙江省杭州市余杭区文一西路未来park
                  </p>
                </div>
              </div>

              <ul class="contact-btns">
                <li>
                  <i class="iconfont icon-dianhua2"></i>
                  <span>马上联系</span>
                </li>
                <li>
                  <i class="iconfont icon-weixin"></i>
                  <span>加我微信</span>
                </li>
              </ul>
            </div>
            <div class="contact-bottom">
              <h3>服务星级</h3>
              <div class="stars">
                <i v-for="item in 5"
                   :key="item"
                   class="iconfont icon-favorfill"></i>
              </div>
            </div>
          </div>

          <!-- <ul v-if="nowOption === 'service'" class="service-wrapper">
            <li v-for="item in quickInfos" :key="item.eventTempId">
              <img :src="item.iconType | getSrc">
              <p>{{item.name}}</p>
            </li>
          </ul> -->

          <div v-if="nowOption === 'comInfo'"
               class="com-wrapper">
            <img :src="(comData && comData.attribute.logoUrl) || defaultLogo">

            <ul>
              <li>
                <span>企业名称</span>
                <p>{{showCompanyName(comData)}}</p>
              </li>
              <li>
                <span>企业地址</span>
                <p>{{comData && comData.attribute.basicCompanyAddress}}</p>
              </li>
              <li>
                <span>联系电话</span>
                <p>
                  {{comData && comData.cellPhone}}
                  <i class="iconfont icon-dianhua2"></i>
                </p>
              </li>
            </ul>

            <div id='mapWrapper'
                 v-if="nowOption==='comInfo'"
                 style="height:166px;"></div>
          </div>

          <div v-if="nowOption === 'proInfo' || nowOption==='video' || nowOption==='knowledge' || nowOption==='part'"
               class="pro-wrapper">
            <ul @click="changeType('proInfo')"
                class="round-panel top-panel"
                :class="nowOption === 'proInfo' ? 'choose-border' : ''">
              <li v-for="item in settingInfo.showFields.filter(s=>s.showFlag=='1')"
                  :key="item.fieldName">
                <p>
                  {{item.displayName}}
                  <span>“字段值”</span>
                </p>
              </li>
            </ul>
            <div v-if="settingInfo.productVideo && settingInfo.videoOpenState"
                 @click="changeType('video')"
                 class="round-panel middle-panel"
                 :class="nowOption === 'video' ? 'choose-border' : ''"
                 @mouseenter="mouseEnter"
                 @mouseleave="mouseLeave">
              <h3 style="margin-top:5px;margin-left:5px;">{{settingInfo.productVideo[0] && settingInfo.productVideo[0].filename}}</h3>
              <!-- <span class="video-title">{{settingInfo.productVideo[0] && settingInfo.productVideo[0].filename}}</span> -->
              <div style="height:200px;">
                <i class="iconfont"
                   v-show="videoFlagShow"
                   :class="videoPlay?'icon-zanting':'icon-kaishi'"
                   @click="play"></i>
                <video ref="video"
                       @loadedmetadata="videoLoaded"
                       :src="settingInfo.productVideo[0] && settingInfo.productVideo[0].url"
                       style="object-fit:fill;"
                       width="319px"
                       height="100%">浏览器不支持video</video>
                <span class="video-time">{{videoTime}}</span>
              </div>
            </div>
            <div v-if="!settingInfo.productVideo && settingInfo.videoOpenState"
                 @click="changeType('video')"
                 class="round-panel middle-panel no-video"
                 :class="nowOption === 'video' ? 'choose-border' : ''">
              暂无视频
            </div>
            <div id="part"
                 v-if="settingInfo.partOpenState"
                 @click="changeType('part')"
                 class="bottom-panel round-panel"
                 :class="nowOption === 'part' ? 'choose-border' : ''">
              <div class="title">
                <span>关联备件</span>
                <a href="javascript:;">更多 ></a>
              </div>
              <div class="part-item"
                   v-for="item in partList"
                   :key="item.id">
                <div class="part-img"
                     v-if="item.imageList && item.imageList[0]"
                     :style="{background:`url(${item.imageList[0]}) no-repeat center center`,backgroundSize:'100% 100%'}"></div>
                <div class="part-img part-no-img"
                     v-else></div>
                <div class="part-name">{{item.name}}</div>
              </div>
            </div>
            <div id="knowledge"
                 v-if="settingInfo.knowledgeOpenState"
                 @click="changeType('knowledge')"
                 class="bottom-panel round-panel"
                 :class="nowOption === 'knowledge' ? 'choose-border' : ''">
              <div class="title">
                <span>知识库</span>
                <a href="javascript:;">更多 ></a>
              </div>
              <div class="circle-item-wrapper">
                <div class="circle-item"
                     v-for="item in knowledgeList"
                     :key="item.id">
                  <span class="circle-title">{{item.title}}</span>
                  <div class="circle-info">
                    <span class="circle-author">{{item.createUserName}}</span>
                    <div class="read-count">
                      <span class="circle-read-text">阅读</span>
                      <span class="circle-read-count">{{item.readTimes | formatNum}}</span>
                    </div>
                  </div>
                </div>
              </div>
              <!-- <ul class="knowledge">
                <li v-for="(item,index) in settingInfo.knowledge" :key="index">
                  <p class="article-title">{{item.title}}</p>
                  <span class="author">{{item.author}}</span>
                  <p class="num">
                    <span class="num-text">阅读</span>
                    <span>{{item.num | formatNum}}</span>
                  </p>
                </li>
              </ul> -->
            </div>
          </div>

          <!-- <div v-if="nowOption === 'part'" class="part-wrapper"></div> -->

          <div v-if="nowOption === 'mall'"
               class="mall-wrapper"></div>
        </div>
      </div>
    </div>

    <right-menu class="right-menu"
                :now-option='nowOption'
                :all-options='options'
                :form='settingInfo'
                :tenant-id='tenantId'
                :user-id='userId'
                :rules='rules'
                :no-catalog='noCatalog'
                :all-event-type-list='allEventTypeList'
                :event-type-id-list='eventTypeIdList'
                @changeEventType='changeEventType'
                @addPic='addPic'
                @delPic='delPic'
                @save='save'
                @changeState='changeState'
                v-if="rightMenuFlag"></right-menu>
  </div>
</template>

<script>
import rightMenu from './component/rightMenu';
import MAP_MARKER from '../../assets/img/marker.png';
import { getRootWindow } from '@src/util/dom';
import { get } from 'lodash';
import {
  queryProductCatalogs,
  syncCatalogInfo,
  queryProductSetting,
  queryCompanyInfo,
  querySettingRules,
  queryEventType,
  queryRelParts,
  queryRelKnowledge
} from '@src/api/SuperQrcode';


import { storageGet, storageSet } from '@src/util/storage';
import GuideContent from '@src/component/guide/contentCom/ProductSuperqrcodeSet.vue';

const {
  PRODUCT_SUPERQRCODE_SET
} = require('@src/component/guide/productV2Store');

let map = null;

export default {
  name: 'super-qrcode',
  data () {
    return {
      stopRecursion: false, // 找到有详情目录后停止递归
      noCatalog: false, // 没有有详情的目录，选择默认模板
      total: 0, // 总目录条数
      getTotal: 0, // 获取第一条有详情目录时的条数
      rightMenuFlag: false,
      catalogId: [],
      currentCatalog: null,
      fakeCataId: [],
      tenantId: null,
      userId: null,
      catalogList: [],
      defaultLogo: require('../../assets/img/tenant_defaultLogo.jpg'),
      options: [
        { label: '首页配置项', show: true, id:'product-superqrcode-set-2' },
        { label: '产品图片', type: 'pic', show: true },
        { label: '产品简介', type: 'intro', show: true },
        { label: '马上联系', type: 'contact', show: true },
        { label: '自助服务', type: 'service', show: true },
        { label: '企业资料', type: 'comInfo', show: true },
        { label: '产品配置项', show: true, id:'product-superqrcode-set-3' },
        { label: '产品资料', type: 'proInfo', show: true },
        { label: '产品视频', type: 'video', show: false },
        { label: '关联知识库', type: 'knowledge', show: false },
        { label: '关联备件', type: 'part', show: false },
        { label: '商城配置', show: true, id:'product-superqrcode-set-4' },
        { label: '门户商城', type: 'mall', show: true },
      ],
      nowOption: 'pic',

      settingInfo: {
        companyImages: null,
        showFields: [],
        productVideo: [],
        knowledge: []
      },
      quickInfos: [],
      rules: [],

      showDetail: false,

      videoPlay: false,
      videoFlagShow: true,
      videoTime: '',

      comData: null,

      allEventTypeList: [],
      eventTypeList: [],
      eventTypeIdList: [],

      partList: [],
      knowledgeList: []
    };
  },
  computed: {
    introClass () {
      let clz = '';
      if (!this.showDetail) {
        clz = 'intro-cut';
      }
      if (this.nowOption === 'intro') {
        clz += ' choose-border';
      }
      return clz;
    }
  },
  watch: {
    nowOption (val) {
      if (val !== 'proInfo' && val !== 'video' && val !== 'knowledge') {
        this.videoPlay = false;
      }
      if (val === 'comInfo') {
        if (this.comData) {
          this.initmap();
        }
      } else {
        map && map.destroy();
      }
    }
  },
  mounted () {
    try {
      const rootWindow = getRootWindow(window);
      this.tenantId = JSON.parse(rootWindow._init).user.tenantId;
      this.userId = JSON.parse(rootWindow._init).user.userId;
    } catch (err) {
      this.tenantId = '7416b42a-25cc-11e7-a500-00163e12f748';
      this.userId = 'b9510211-d82f-11e8-b3c6-00163e304a25';
    }

    this.getCatalogList();

    this.$nextTick(() => {
      if (storageGet(PRODUCT_SUPERQRCODE_SET) && storageGet(PRODUCT_SUPERQRCODE_SET) > 0) this.$Guide().destroy('product-superqrcode-set')
      else this.$Guide([{
        content:
          '选择产品类型，产品可关联对应的产品类型，丰富产品内容',
        haveStep: true,
        nowStep: 1,
        id: 'product-superqrcode-set',
        domId: 'product-superqrcode-set-1',
        needCover:true,
        finishBtn: 'ok',
      }, {
        content:
          '在这里可自定义展示的产品信息、服务人员信息、企业信息、自助服务等内容',
        haveStep: true,
        nowStep: 2,
        id: 'product-superqrcode-set',
        domId: 'product-superqrcode-set-2',
        needCover:true,
        finishBtn: 'ok',
      }, {
        content:
          '在这里定义是否展示产品类型、备件库、知识库等信息',
        haveStep: true,
        nowStep: 3,
        id: 'product-superqrcode-set',
        domId: 'product-superqrcode-set-3',
        needCover:true,
        finishBtn: 'ok',
      }, {
        content:
          '',
        haveStep: true,
        nowStep: 4,
        id: 'product-superqrcode-set',
        domId: 'product-superqrcode-set-4',
        finishBtn: 'ok',
        diyContent: true,
        needCover:true,
        diyContentDom: GuideContent
      }], 0, '', (e) => {
        return new Promise((resolve, reject) => {
          resolve()
        })
      }).create().then(res_=>{if(res_)storageSet(PRODUCT_SUPERQRCODE_SET, '4')})
    })
  },
  filters: {
    formatNum (_num) {
      if (_num < 10000) {
        return _num;
      }
      return `${(_num / 10000).toFixed(1)}万`;

    },
    getSrc (_type) {
      return require(`../../assets/img/myShop/newIcon${_type % 5}.png`);
    }
  },
  methods: {
    // 获取知识库
    async queryRelKnowledge () {
      const params = {
        tenantId: this.tenantId,
        catalogId: this.catalogId[this.catalogId.length - 1],
        keyWord: '',
        pageNum: 1,
        pageSize: 2
      }
      let res = await queryRelKnowledge(params);
      if (res.code === '200') {
        this.knowledgeList = res.data.list;
      } else {
        this.$notify.error({
          title: '网络错误',
          message: res.data,
          duration: 2000,
        });
      }
    },
    // 获取备件
    async queryRelParts () {
      const params = {
        tenantId: this.tenantId,
        catalogId: this.catalogId[this.catalogId.length - 1],
        pageNum: 1,
        pageSize: 6
      }
      let res = await queryRelParts(params);
      if (res.code === '200') {
        this.partList = res.data.list;
        if (Array.isArray(this.partList)) {
          this.partList.forEach(item => {
            if (item.imageList) {
              item.imageList = JSON.parse(item.imageList);
            }
          });
        }
      } else {
        this.$notify.error({
          title: '网络错误',
          message: res.data,
          duration: 2000,
        });
      }
    },
    // 企业名称
    showCompanyName (comData) {
      if (comData.showNickName === 1 && comData.nickName) {
        return comData.nickName
      }
      return comData.tenantName
    },
    // 产品类型选择样式修改，移动到无子项时隐藏右侧弹框
    cascaderShow (val) {
      if (val) {
        this.$nextTick(() => {
          document.querySelector('.el-cascader-menu').addEventListener('mouseover', this.cascaderFunc);
        })
      } else {
        document.querySelector('.el-cascader-menu').removeEventListener('mouseover', this.cascaderFunc);
      }
    },
    cascaderFunc (e) {
      if (e.target.nodeName === 'LI') {
        const ariaOwns = e.target.getAttribute('aria-owns');
        if (ariaOwns) {
          if (document.getElementById(ariaOwns)) document.getElementById(ariaOwns).style.display = '';
        } else {
          if (e.target.parentNode.nextElementSibling) e.target.parentNode.nextElementSibling.style.display = 'none';
        }
      }
    },
    // 改变事件类型模板
    changeEventType (ids) {
      this.eventTypeList = this.allEventTypeList.filter(item => ids.find(id => item.id === id));
    },
    // 查询事件类型列表
    async queryEventType (id = '') {
      const params = {
        tenantId: this.tenantId,
        id
      }
      let res = await queryEventType(params);
      if (res.code === '200') {
        if (id === '') {
          this.allEventTypeList = res.data;
          this.queryEventType(this.settingInfo.id);
        } else {
          this.rightMenuFlag = true;
          this.eventTypeList = res.data;
          if (res.data) {
            this.eventTypeIdList = res.data.map(item => item.id);
          }
        }
      } else {
        this.$notify.error({
          title: '网络错误',
          message: res.msg,
          duration: 2000,
        });
      }
    },
    // 查询全部规则
    async querySettingRules () {
      const params = {
        tenantId: this.tenantId,
        enabled: 1
      }
      let res = await querySettingRules(params);
      if (res.code === '200') {
        this.rules = res.data;
      } else {
        this.$notify.error({
          title: '网络错误',
          message: res.msg,
          duration: 2000,
        });
      }
    },
    // 显示、隐藏产品视频
    changeState (val) {
      const option = this.nowOption;
      if (option === 'video') {
        this.settingInfo.videoOpenState = val ? 1 : 0;
      } else if (option === 'knowledge') {
        this.settingInfo.knowledgeOpenState = val ? 1 : 0;
      } else if (option === 'part') {
        this.settingInfo.partOpenState = val ? 1 : 0;
      }
    },
    // 保存成功
    save (type) {
      switch (type) {
      case 'pic':
        this.changeType('intro');
        break;
      case 'intro':
        this.changeType('contact');
        break;
      case 'contact':
        this.changeType('service');
        break;
      case 'service':
        this.changeType('comInfo');
        break;
      case 'comInfo':
        this.changeType('proInfo');
        break;
      case 'proInfo':
        if (this.noCatalog) {
          this.changeType('mall');
        } else {
          this.changeType('video');
        }
        break;
      case 'video':
        this.changeType('knowledge');
        break;
      case 'knowledge':
        this.changeType('part');
        break;
      case 'part':
        this.changeType('mall');
        break;
      case 'mall':
        this.changeType('pic');
        break;
      default:
        break;
      }
      if (type === 'contact' || type === 'comInfo') return
      let saveItem = this.options.find(item => item.type === type);
      saveItem.saved = true;
    },
    // 添加图片
    addPic (list) {
      this.settingInfo.companyImages = list;
    },
    // 删除图片
    delPic (index) {
      // this.settingInfo.companyImages.splice(index,1);
    },
    // 获取目录
    async getCatalogList () {
      let res = await queryProductCatalogs({ tenantId: this.tenantId })
      if (res.code === '200') {
        this.catalogList = res.data;
        this.isDisabled(this.catalogList);
        this.getFirstCatalog(this.catalogList, true);
      } else {
        this.$notify.error({
          title: '网络错误',
          message: res.msg,
          duration: 2000,
        });
      }
    },
    // 选择第一个可选目录
    getFirstCatalog (list, isTop = false) {
      for (let item of list) {
        this.getTotal++;
        if (this.stopRecursion) return
        if (isTop) {
          this.fakeCataId = [item.id];
        } else {
          this.fakeCataId.push(item.id);
        }
        if (item.tasks && item.tasks.length > 0) {
          this.getFirstCatalog(item.tasks);
        } else {
          if (item.conData) {
            this.stopRecursion = true;
            this.catalogId = this.fakeCataId;
            this.currentCatalog = this.catalogId[this.catalogId.length - 1];
            return this.queryCatalogInfo();
          }
        }
      }
      if (this.getTotal === this.total && !this.stopRecursion) { // 递归完也没有有详情目录
        this.noCatalog = true;
        this.catalogId = [0];
        this.syncCatalogInfo();
      }
    },
    // 选择目录
    catalogChange (value) {
      if (value[value.length - 1] === this.currentCatalog) {
        return
      }
      this.options.forEach(item => {
        item.saved = false;
      });
      this.nowOption = 'pic';
      if (this.catalogId[0] === 0) {
        this.noCatalog = true;
      } else {
        this.noCatalog = false;
      }
      this.currentCatalog = value[value.length - 1];
      this.rightMenuFlag = false;
      if (value.length === 1 && value[0] === 0) {
        this.syncCatalogInfo();
      } else {
        this.queryCatalogInfo();
      }
    },
    // 目录是否选择
    isDisabled (list) {
      list.forEach((item) => {
        this.total++;
        if (item.tasks && item.tasks.length === 0) {
          item.disabled = !item.conData;
          delete item.tasks;
        }
        if (item.tasks && item.tasks.length > 0) {
          this.isDisabled(item.tasks);
        }
      });
    },
    // 选中默认目录后同步数据
    async syncCatalogInfo () {
      const params = {
        userId: this.userId,
        tenantId: this.tenantId,
        catalogId: this.catalogId[this.catalogId.length - 1]
      }
      let res = await syncCatalogInfo(params);
      if (res.code === '200') {
        this.queryProductSetting();
        this.querySettingRules();
        this.queryCompanyInfo();
        this.queryRelParts();
        this.queryRelKnowledge();
      } else {
        this.$notify.error({
          title: '网络错误',
          message: res.msg,
          duration: 2000,
        });
      }
    },
    // 选中目录后获取数据（有目录不用同步）
    queryCatalogInfo () {
      this.queryProductSetting();
      this.querySettingRules();
      this.queryCompanyInfo();
      this.queryRelParts();
      this.queryRelKnowledge();
    },
    // 查询单个目录详情
    async queryProductSetting () {
      const params = {
        catalogId: this.catalogId[this.catalogId.length - 1],
        tenantId: this.tenantId
      }
      let res = await queryProductSetting(params);
      if (res.code === '200') {
        this.settingInfo = res.data;

        this.queryEventType();
      } else {
        this.$notify.error({
          title: '网络错误',
          message: res.msg,
          duration: 2000,
        });
      }
    },
    // 获取企业资料
    async queryCompanyInfo () {
      const params = {
        tenantId: this.tenantId
      }
      let res = await queryCompanyInfo(params);
      if (res.code === '200') {
        this.comData = res.data;
      } else {
        this.$notify.error({
          title: '网络错误',
          message: res.msg,
          duration: 2000,
        });
      }
      this.initmap();
    },
    // 初始化地图
    initmap () {
      const dom = document.getElementById('mapWrapper');
      if (!dom) {
        setTimeout(() => {
          this.initmap();
        }, 500);
        return
      }
      map && map.destroy();
      let longitude = this.comData.attribute.longitude;
      let latitude = this.comData.attribute.latitude;
      let width = 21;
      let height = 28.5;

      map = new AMap.Map('mapWrapper', {
        center: [longitude, latitude],
        dragEnable: false, // 禁止滑动
        zoom: 13
      })

      let icon = new AMap.Icon({
        size: new AMap.Size(width, height),
        image: MAP_MARKER,
        imageSize: new AMap.Size(width, height)
      })

      let marker = new AMap.Marker({
        position: [longitude, latitude],
        icon,
        offset: new AMap.Pixel(-(width / 2), -height)
      })
      map.add(marker)
    },
    // 鼠标进入视频容器
    mouseEnter () {
      this.videoFlagShow = true;
    },
    // 鼠标离开视频容器
    mouseLeave () {
      if (this.videoPlay) {
        this.videoFlagShow = false;
      }
    },
    // 视频加载完成
    videoLoaded () {
      const duration = this.$refs.video.duration;
      this.videoTime = this.formatTime(duration);
      this.$refs.video.addEventListener('timeupdate', () => {
        this.videoTime = this.formatTime(duration - this.$refs.video.currentTime);
      });
      this.$refs.video.addEventListener('ended', () => {
        this.$refs.video.currentTime = 0;
        this.videoPlay = false;
      });
    },
    // 计算视频剩余时间
    formatTime (time) {
      const seconds = Math.floor(time % 60).toString().padStart(2, '0');
      const minutes = Math.floor(time / 60).toString().padStart(2, '0');
      return `${minutes}:${seconds}`;
    },
    // 播放/暂停视频
    play () {
      if (this.videoPlay) {
        this.$refs.video.pause();
      } else {
        this.$refs.video.play();
      }
      this.videoPlay = !this.videoPlay;
    },
    // 配置项的样式
    getClass (item) {
      if (!item.type) {
        return 'option-title';
      } else if (item.type === this.nowOption) {
        return 'option option-now';
      }
      return 'option';

    },
    // 改变配置项
    changeType (type) {
      this.nowOption = type;
    },
    // 点击配置项
    chooseOption (item) {
      if (!item.type) return;
      this.nowOption = item.type;
      if (this.nowOption === 'knowledge') {
        this.$nextTick(() => {
          document.getElementById('knowledge') && document.getElementById('knowledge').scrollIntoView();
        })
      } else if (this.nowOption === 'part') {
        this.$nextTick(() => {
          document.getElementById('part') && document.getElementById('part').scrollIntoView();
        })
      }
    },
    // 轮播只有一张图
    bgStyle (url) {
      return `background:url(${url}) no-repeat center center;background-size:100% 100%;`;
    },
  },
  components: {
    rightMenu
  }
};
</script>

<style lang="scss" scoped>
::-webkit-scrollbar {
  width: 0;
}

ul {
  padding-left: 0;
}
p {
  margin-bottom: 0;
}

.setting-wrapper {
  .left-menu {
    position: absolute;
    top: 15px;
    left: 15px;
    background: #fff;
    width: 220px;
    height: calc(100% - 30px);
    border-radius: 5px;
    overflow: auto;

    h3 {
      padding: 12px;
      border-bottom: 1px solid $color-border-l2;
    }

    .catalog {
      margin-left: 5px;
      width: 95%;
    }
    .no-catalog {
      color: $text-color-secondary;
      margin: 5px 0 0 5px;
    }

    .options {
      li {
        font-size: 14px;
        height: 20px;
        height: 35px;
        line-height: 35px;
      }

      .option-title {
        font-weight: bold;
        font-size: 15px;
        padding-left: 10px;
      }
      .option {
        padding-left: 15px;
        cursor: pointer;

        .icon_check {
          float: right;
          color: $color-main;
          margin: 8px 10px 0;
          font-size: 16px;
        }
      }
      .option-now {
        color: $color-main;
        background: #13c2c222;
      }
    }
  }

  .main {
    width: calc(100% - 550px);
    min-width: 375px;
    position: absolute;
    left: 235px;
    height: 100%;
    display: flex;
    justify-content: center;
    padding: 20px 0;

    .setting-bg {
      background: url("../../assets/img/iphoneX.png") no-repeat center 0;
      background-size: 100% 100%;
      position: relative;
      width: 375px;
      min-width: 375px;
      height: 669px;

      .setting-data-box {
        position: absolute;
        width: 339px;
        height: 572px;
        top: 45px;
        left: 18px;
        overflow-y: auto;
        background: $bg-color-l3;

        .choose-border {
          border: 1px solid $color-main;
          box-sizing: border-box;
        }

        // .part-wrapper{
        //   height: 100%;
        //   background: url('../../assets/img/beijian.png') no-repeat center center;
        //   background-size: 100% 100%;
        // }

        .mall-wrapper {
          height: 100%;
          background: url("../../assets/img/mall.png") no-repeat center center;
          background-size: 100% 100%;
        }

        .pro-wrapper {
          height: 100%;
          background: linear-gradient(
            to bottom,
            $color-main 0%,
            $bg-color-l3 20%
          );
          padding: 10px;

          .round-panel {
            background: #fff;
            border-radius: 15px;
            padding: 15px 10px 8px;
          }
          .top-panel {
            li {
              color: $text-color-secondary;
              margin-bottom: 5px;

              p {
                margin-bottom: 0;
                span {
                  float: right;
                  color: $text-color-primary;
                  margin-right: 5px;
                }
              }
            }
          }
          .middle-panel {
            padding: 0;
            overflow: hidden;
            position: relative;

            .video-title {
              position: absolute;
              top: 10px;
              left: 20px;
              font-size: 18px;
              color: #fff;
              width: 150px;
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
              word-break: break-all;
            }
            i {
              position: absolute;
              top: 50%;
              left: 50%;
              font-size: 40px;
              margin-left: -20px;
              margin-top: -28px;
              color: #00000044;
              cursor: pointer;
              z-index: 10;
            }
            .video-time {
              color: #fff;
              position: absolute;
              bottom: 10px;
              right: 10px;
            }
          }
          .no-video {
            color: $text-color-secondary;
            text-align: center;
            line-height: 160px;
          }
          .bottom-panel {
            padding: 0;
            overflow: hidden;
            margin: 1rem 0;
            .title {
              background: #f2f2f2;
              height: 50px;
              line-height: 50px;
              padding: 0 10px;
              span {
                font-weight: bold;
                font-size: 16px;
              }
              a {
                float: right;
                color: $color-main;
                &:hover {
                  text-decoration: none;
                }
              }
            }
            .part-item {
              display: inline-block;
              width: calc(50% - 5px);
              height: 200px;
              margin-top: 12px;
              background-color: #fff;
              box-shadow: 0 2px 10px 0 hsla(0, 0%, 60%, 0.2);
              border-radius: 10px;
              overflow: hidden;
              .part-img {
                height: 150px;
              }
              .part-no-img {
                background: url("../../assets/img/defProduct.png") no-repeat
                  center center;
                background-size: 50% 50%;
                background-color: $bg-color-l2;
              }
              .part-name {
                height: 55px;
                font-size: 15px;
                font-weight: bold;
                padding: 10px 8px 3px;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 2;
              }
            }
            .part-item:nth-child(odd) {
              margin-left: 10px;
            }
            .circle-item-wrapper {
              display: flex;
              overflow-x: auto;
              margin-top: 16px;
              margin-bottom: 40px;
              padding-bottom: 10px;

              .circle-item {
                width: 246px;
                height: 118px;
                margin-right: 10px;
                border-radius: 20px;
                flex-shrink: 0;
                padding: 20px 18px 0;
                box-shadow: 0px 2px 10px 0px rgba(153, 153, 153, 0.2);

                &:first-child {
                  background: url("../../assets/img/wiki_bg_red.png") no-repeat
                    center center;
                  background-size: cover;
                  margin-left: 10px;
                }
                &:last-child {
                  background: url("../../assets/img/wiki_bg_green.png")
                    no-repeat center center;
                  background-size: cover;
                }

                .circle-title {
                  display: inline-block;
                  height: 42px;
                  font-size: 15px;
                  font-weight: bold;
                  color: #051a13;
                  line-height: 21px;

                  text-overflow: -o-ellipsis-lastline;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  line-clamp: 2;
                  -webkit-box-orient: vertical;
                }

                .circle-info {
                  margin-top: 20px;
                  display: flex;
                  flex-direction: row;
                  justify-content: space-between;
                  align-items: center;

                  .circle-author {
                    font-size: 13px;
                    color: #999999;
                  }
                  .read-count {
                    .circle-read-text {
                      font-size: 12px;
                      color: #9ba3a1;
                    }
                    .circle-read-count {
                      display: inline-block;
                      text-align: center;
                      color: #333333;
                      font-size: 12px;
                    }
                  }
                }
              }
            }
            // .knowledge{
            //   margin-bottom: 0;
            //   li{
            //     padding: 10px;
            //     border-bottom: 1px solid $color-border-l4;

            //     .article-title{
            //       font-weight: bold;
            //       font-size: 16px;
            //       margin-bottom: 10px;

            //       overflow:hidden;
            //       text-overflow:ellipsis;
            //       display:-webkit-box;
            //       -webkit-box-orient:vertical;
            //       -webkit-line-clamp:2;
            //     }
            //     .author{
            //       color:$text-color-secondary;
            //     }
            //     .num{
            //       color:$text-color-secondary;
            //       float: right;
            //       border:1px solid $color-border-l4;
            //       padding: 1px 3px;
            //       font-size: 13px;
            //       .num-text{
            //         border-right: 1px solid $color-border-l4;
            //         padding-right: 4px;
            //       }
            //     }
            //   }
            //   li:last-child{
            //     border-bottom: none;
            //   }
            // }
          }
        }

        .com-wrapper {
          img {
            width: 100%;
            height: 180px;
          }

          ul {
            background: #fff;

            li {
              height: 60px;
              border-bottom: 1px solid $color-border-l3;
              padding-left: 10px;
              padding-top: 10px;

              span {
                color: $text-color-secondary;
              }

              p {
                font-size: 15px;

                i {
                  color: $color-main;
                  float: right;
                  margin-right: 15px;
                }
              }
            }
            li:last-child {
              border-bottom: none;
            }
          }
        }

        .service-wrapper {
          display: flex;
          justify-content: flex-start;
          flex-wrap: wrap;
          padding-top: 15px;

          li {
            width: 25%;
            height: 80px;
            text-align: center;
            padding-top: 10px;

            img {
              width: 60%;
              margin-bottom: 5px;
            }

            p {
              font-size: 13px;
              font-weight: bold;
            }
          }
        }

        .contact-wrapper {
          .contact-top {
            height: 245px;
            background: #fff;
            border-radius: 10px;
            padding: 8px;
            position: relative;
            top: 10px;
            margin-bottom: 25px;

            .contact-info {
              height: 160px;
              display: flex;

              img {
                width: 100px;
                height: 140px;
                margin-left: 10px;
              }
              .contact-info-right {
                padding: 10px 15px 0 20px;

                h3 {
                  margin-bottom: 20px;
                }
                p {
                  margin-bottom: 10px;

                  i {
                    font-size: 14px;
                    color: #aaa;
                  }
                }
              }
            }

            .contact-btns {
              display: flex;
              justify-content: space-around;
              margin-top: 15px;

              li {
                width: 45%;
                height: 45px;
                line-height: 43px;
                border: 1px solid $color-main;
                border-radius: 10px;
                text-align: center;

                i {
                  color: $color-main;
                }
              }
            }
          }
          .contact-bottom {
            height: 90px;
            border-radius: 10px;
            background: #fff;
            padding-top: 10px;

            h3 {
              margin-left: 15px;
            }

            .stars {
              display: flex;
              justify-content: space-around;

              i {
                font-size: 23px;
                color: #ffae00;
              }
            }
          }
        }

        .index-wrapper {
          background: #fff;
          height: 100%;

          .service-box {
            position: absolute !important;
            top: 0;
            width: 100%;
            height: 100%;
            background: #00000066 !important;

            ul {
              display: flex;
              justify-content: flex-start;
              flex-wrap: wrap;
              background: #fff;
              position: absolute;
              bottom: 0;
              padding-bottom: 10px;
              margin-bottom: 0;
              width: 100%;

              li {
                width: 25%;
                height: 80px;
                text-align: center;
                padding-top: 10px;

                img {
                  width: 45%;
                  margin-bottom: 5px;
                }

                p {
                  font-size: 13px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }
              }
            }
          }

          .two-panel {
            display: flex;
            justify-content: space-between;
            padding: 0 15px;
            margin-top: 20px;

            li {
              width: 48%;
              height: 100px;
              border-radius: 10px;
              text-align: center;
              cursor: pointer;
              color: #fff;

              img {
                display: block;
                margin: 15px auto;
                width: 35px;
              }
            }
            li:first-child {
              background: url("../../assets/img/contact.png") no-repeat center
                center;
              background-size: 100% 100%;
            }
            li:last-child {
              background: url("../../assets/img/service.png") no-repeat center
                center;
              background-size: 100% 100%;
            }
          }

          .box-card {
            margin: 0 15px;
            position: relative;
            cursor: pointer;
            padding: 10px;
            background: #f5f5f5;
            border-radius: 10px;

            img {
              position: absolute;
              top: 34px;
              right: 20px;
            }

            a {
              color: $color-main;
              &:hover {
                text-decoration: none;
              }
            }
          }

          h3 {
            padding: 15px 0 5px 15px;
          }

          .intro {
            line-height: 20px;
            padding: 0 10px;
            overflow: hidden;
            background: #fff;

            .intro-change {
              color: $color-main;
              float: right;
              cursor: pointer;
            }
          }
          .intro-cut > span {
            display: inline;
            text-overflow: -o-ellipsis-lastline;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          .setting-swipe {
            height: 140px;
          }
          .setting-swipe-noimg {
            background: url("../../assets/img/myShop/default.png") no-repeat
              center center;
            background-size: 80px 80px;
            background-color: $bg-color-l3;
          }
          .swipe-img {
            width: 100%;
            height: 140px;
          }
        }
      }
    }
  }

  .right-menu {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 300px;
    background: #fff;
    border-radius: 5px;
    height: calc(100% - 30px);
  }
}
</style>