<!--  -->
<template>
  <div class="task-allot-modal">
    <div class="base-modal">
      <div class="base-modal-header">
        <h3>
          派单
        </h3>
      </div>

      <div class='base-modal-content'>
        <div class="flex-y"
             style="height:100%">

          <div class="type-box">
            <div class="flex-x mar-b-12">
              <div class="flex-x type-doing">
                <div class="type-doing-item"
                     :class="[typeDoing == 0 ? 'type-doing-item-check' : 'type-doing-item-normal']"
                     @click="typeDoing = 0">指派给工单负责人</div>
                <div class="type-doing-item"
                     :class="[typeDoing == 1 ? 'type-doing-item-check' : 'type-doing-item-normal']"
                     @click="typeDoing = 1">指派到工单池</div>
                <div class="type-doing-item"
                     :class="[typeDoing == 2 ? 'type-doing-item-check' : 'type-doing-item-normal']"
                     @click="typeDoing = 2">自动分配</div>
              </div>
              <div class="flex-x type-show"
                   v-if="typeDoing == 0">
                <div class="type-show-item"
                     :class="[typeShow == 0 ? 'type-show-item-check' : 'type-show-item-normal']"
                     @click="typeShow = 0">列表</div>
                <div class="type-show-item"
                     :class="[typeShow == 1 ? 'type-show-item-check' : 'type-show-item-normal']"
                     @click="typeShow = 1">地图</div>
              </div>

              <div class="flex-1 flex-x select-item mar-l-24"
                   v-if="typeDoing != 0"><span>协同人:</span>
                <el-select v-model="value3"
                           multiple
                           collapse-tags
                           placeholder="请选择">
                  <el-option v-for="item in optionsSyman"
                             :key="item.value"
                             :label="item.label"
                             :value="item.value">
                  </el-option>
                </el-select>
              </div>
            </div>

            <!--  -->
            <div class="flex-x select-box"
                 v-if="typeDoing == 0">
              <div class="flex-1 flex-x mar-r-24 select-item"> <span>服务部门:</span>
                <el-select class="flex-1"
                           v-model="value1"
                           multiple
                           collapse-tags
                           placeholder="请选择">
                  <el-option v-for="item in optionsTeam"
                             :key="item.value"
                             :label="item.label"
                             :value="item.value">
                  </el-option>
                </el-select>
              </div>
              <div class="flex-1 flex-x mar-r-24 select-item"><span>负责人:</span>
                <el-select class="flex-1"
                           v-model="value2"
                           clearable
                           placeholder="请选择">
                  <el-option v-for="item in optionsReman"
                             :key="item.value"
                             :label="item.label"
                             :value="item.value">
                  </el-option>
                </el-select>
              </div>
              <div class="flex-1 flex-x select-item"><span>协同人:</span>
                <el-select class="flex-1"
                           v-model="value3"
                           multiple
                           collapse-tags
                           placeholder="请选择">
                  <el-option v-for="item in optionsSyman"
                             :key="item.value"
                             :label="item.label"
                             :value="item.value">
                  </el-option>
                </el-select>
              </div>
            </div>
          </div>
          <!--  -->
          <div class="flex-1">
            <img class="change-background"
                 :src="typeDoing == 0? changeBackground[typeDoing][typeShow]:changeBackground[typeDoing]"
                 alt="">
          </div>

        </div>

      </div>

      <div slot='footer'
           class='dialog-footer flex-x jus-end'>
        <el-button type='primary'
                   @click="justGuide('task', 3)">提 交</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import img_1 from '@src/assets/img/userGuide/guide-allot-1.png';
import img_2 from '@src/assets/img/userGuide/guide-allot-2.png';
import img_3 from '@src/assets/img/userGuide/guide-allot-3.png';
import img_4 from '@src/assets/img/userGuide/guide-allot-4.png';
export default {
  name: 'task-allot-modal',
  props: {
    justGuide: {
      type: Function
    }
  },
  data () {
    return {
      optionsTeam: [{
        value: '1',
        label: '华东大区'
      }, {
        value: '2',
        label: '江浙沪大区'
      }],
      optionsReman: [{
        value: '1',
        label: '测试负责人1'
      }, {
        value: '2',
        label: '测试负责人2'
      }],
      optionsSyman: [{
        value: '1',
        label: '测试协同人1'
      }, {
        value: '2',
        label: '测试协同人2'
      } ],
      value1: [],
      value2: '',
      value3: [],
      typeDoing: 0,
      typeShow: 0,
      changeBackground: {
        0: {
          0: img_1,
          1: img_2,
        },
        1: img_3,
        2: img_4
      }
    }
  },
  created () {

  },
  mounted () {

  }
}
</script>
<style lang='scss' scoped>
.type-box {
  padding: 16px;
  position: sticky;
  top: 0;
  .type-doing {
    border: 1px solid $color-border-l2;
    .type-doing-item {
      padding: 9px 15px;
      cursor: pointer;
      &:not(:last-child) {
        border-right: 1px solid $color-border-l2;
      }
    }
    .type-doing-item-normal {
      &:hover {
        color: $color-primary;
      }
    }
    .type-doing-item-check {
      border-right: none;
      background: $color-primary;
      color: #fff;
    }
  }

  .type-show {
    border: 1px solid $color-border-l2;
    margin-left: 24px;
    .type-show-item {
      padding: 9px 15px;
      cursor: pointer;
      &:not(:last-child) {
        border-right: 1px solid $color-border-l2;
      }
    }
    .type-show-item-normal {
      &:hover {
        color: $color-warning;
      }
    }
    .type-show-item-check {
      border-right: none;
      background: $color-warning;
      color: #fff;
    }
  }

  .select-item {
    span {
      width: 70px;
    }
  }
}
.change-background {
  width: 100%;
}
</style>