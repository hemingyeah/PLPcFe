<template>
  <base-modal
    title="新建工单类型"
    width="977px"
    @cancel="cancel"
    :show.sync="isShow"
    :mask-closeable="false">
    <div class="choose-trade">
      <el-row type="flex" class="choose-trade-nav">
        <div
          class="choose-trade-nav-tab pointer"
          :class="industry === industryName && 'active'"
          v-for="industryName in industryNames"
          :key="industryName"
          @click="industry = industryName"
        >
          {{industryName}}
        </div>
      </el-row>
      <el-row class="trade-list" type="flex" justify="space-between">
        <el-row class="trade-item pointer apply" type="flex" v-for="item in industryItems" :key="item.taskTypeId" @click.native="selectTemplate(item)">
          <div class="trade-item-left" :style="{'background-color': getColor(item.taskTypeName)}">
            <i :class="['iconfont', getIcon(item.taskTypeName)]">
            </i>
          </div>
          <div class="trade-item-main">
            <el-row type="flex">
              <h2>
                {{item.taskTypeName}}
              </h2>
              <div v-for="label in item.labels" :key="label" class="trade-item-tag">
                {{label}}
              </div>
            </el-row>
            <p v-html="item.description"></p>
          </div>
        </el-row>
      </el-row>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="cancel">上一步</el-button>
    </div>
  </base-modal>
</template>

<script>
import * as SettingApi from '@src/api/SettingApi';

let industryNames = ['全部', '设备', 'IT服务', '家居建材', '电商', '机械', '上门服务', '公共服务', '其他'];
let iconMap = {
  '机械报修工单': {
    icon: 'icon-mechanics',
    color: '#3094d3'
  },
  '设备巡检保养': {
    icon: 'icon-maintain',
    color: '#1db6c5'
  },
  '设备交机培训': {
    icon: 'icon-train',
    color: '#3ba3da'
  },
  '办公设备工单': {
    icon: 'icon-work',
    color: '#1db6c5'
  },
  '医疗器械工单': {
    icon: 'icon-medicalcare',
    color: '#29b7ec'
  },
  '实施服务单': {
    icon: 'icon-implement',
    color: '#1db6c5'
  },
  '客户回访单': {
    icon: 'icon-tel',
    color: '#1db6c5'
  },
  '电商售后工单': {
    icon: 'icon-service1',
    color: '#f4c21d'
  },
  '家电维修': {
    icon: 'icon-appliance',
    color: '#3ba3da'
  },
  '电商退换货单': {
    icon: 'icon-refundable',
    color: '#f4c21d'
  },
  '内部报修': {
    icon: 'icon-inside',
    color: '#1db6c5'
  },
  '水电煤报修': {
    icon: 'icon-water',
    color: '#29b7ec'
  },
  '家居建材工单': {
    icon: 'icon-furniture',
    color: '#29b7ec'
  },
  '上门测量': {
    icon: 'icon-measure',
    color: '#52c0d1'
  },
  '设备维修': {
    icon: 'icon-equipment',
    color: '#41b8a3'
  }
}

export default {
  name: 'choose-trade-dialog',
  props: {
    visiable: {
      type: Boolean,
      default: false
    },
  },
  computed: {
    industryNames() {
      return industryNames;
    },
    industryItems(){
      let industry = this.industry;
      if(industry == '全部') industry = null;

      return this.whole.filter(function(item){
        return industry == null || item.professions.indexOf(industry) >= 0;
      })
    }
  },
  data() {
    return {
      industry: '全部',
      whole: [], // 全部数据
      isShow: false
    }
  },
  watch: {
    visiable(newVal){
      this.isShow = newVal;
    },
  },
  methods: {
    getIcon(key){
      let o = iconMap[key] || {};
      return o.icon
    },
    getColor(key){
      let o = iconMap[key] || {};
      return o.color
    },
    fetchSysTaskTypeList() {
      SettingApi.getSysTaskTypeList().then(res => {
        this.whole = res.data;
      }).catch(e => {
        console.error('fetchSysTaskTypeList => error', e);
      })
    },
    selectTemplate({taskTypeId, taskTypeName}) {
      this.$emit('select', {
        taskTypeId,
        typeName: taskTypeName
      });
      this.cancel();
    },
    cancel() {
      this.$emit('update:visiable', false);
    },
  },
  mounted() {
    this.fetchSysTaskTypeList();
  }
}
</script>

<style lang="scss" scoped>
.choose-trade{
    padding: 12px;
    .choose-trade-nav{
        .choose-trade-nav-tab{
            width: 97px;
            line-height: 50px;
            text-align: center;
            margin-right: 8px;
            font-size: 16px;
            box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.08);
            border-radius: 4px;
            &.active{
                color: #FFFFFF;
                background: linear-gradient(135deg, #1FDBB7 0%, #12C1D6 100%);
            }
        }
    }
    .trade-list{
        flex-wrap: wrap;
        .trade-item{
            position: relative;
            width: 463px;
            height: 160px;
            padding: 20px;
            margin:12px 12px 0 0;
            background: #FFFFFF;
            box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.1);
            border-radius: 4px;
            border: 2px solid transparent;
            .trade-item-left{
                display: flex;
                justify-content: center;
                align-items: center;
                i{
                    font-size: 24px;
                    color: #FFFFFF;
                }
            }
            &:hover{
                box-shadow: none;
                border: 2px solid #13C2C2;
                &::after{
                    content: "使用";
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    display: block;
                    width: 58px;
                    height: 24px;
                    line-height: 24px;
                    text-align: center;
                    color: #FFFFFF;
                    background: #13C2C2;
                    border-radius: 2px;
                }
            }
            &:nth-child(2n){
                margin-right: 0;
            }
            &-left{
                width: 32px;
                min-width: 32px;
                height: 32px;
                background: rgba(19, 194, 194, 0.5);
                border-radius: 2px;
                margin-right: 8px;
            }
            &-main{
                overflow: auto;
                width: 310px;
                h2{
                    font-size: 14px;
                }
                .trade-item-tag{
                    height: 22px;
                    line-height: 22px;
                    padding: 0 8px;
                    font-size: 12px;
                    background: rgba(250, 140, 22, 0.2);
                    border-radius: 11px;
                    font-weight: 500;
                    color: #FA8C16;
                    border: 1px solid rgba(250, 140, 22, 0.2);
                    text-align: center;
                    display: inline-block;
                    margin-left: 8px;
                }
                p{
                    margin:0;
                    color:#666666;
                    white-space:pre-line;
                    font-size:12px;
                }
            }
        }
    }
}

.pointer{
    cursor: pointer;
}
</style>