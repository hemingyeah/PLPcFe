<!--  -->
<template>
  <div class="page-guide-box" :class="pageSize">
    <div class="page-guide-background">
      <img
        :src="[nowStepCom[pageState.nowStepType][pageState.nowStep].background]"
        alt=""
      />

      <!--  -->
      <div v-show="pageState.nowStepType == 'menu' && pageState.nowStep == 0">
        <div class="guide-menu-pos-1" @click="changeSetp('task', 0)"></div>
        <div
          class="guide-menu-pos-2"
          @click="changeSetp('superQrCode', 0)"
        ></div>
      </div>
      <!--  -->

      <div
        class="guide-task-pos-back"
        v-show="pageState.nowStepType != 'menu'"
        @click="backSetp"
      ></div>

      <div
        class="guide-big-size flex-x"
        v-show="pageSize == 'page-1440-768'"
        @click="changePageSize('page-1760-938')"
      >
        放大
      </div>

      <div
        class="guide-big-size flex-x"
        v-show="pageSize == 'page-1760-938'"
        @click="changePageSize('page-1440-768')"
      >
        缩小
      </div>

      <!--  -->
      <div v-show="pageState.nowStepType == 'task' && pageState.nowStep == 0">
        <div class="guide-task-0-pos-1" @click="changeSetp('task', 1)"></div>
        <div class="guide-task-0-pos-2" @click="changeSetp('task', 1)"></div>
      </div>
      <!--  -->

      <!--  -->
      <div v-show="pageState.nowStepType == 'task' && pageState.nowStep == 1">
        <!-- <div class="guide-task-1-pos-1"
             @click="changeSetp('task', 2)"></div> -->
        <div class="guide-task-1-pos-2" @click="changeSetp('task', 2)"></div>
        <div class="guide-task-pos-editTask bg-w">
          <!-- start 工单流程步骤 -->
          <task-process-steps :just-guide="true"></task-process-steps>
          <!-- end 工单流程步骤 -->
          <task-edit-form
            :task="taskTask"
            :fields.sync="taskFields"
            :state="taskState"
            :types="taskTypes"
            :url-params="taskUrlParams"
            :value.sync="taskValue"
            :just-guide="true"
            ref="form"
          ></task-edit-form>
        </div>
      </div>
      <!--  -->

      <!--  -->
      <div v-show="pageState.nowStepType == 'task' && pageState.nowStep == 2">
        <div class="guide-task-pos-allotTask">
          <task-allot-modal :just-guide="changeSetp"></task-allot-modal>
        </div>
      </div>
      <!--  -->

      <!--  -->
      <div v-show="pageState.nowStepType == 'task' && pageState.nowStep == 3">
        <div class="guide-task-3-pos-1" @click="changeSetp('task', 4)"></div>
      </div>
      <!--  -->

      <!--  -->
      <div v-show="pageState.nowStepType == 'task' && pageState.nowStep == 4">
        <div class="guide-task-4-pos-1" @click="changeSetp('task', 5)"></div>
      </div>
      <!--  -->

      <!--  -->
      <div v-show="pageState.nowStepType == 'task' && pageState.nowStep == 5">
        <div class="guide-task-5-pos-1" @click="changeSetp('task', 6)"></div>
      </div>
      <!--  -->

      <!--  -->
      <div v-show="pageState.nowStepType == 'task' && pageState.nowStep == 6">
        <div class="guide-task-6-pos-1" @click="changeSetp('task', 7)"></div>
      </div>
      <!--  -->

      <!--  -->
      <div v-show="pageState.nowStepType == 'task' && pageState.nowStep == 7">
        <div class="guide-task-pos-accountTask">
          <div class="base-modal-header">
            <h3>
              审核结算
            </h3>
          </div>
          <div class="base-modal-content">
            <form-builder
              ref="form"
              :fields="taskAccountFields"
              :value="taskAccountValue"
              @update="taskAccountUpdate"
            ></form-builder>
          </div>
          <div slot="footer" class="dialog-footer flex-x jus-end">
            <el-button type="primary" @click="changeSetp('task', 8)"
            >结 算</el-button
            >
          </div>
        </div>
      </div>
      <!--  -->

      <!--  -->
      <div v-show="pageState.nowStepType == 'task' && pageState.nowStep == 8">
        <div class="guide-task-8-pos-1" @click="changeSetp('task', 9)"></div>
      </div>
      <!--  -->

      <!--  -->
      <div v-show="pageState.nowStepType == 'task' && pageState.nowStep == 9">
        <div class="guide-task-pos-feedTask">
          <task-feedback-dialog
            ref="feedbackDialog"
            :task="taskfeedBackTask"
            :evaluate-config="taskfeedBackConfig"
            :just-guide="changeSetp"
          />
        </div>
        <div class="guide-task-9-pos-1 flex-x" @click="changeSetp('menu', 0)">
          <div><i class="iconfont icon-home mar-r-8"></i>返回首页</div>
          {{ lastScends }}
        </div>
      </div>
      <!--  -->

      <!--  -->
      <div
        v-show="
          pageState.nowStepType == 'superQrCode' && pageState.nowStep == 0
        "
      >
        <div
          class="guide-qrcode-0-pos-1"
          @click="changeSetp('superQrCode', 1)"
        ></div>
      </div>
      <!--  -->

      <!--  -->
      <div
        v-show="
          pageState.nowStepType == 'superQrCode' && pageState.nowStep == 1
        "
      >
        <div
          class="guide-qrcode-1-pos-1"
          @click="changeSetp('superQrCode', 2)"
        ></div>
      </div>
      <!--  -->

      <!--  -->
      <div
        v-show="
          pageState.nowStepType == 'superQrCode' && pageState.nowStep == 2
        "
      >
        <div
          class="guide-qrcode-2-pos-1"
          @click="changeSetp('superQrCode', 3)"
        ></div>
      </div>
      <!--  -->

      <!--  -->
      <div
        v-show="
          pageState.nowStepType == 'superQrCode' && pageState.nowStep == 3
        "
      >
        <div
          class="guide-qrcode-3-pos-1"
          @click="changeSetp('superQrCode', 4)"
        ></div>
      </div>
      <!--  -->

      <!--  -->
      <div
        v-show="
          pageState.nowStepType == 'superQrCode' && pageState.nowStep == 4
        "
      >
        <div
          class="guide-qrcode-4-pos-1"
          @click="changeSetp('superQrCode', 5)"
        ></div>
        <div class="guide-qrcode-pos-editProduct bg-w">
          <product-edit-form
            :fields="productFields"
            v-model="productValue"
            :just-guide="true"
          >
          </product-edit-form>
        </div>
      </div>
      <!--  -->

      <!--  -->
      <div
        v-show="
          pageState.nowStepType == 'superQrCode' && pageState.nowStep == 5
        "
      >
        <div
          class="guide-qrcode-5-pos-1"
          @click="changeSetp('superQrCode', 6)"
        ></div>
      </div>
      <!--  -->

      <!--  -->
      <div
        v-show="
          pageState.nowStepType == 'superQrCode' && pageState.nowStep == 6
        "
      >
        <div
          class="guide-qrcode-6-pos-1"
          @click="changeSetp('superQrCode', 7)"
        ></div>
      </div>
      <!--  -->

      <!--  -->
      <div
        v-show="
          pageState.nowStepType == 'superQrCode' && pageState.nowStep == 7
        "
      >
        <div class="guide-task-7-pos-1 flex-x" @click="changeSetp('menu', 0)">
          <div><i class="iconfont icon-home mar-r-8"></i>返回首页</div>
          {{ lastScends }}
        </div>
      </div>
      <!--  -->

      <!--  弹窗管理 -->
      <!-- <base-modal title="导出列选择" :show.sync="visible" width="680px" class="base-export-modal"></base-modal> -->
    </div>
  </div>
</template>

<script>
import TaskEditForm from '@src/modules/task/edit/components/TaskEditForm/TaskEditForm.vue';
import TaskAllotModal from '@src/modules/guideForNewUser/compoment/CopyTaskAllotModal.vue';
import FeedbackDialog from '@src/modules/task/view/components/TaskFeedback/FeedbackDialogNot.vue';
import TaskProcessSteps from '@src/modules/task/components/TaskProcessSteps/TaskProcessSteps.tsx';
import ProductEditForm from '@src/modules/product/components/ProductEditFormV2.vue';

import { useDetail } from '@src/api/GuideForNewUser.ts';
import _ from 'lodash';

import {
  taskValue,
  taskUrlParams,
  taskTypes,
  taskFields,
  taskState,
  taskTask,
  // 转派数据
  taskAllotFields,
  taskAllotTask,
  taskAllotLoginUser,
  // 结算数据
  taskAccountFields,
  // 工单回访
  taskfeedBackTask,
  taskfeedBackConfig,
  // 产品表单
  productFields,
  productValue,
} from './initData';

import guide_1 from '@src/assets/img/userGuide/guide-1.png';
import guide_task_1 from '@src/assets/img/userGuide/guide-2.png';
import guide_task_2 from '@src/assets/img/userGuide/guide-3.png';
import guide_task_3 from '@src/assets/img/userGuide/guide-4.png';
import guide_task_4 from '@src/assets/img/userGuide/guide-5.png';
import guide_task_5 from '@src/assets/img/userGuide/guide-6.png';
import guide_task_6 from '@src/assets/img/userGuide/guide-7.png';
import guide_task_7 from '@src/assets/img/userGuide/guide-8.png';
import guide_task_8 from '@src/assets/img/userGuide/guide-9.png';
import guide_task_9 from '@src/assets/img/userGuide/guide-10.png';
import guide_task_10 from '@src/assets/img/userGuide/guide-11.png';

import guide_qrcode_1 from '@src/assets/img/userGuide/guide-qrcode-1.png';
import guide_qrcode_2 from '@src/assets/img/userGuide/guide-qrcode-2.png';
import guide_qrcode_3 from '@src/assets/img/userGuide/guide-qrcode-3.png';
import guide_qrcode_4 from '@src/assets/img/userGuide/guide-qrcode-4.png';
import guide_qrcode_5 from '@src/assets/img/userGuide/guide-qrcode-5.png';
import guide_qrcode_6 from '@src/assets/img/userGuide/guide-qrcode-6.png';
import guide_qrcode_7 from '@src/assets/img/userGuide/guide-qrcode-7.png';
import guide_qrcode_8 from '@src/assets/img/userGuide/guide-qrcode-8.png';

export default {
  components: {
    [TaskEditForm.name]: TaskEditForm,
    TaskAllotModal,
    [FeedbackDialog.name]: FeedbackDialog,
    TaskProcessSteps,
    [ProductEditForm.name]: ProductEditForm,
  },
  data() {
    return {
      pageState: {
        nowStep: 0,
        nowStepType: 'menu',
      },
      nowStepCom: {
        menu: {
          0: {
            background: guide_1,
            enum: '1-1',
          },
        },
        task: {
          0: {
            background: guide_task_1,
            enum: '1-2',
          },
          1: {
            background: guide_task_2,
          },
          2: {
            background: guide_task_3,
            enum: '1-3',
          },
          3: {
            background: guide_task_4,
            enum: '1-4',
          },
          4: {
            background: guide_task_5,
          },
          5: {
            background: guide_task_6,
          },
          6: {
            background: guide_task_7,
            enum: '1-5',
          },
          7: {
            background: guide_task_8,
          },
          8: {
            background: guide_task_9,
            enum: '1-6',
          },
          9: {
            background: guide_task_10,
          },
        },
        superQrCode: {
          0: {
            background: guide_qrcode_1,
            enum: '2-1',
          },
          1: {
            background: guide_qrcode_2,
            enum: '2-2',
          },
          2: {
            background: guide_qrcode_3,
          },
          3: {
            background: guide_qrcode_4,
          },
          4: {
            background: guide_qrcode_5,
            enum: '2-3',
          },
          5: {
            background: guide_qrcode_6,
            enum: '2-4',
          },
          6: {
            background: guide_qrcode_7,
            enum: '2-5',
          },
          7: {
            background: guide_qrcode_8,
            enum: '2-6',
          },
        },
      },
      // 工单相关
      taskValue,
      taskUrlParams,
      taskTypes,
      taskFields,
      taskState,
      taskTask,
      taskAllotFields,
      taskAllotTask,
      taskAllotLoginUser,
      taskAccountFields,
      taskAccountValue: {},
      taskfeedBackTask,
      taskfeedBackConfig,
      productFields,
      productValue,

      lastScends: 9,
      interval_1: null,
      pageSize: 'page-1440-768',
    };
  },
  created() {},
  mounted() {
    this.server();
  },
  watch: {
    pageState: {
      deep: true,
      handler(newVal, oldVal) {
        if (
          (newVal.nowStepType == 'task' && newVal.nowStep == 9)
          || (newVal.nowStepType == 'superQrCode' && newVal.nowStep == 7)
        ) {
          this.begainLastScends();
        } else {
          this.stopLastScends();
        }
      },
    },
  },
  methods: {
    changeSetp(type, step) {
      this.pageState.nowStepType = type;
      this.pageState.nowStep = step;
      this.server();
    },
    backSetp() {
      this.pageState.nowStep == 0
        ? (this.pageState.nowStepType = 'menu')
        : this.pageState.nowStep--;
    },
    begainLastScends() {
      this.interval_1 = setInterval(() => {
        if (this.lastScends < 1)
          return this.changeSetp('menu', 0), this.stopLastScends();
        this.lastScends--;
      }, 1000);
    },
    stopLastScends() {
      clearInterval(this.interval_1);
      this.lastScends = 9;
    },
    server: _.debounce(function() {
      if (
        !this.nowStepCom[this.pageState.nowStepType][
          this.pageState.nowStep
        ].hasOwnProperty('enum')
      )
        return;
      useDetail({
        phone: this.$getUrlObj(window)?.phone,
        tryDetail: [
          this.nowStepCom[this.pageState.nowStepType][this.pageState.nowStep]
            .enum,
        ],
      });
    }, 800),
    /**
     * @description 更新表单数据
     */
    taskAccountUpdate({ field, newValue, oldValue }) {
      let { fieldName, displayName } = field;
      if (this.$appConfig.debug) {
        console.info(
          `[FormBuilder] => ${displayName}(${fieldName}) : ${JSON.stringify(
            newValue
          )}`
        );
      }
      this.$set(this.taskAccountValue, fieldName, newValue);
    },
    changePageSize(e) {
      this.pageSize = e;
    },
  },
  destroyed() {
    this.stopLastScends();
  },
};
</script>
<style lang="scss">
.form-builder {
  padding: 10px;
}

.guide-task-pos-allotTask {
  .base-modal {
    display: flex;
    flex-direction: column;
    .base-modal-content {
      flex: 1;
      overflow-y: scroll;
    }
  }
  .dialog-footer {
    border-top: 1px solid #ebeef5;
    padding: 10px 20px;
  }
}
.guide-task-pos-accountTask {
  @extend .guide-task-pos-allotTask;
  display: flex;
  flex-direction: column;
  .base-modal-content {
    flex: 1;
  }
}
.guide-task-pos-feedTask {
  @extend .guide-task-pos-allotTask;
  .base-modal-content {
    flex: 1;
    overflow: auto;
    padding: 20px;
    textarea {
      width: 100%;
    }
  }
}
.task-allot-modal > .base-modal {
  width: 100% !important;
  height: 666px;
}
</style>
<style lang="scss" scoped>
$window-width: 1440px;
$window-height: 768px;
$window-width-1: 1760px;
$window-height-1: 938px;
@mixin position-cover($top: 0px, $left: 0px, $width: 0px, $height: 0px) {
  & {
    width: ($width/$window-width) * 100%;
    height: $height/$window-height * 100%;
    top: $top/$window-height * 100%;
    left: $left/$window-width * 100%;
  }
}

@mixin position-cover-posi($top: 0px, $left: 0px) {
  & {
    top: $top/$window-height * 100%;
    left: $left/$window-width * 100%;
  }
}

.guide-pos {
  position: absolute;
  cursor: pointer;
}
.page-guide-box {
  position: relative;
  min-width: $window-width;
  width: 100vw;
  min-height: 100vh;
  background-color: rgba($color: #000000, $alpha: 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}
.page-1440-768 {
  .page-guide-background {
    width: $window-width;
    height: $window-height;
    position: relative;
    img {
      width: 100%;
      height: 100%;
    }
  }
}
.page-1760-938 {
  .page-guide-background {
    width: $window-width-1;
    height: $window-height-1;
    position: relative;
    img {
      width: 100%;
      height: 100%;
    }
  }
}

.guide-menu-pos-1 {
  $top: 450px;
  $left: 610px;
  $width: 144px;
  $height: 40px;
  @extend .guide-pos;
  @include position-cover($top, $left, $width, $height);
}

.guide-menu-pos-2 {
  $top: 450px;
  $left: 890px;
  $width: 144px;
  $height: 40px;
  @extend .guide-pos;
  @include position-cover($top, $left, $width, $height);
}

.guide-task-0-pos-1 {
  $top: 169px;
  $left: 5px;
  $width: 199px;
  $height: 40px;
  @extend .guide-pos;
  @include position-cover($top, $left, $width, $height);
}

.guide-task-0-pos-2 {
  $top: 266px;
  $left: 240px;
  $width: 88px;
  $height: 32px;
  @extend .guide-pos;
  @include position-cover($top, $left, $width, $height);
}

.guide-task-1-pos-1 {
  $top: 119px;
  $left: 225px;
  $width: 75px;
  $height: 44px;
  @extend .guide-pos;
  @include position-cover($top, $left, $width, $height);
}

.guide-task-1-pos-2 {
  $top: 113px;
  $left: 383px;
  $width: 110px;
  $height: 32px;
  @extend .guide-pos;
  @include position-cover($top, $left, $width, $height);
}

.guide-task-3-pos-1 {
  $top: 430px;
  $left: 892px;
  $width: 39px;
  $height: 18px;
  @extend .guide-pos;
  @include position-cover($top, $left, $width, $height);
}

.guide-task-4-pos-1 {
  $top: 585px;
  $left: 892px;
  $width: 39px;
  $height: 18px;
  @extend .guide-pos;
  @include position-cover($top, $left, $width, $height);
}

.guide-task-5-pos-1 {
  $top: 687px;
  $left: 1273px;
  $width: 60px;
  $height: 28px;
  @extend .guide-pos;
  @include position-cover($top, $left, $width, $height);
}

.guide-task-6-pos-1 {
  $top: 231px;
  $left: 1138px;
  $width: 63px;
  $height: 33px;
  @extend .guide-pos;
  @include position-cover($top, $left, $width, $height);
}

.guide-task-8-pos-1 {
  $top: 243px;
  $left: 1334px;
  $width: 44px;
  $height: 28px;
  @extend .guide-pos;
  @include position-cover($top, $left, $width, $height);
}

.guide-task-9-pos-1 {
  $top: 699px;
  $left: 1267px;
  $width: 140px;
  $height: 30px;
  @extend .guide-pos;
  @include position-cover($top, $left, $width, $height);
  border-radius: 15px;
  border: 1px solid #ffffff;
  color: #fff;
  justify-content: space-evenly;
}

.guide-qrcode-0-pos-1 {
  $top: 623px;
  $left: 1317px;
  $width: 88px;
  $height: 32px;
  @extend .guide-pos;
  @include position-cover($top, $left, $width, $height);
}

.guide-qrcode-1-pos-1 {
  $top: 178px;
  $left: 1040px;
  $width: 96px;
  $height: 33px;
  @extend .guide-pos;
  @include position-cover($top, $left, $width, $height);
}

.guide-qrcode-2-pos-1 {
  $top: 590px;
  $left: 825px;
  $width: 110px;
  $height: 25px;
  @extend .guide-pos;
  @include position-cover($top, $left, $width, $height);
}

.guide-qrcode-3-pos-1 {
  $top: 171px;
  $left: 221px;
  $width: 78px;
  $height: 35px;
  @extend .guide-pos;
  @include position-cover($top, $left, $width, $height);
}

.guide-qrcode-4-pos-1 {
  $top: 120px;
  $left: 309px;
  $width: 60px;
  $height: 35px;
  @extend .guide-pos;
  @include position-cover($top, $left, $width, $height);
}

.guide-qrcode-5-pos-1 {
  $top: 687px;
  $left: 1273px;
  $width: 60px;
  $height: 28px;
  @extend .guide-pos;
  @include position-cover($top, $left, $width, $height);
}

.guide-qrcode-6-pos-1 {
  $top: 687px;
  $left: 1273px;
  $width: 60px;
  $height: 28px;
  @extend .guide-pos;
  @include position-cover($top, $left, $width, $height);
}

.guide-task-7-pos-1 {
  $top: 699px;
  $left: 1267px;
  $width: 140px;
  $height: 30px;
  @extend .guide-pos;
  @include position-cover($top, $left, $width, $height);
  border-radius: 15px;
  border: 1px solid #ffffff;
  color: #fff;
  justify-content: space-evenly;
}

.guide-big-size {
  $top: 29px;
  $left: 1267px;
  $width: 60px;
  $height: 30px;
  @extend .guide-pos;
  @include position-cover($top, $left, $width, $height);
  border-radius: 15px;
  border: 1px solid #ffffff;
  color: #fff;
  justify-content: center;
}

.guide-task-pos-editTask {
  $top: 170px;
  $left: 445px;
  width: 740px;
  padding: 20px;
  max-height: 598px / $window-height * 100%;
  overflow-x: hidden;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
  overflow: -moz-scrollbars-none;
  -ms-overflow-style: none;
  position: absolute;
  @include position-cover-posi($top, $left);
}
.guide-task-pos-allotTask {
  $top: 97px;
  $left: 224px;
  width: 1200px / $window-width * 100%;
  min-width: 1100px;
  max-height: 666px / $window-height * 100%;
  overflow-x: hidden;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
  overflow: -moz-scrollbars-none;
  -ms-overflow-style: none;
  position: absolute;
  background: #fff;
  @include position-cover-posi($top, $left);
}

.guide-task-pos-accountTask {
  $top: 140px;
  $left: 432px;
  width: 700px / $window-width * 100%;
  min-width: 700px;
  height: 507px / $window-height * 100%;
  overflow-x: hidden;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
  overflow: -moz-scrollbars-none;
  -ms-overflow-style: none;
  position: absolute;
  background: #fff;
  @include position-cover-posi($top, $left);
}

.guide-task-pos-feedTask {
  $top: 123px;
  $left: 440px;
  width: 640px / $window-width * 100%;
  min-width: 640px;
  height: 522px / $window-height * 100%;
  overflow-x: hidden;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
  overflow: -moz-scrollbars-none;
  -ms-overflow-style: none;
  position: absolute;
  background: #fff;
  @include position-cover-posi($top, $left);
}

.guide-qrcode-pos-editProduct {
  $top: 180px;
  $left: 216px;
  width: 744px / $window-width * 100%;
  height: 310px / $window-height * 100%;
  overflow-x: hidden;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
  overflow: -moz-scrollbars-none;
  -ms-overflow-style: none;
  position: absolute;
  background: #fff;
  @include position-cover-posi($top, $left);
}

.guide-task-pos-back {
  $top: 29px;
  $left: 30px;
  $width: 114px;
  $height: 30px;
  @extend .guide-pos;
  @include position-cover($top, $left, $width, $height);
}
</style>
