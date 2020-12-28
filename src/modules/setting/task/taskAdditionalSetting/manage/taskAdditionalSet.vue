<template>
  <div class="task-additional-container">
    <!-- start 导航 -->
    <task-nav-bar current="cardManage" />
    <!-- end 导航 -->

    <!-- start 附加组件设置 -->
    <div class="task-additional-right" v-loading="loading" >
      <div class="task-tab-header">
        <div class="task-tabs">
          <el-tabs v-model="activeTab" @tab-click="switchTab">
            <el-tab-pane name="task-added" label="已添加的组件">
                <p class="tabs_msg">附加组件是在服务工单中用于管理工单信息的辅助工具，可以让您分类记录工单的信息，附加组件可以从模块库中导入或创建。如需将关联组件应用在服务工单上，请在不同的工单类型中添加附加组件</p>
            </el-tab-pane>
            <el-tab-pane name="task-import" label="从模版库添加">
              <p class="tabs_msg">附加组件库里，提供了丰富的模板，点击<span>预览</span>可查看使用案例。</p>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div class="lh-52" v-if="activeTab=='task-added'">
          <el-button type="primary" icon="el-icon-plus"  :loading="false" @click="addTaskCard">新建</el-button>
        </div>
      </div>
      
      <!-- start 已添加附加组件 -->
      <div class="task-type-list" v-show="activeTab=='task-added'" >
        <task-card-item
          class="task-type-item"
          v-for="(item, idx) in cardList"
          :key="item.id"
          :card.sync="cardList[idx]"
          @update="updateCardname"
        ></task-card-item>
      </div>
      <!-- end 已添加附加组件 -->

      <!-- start 从模版库添加 -->
      <div class="task-type-list" v-show="activeTab=='task-import'">
        <template-library :cardSysList="cardSysList"></template-library>
      </div>
      <!-- end 从模版库添加 -->
      
      <!-- start 无数据 -->
      <no-data-view-new   
        v-if="isShowNoData"
        notice-msg="暂无附加组件"
      ></no-data-view-new>
      <!-- end 无数据 -->
    </div>
    <!-- end 附加组件设置 -->

    <!-- 创建附加组件 -->
    <edit-cardname-dialog ref="batchCardnameDialog"></edit-cardname-dialog>
  </div>
</template>

<script>
// api
import * as SettingTaskApi from "@src/api/SettingTaskApi";
//util
import { isShowCardWorkTime } from '@src/util/version.ts'
// components
import TaskNavBar from "../../components/TaskNavBar";
import TaskCardItem from "./components/TaskCardItem";
import EditCardnameDialog from "./components/EditCardnameDialog";
import templateLibrary from "./components/templateLibrary";
import NoDataViewNew from '@src/component/common/NoDataViewNew';
import { forEach } from 'lodash';

export default {
  name: "task-manage",
  data() {
    return {
      loading: true,
      activeTab: "task-added",
      cardList: [],
      cardSysList:[]

    };
  },
  computed: {
    isShowCardWorkTime() {
      return isShowCardWorkTime()
    },
    isShowNoData() {
      return (this.activeTab == 'task-added' && this.cardList.length == 0) || (this.activeTab == 'task-import' && this.cardSysList.length == 0);
    }
  },
  mounted() {
    this.initCard();
    this.initCardSysList();
  },
  methods: {
    switchTab(tab){
      if(this.activeTab == tab) return;
      if(this.activeTab == 'task-added'){
        this.initCard();
      }
      if(this.activeTab == 'task-import'){
        this.initCardSysList()
      }
    },
    //更新列表数据
    updateCardname() {
      this.initCard();
    },
    //新建组件
    addTaskCard(){
      this.$refs.batchCardnameDialog.openDialog();
    },
    //获取附加组件列表
    initCard() {
      SettingTaskApi.getAllCardList().then(res=>{
        const { code, message, result } = res;
        this.loading = false;
        if(code == 0){
          this.cardList = result ;  
        }else{
          this.$message.error(message);
        }
      }).catch(error=>{
        this.loading = false;
        console.log(error)
      })
    },

    /** 
    * @description 获取组件库列表
    * 1.工时记录灰度控制 isShowCardWorkTime true显示 false隐藏
    */
    initCardSysList() {
      SettingTaskApi.getCardSysList().then(res=>{
        const { status, message, data } = res;
        if(status == 0){
            var cardList = data || [];
          
            if(!this.isShowCardWorkTime) {
                cardList = cardList.filter(function(card) {
                    return card.cardName !== '工时记录';
                })
            }
            let cardSysList = [];
            var cardAll = cardList.slice();
            let wuliu = []
            let zhiliang = []
            let chanpin = []
            let shichang = []
            let kesu = []
            let feiyong = []
            let gongshi = []
            if(cardAll&&cardAll.length>0){
              cardAll.forEach((item=>{
                if(item.cardName=='发货记录'||item.cardName=='退货登记'){
                      item['type']='物流'
                      wuliu.push(item)
                  }else if(item.cardName=='产品故障记录'|| item.cardName=='质检登记'){
                      item['type']='质量'
                      zhiliang.push(item)
                  }else if(item.cardName=='设备信息记录'|| item.cardName=='配置信息'){
                      item['type']='产品'
                      chanpin.push(item)
                  }else if(item.cardName=='礼品邮寄'||item.cardName=='市场活动'||item.cardName=='访问调查'){
                      item['type']='市场'
                      shichang.push(item)
                  }else if(item.cardName=='质量投诉'){
                      item['type']='客诉'
                      kesu.push(item)
                  }else if(item.cardName=='费用备注'){
                      item['type']='费用'
                      feiyong.push(item)
                  }else if(item.cardName=='工时记录'){
                      item['type']='工时'
                      gongshi.push(item)
                  }
              }))
            }
            cardSysList.push({name:'全部',list:cardAll},{name:'物流',list:wuliu},{name:'质量',list:zhiliang},{name:'产品',list:chanpin},{name:'市场',list:shichang},{name:'客诉',list:kesu},{name:'费用',list:feiyong},{name:'工时',list:gongshi})
            if(!this.isShowCardWorkTime){
              this.cardSysList = cardSysList.filter(item=>item.name !== '工时') 
            }else{
              this.cardSysList = cardSysList;
            }        
        }else{
          this.$message.error(message);
        }
      }).catch(error=>{
        console.log(error)
      })
    }
  },
  components: {
    [TaskNavBar.name]: TaskNavBar,
    [TaskCardItem.name]: TaskCardItem,
    [EditCardnameDialog.name]: EditCardnameDialog,
    [NoDataViewNew.name]: NoDataViewNew,
    [templateLibrary.name]: templateLibrary   
  },
};
</script>
<style lang="scss">
.task-tabs {
  // tabs标签页
  .el-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;

    &__header {
      margin: 0;

      .el-tabs__item {
        padding: 0 24px !important;
        color: $text-color-regular;
        font-weight: normal;

        &.is-active {
          color: $color-primary;
        }
      }
    }
    &__nav-wrap {
      &:after {
        height: 0;
      }
    }

    &__content {
      flex: 1;
      overflow: auto;
    }
  }
}
</style>
<style lang="scss" scoped>
@import "./taskAdditionalSet.scss";
</style>