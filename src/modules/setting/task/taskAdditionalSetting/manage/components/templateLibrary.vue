<template>
  <div class="template-library-content">
    <!--start tabs选项 -->
    <ul class="tabs-card-type">
      <li :class="{'active': tabIndex == index}" v-for="(item,index) in cardSysList" :key="index" @click="onTabsCard(index)">{{item.name}}</li>
    </ul>
    <!--end tabs选项 -->

    <!--start 组件库列表 -->
    <div class="tabs-card-item" v-if="cardSysList.length>0">
      <el-card class="tabs-card-box" v-for="cardItem in cardSysList[tabIndex].list" :key="cardItem.cardId" >
        <div class="tabs-card-li">
          <div class="task-card-inforn"> 
            <h2 class="task-card-name">{{cardItem.cardName}}<span class="task-card-angle">{{cardItem.type}}</span></h2>                                       
            <p class="task-card-des">{{cardItem.description}}</p>
          </div>
          <div class="task-card-fields">
            <p>包含字段：</p>
            <p class="fields-list">{{cardItem.fields}}</p>
          </div>
          <div class="task-card-footer">
            <template v-if="cardItem.type!=='工时'">
              <el-button type="primary" class="preview" @click="previewCard">预览</el-button>
              <el-tooltip class="item" effect="dark" content="每个工单中填写一组该数据" placement="top">
                <el-button type="primary" @click="importcard(cardItem.cardId,'single')">添加为单次</el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="每个工单中填写多组该数据" placement="top">
                <el-button type="primary" @click="importcard(cardItem.cardId,'multiple')">添加为多次</el-button>
              </el-tooltip>  
            </template>   
            <template v-else>
              <el-tooltip class="item" effect="dark" content="每个工单中填写多组该数据" placement="top">
                <el-button type="primary" @click="importcard(cardItem.cardId,'multiple')">添加</el-button>
              </el-tooltip>
            </template>
          </div>
        </div>
      </el-card>
    </div>
    <!--end  组件库列表 -->

    <!--start 预览组件 -->
    <preview-card-dialog ref="previewDialog" ></preview-card-dialog>
    <!--end 预览组件 -->
  </div>
</template>
<script>
// api
import * as SettingTaskApi from '@src/api/SettingTaskApi';
// components
import PreviewCardDialog from './PreviewCardDialog';
export default {
  name: 'template-library',
  props: {
    cardSysList:{
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      tabIndex:0,
    };
  },
  methods: {
    onTabsCard(index){
      this.tabIndex = index;
    },
    // 添加为单次/多次
    importcard(cid, inputType) {
      SettingTaskApi.cardImport({cardId:cid, inputType}).then(res=>{
        const { status, message, data } = res;
        if(status == 0){
          this.$message.success('附加组件添加成功，可通过「编辑」功能更改系统默认配置');
          setTimeout(()=>{
            location.reload()
          }, 1000)
        }else{
          this.$message.warning(message);
        }
      }).catch(error=>({}))
    },

    // 预览组件
    previewCard() {
      this.$refs.previewDialog.openDialog();
    }
  },
  components: {
    [PreviewCardDialog.name]: PreviewCardDialog
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
        box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.04); 
        &:hover{
            box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.12);
        }
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
            .preview{
              background: #e7f9f9;
              border-color: #a1e7e7;
              color: #13C2C2;

            }
        }

    }
  }
  
}
</style>