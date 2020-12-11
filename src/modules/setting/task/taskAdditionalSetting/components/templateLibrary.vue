<template>
  <div class="template-library-content">
    <ul class="tabs-card-type">
      <li :class="{'active': tabIndex == index}" v-for="(item,index) in cardTabs" :key="index" @click="onTabsCard(index)">{{item}}</li>
    </ul>
    <div class="tabs-card-item">
        <el-card class="tabs-card-box" shadow="hover" v-for="o in 2" :key="o" >
            <div  class="tabs-card-li">
                <div class="task-card-inforn"> 
                    <h2 class="task-card-name">发货记录<span class="task-card-angle">物流</span></h2>                                       
                    <p class="task-card-des">发货记录的说明文案发货记录的说明文案发货记录的说明最多2行</p>
                </div>
                <div class="task-card-fields">
                    <p>包含字段：</p>
                    <p class="fields-list">收货人，联系方式，发货地址，物流公司，物流编号</p>
                </div>
                <div class="task-card-footer">
                    <el-button type="primary" plain >预览</el-button>
                    <el-button type="primary" @click="importcard('single')">添加为单次</el-button>
                    <el-button type="primary" @click="importcard('multiple')">添加为多次</el-button>
                </div>

            </div>
        </el-card>
    </div>

  </div>
</template>
<script>
import * as SettingTaskApi from "@src/api/SettingTaskApi";
export default {
  name: 'template-library',
  data() {
    return {
        cardTabs:['全部','物流','质量','产品','客诉','费用','市场','工时'],
        tabIndex:0,
    };
  },
  methods: {
    onTabsCard(index){
        this.tabIndex = index;
    },
    //添加为单次/多次
    importcard(cid,inputType) {
        var ele = event.currentTarget;
        SettingTaskApi.cardImport({cardId:cid,inputType:inputType}).then(res=>{
        const { status, message, data } = res;
        if(status==0){
            this.$message.success('附加组件添加成功，可通过「编辑」功能更改系统默认配置');
            location.reload()
        }else{
            this.$message.error(message);
            location.reload()
        }
      }).catch(error=>{

      })
    }
  },
};
</script>
<style lang="scss" scoped>
.template-library-content {
  .tabs-card-type {
    display: flex;
    justify-content: flex-start;
    padding-inline-start: 0;
    li {
      width: 108px;
      height: 50px;
      line-height: 50px;
      background: #ffffff;
      box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.08);
      border-radius: 4px;
      list-style: none;
      font-size: 16px;
      text-align: center;
      margin-right: 12px;
      cursor: pointer;
    }
    .active{
        background: linear-gradient(135deg, #1FDBB7 0%, #12C1D6 100%);
        box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.08);
        color: #fff;
    }
  }
  .tabs-card-item{
    display: flex;
    flex-flow: wrap;
    .tabs-card-box{
        width: 530px;
        margin-right: 12px;
        margin-bottom: 12px;
        .task-card-inforn{
            width: 257px;
            .task-card-name{  
                margin-bottom: 0;
                @include text-ellipsis;
                padding-right: 32px;
                font-size: 16px;
                color: #333333;
                line-height: 22px;
                .task-card-angle{
                    width: 44px;
                    height: 22px;
                    line-height: 22px;
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
            }
            .task-card-des{
                font-size: 12px; 
                color: #666666;
                line-height: 17px;
                margin-top: 8px;
                height: 34px;
                @include text-ellipsis-2; 
                cursor: pointer;
                margin-block-end: 0em;

            }
        }
        .task-card-fields{
            margin: 8px 0 12px 0;
            p{
                margin-bottom: 0;
                font-size: 12px;
            }
            :first-child{
                color: #666666;
                margin-bottom: 4px;
            }
            .fields-list{
                color: #333333;
            }

        }
        .task-card-footer{
            display: flex;
            justify-content: flex-end;
        }

    }
  }
  
}
</style>