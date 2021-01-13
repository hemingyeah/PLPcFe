<template>
  <div class="template-library-content">
    <!--start tabs选项 -->
    <ul class="tabs-card-type">
      <li :class="{'active': tabIndex == index}" v-for="(item,index) in cardSysList" :key="index" @click="onTabsCard(index)">{{item.name}}</li>
    </ul>
    <!--end tabs选项 -->

    <!--start 组件库列表 -->
    <div class="tabs-card-item" v-if="cardSysList.length>0">
      <el-card class="tabs-card-box" shadow="hover" v-for="cardItem in cardSysList[tabIndex].list" :key="cardItem.cardId" >
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
              <el-button type="primary" class="preview" @click="previewCard(cardItem)">预览</el-button>
              <el-tooltip class="item" effect="dark" content="每个工单中填写一组该数据" placement="top">
                <el-button type="primary" class="btn" @click="importcard(cardItem,'single')">添加为单次</el-button>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" content="每个工单中填写多组该数据" placement="top">
                <el-button type="primary" class="btn" @click="importcard(cardItem,'multiple')">添加为多次</el-button>
              </el-tooltip>
            </template>
            <template v-else>
              <el-button type="primary" class="preview" @click="previewCard(cardItem)">预览</el-button>
              <el-tooltip class="item" effect="dark" content="每个工单中填写多组该数据" placement="top">
                <el-button type="primary" class="btn" @click="importcard(cardItem,'multiple')">添加</el-button>
              </el-tooltip>
            </template>
          </div>

        </div>
      </el-card>
    </div>
    <!--end  组件库列表 -->

    <!--start 预览组件 -->
    <preview-card-dialog ref="previewDialog" :fields="fields"></preview-card-dialog>
    <!--end 预览组件 -->
  </div>
</template>
<script>
import * as SettingTaskApi from '@src/api/SettingTaskApi';
// components
import PreviewCardDialog from '../../../../components/PreviewCardDialog';
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
      fields:[],
      tabIndex:0,
    };
  },
  methods: {
    onTabsCard(index){
      this.tabIndex = index;
    },
    // 添加为单次/多次
    importcard(cardItem, inputType) {
      SettingTaskApi.cardImport({cardId:cardItem.cardId, inputType}).then(res=>{
        const { status, message, data } = res;
        if(status == 0){
          this.$message.success('添加成功');
          let cardSelected = {};
          cardSelected.inputType = inputType;
          cardSelected.name = cardItem.cardName;
          cardSelected.specialfrom = cardItem.type == '工时' ? '工时记录' : '';
          cardSelected.id = data;
          this.$emit('saveImport', cardSelected)


          
        }else{
          this.$message.warning(message);
        }
      }).catch(error=>({}))
    },
    // 预览组件
    previewCard(card) {
      this.fields = card.fieldsModule;
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
      width: 97px;
      height: 50px;
      background: #FFFFFF;
      box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.08);
      border-radius: 4px;
      border: 1px solid #F2F2F2;
      line-height: 50px;
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
    justify-content: flex-start;

    .tabs-card-box{
        width: 463px;
        margin-bottom: 12px;
        margin-right: 12px;
        box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.04); 
        &:hover{
            box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.12);
        }
        &:nth-child(2n) {
            margin-right: 0;
        }
        .task-card-inforn{
            .task-card-name{  
                margin-bottom: 0;
                @include text-ellipsis;
                padding-right: 32px;
                font-size: 16px;
                color: #333333;
                line-height: 22px;
                .task-card-angle{
                    padding: 0 9px;
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
                // height: 34px;
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
            .btn{
              width: 92px;
            }
            .el-button--small{
              padding: 6px 15px;
            }
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