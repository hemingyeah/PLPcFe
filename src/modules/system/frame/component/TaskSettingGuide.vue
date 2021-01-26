<template>
  <base-modal
    class="task-setting-guide-dialog"
    :show.sync="visible"
    width="800px"
  >
    <el-carousel class="task-setting-slide" height="400px" :interval="5000" arrow="always">
      <el-carousel-item v-for="(item, index) in carouselData" :key="index">
        <div class="task-setting-slide-img">
          <img :src="item.img" />
        </div>
        <h2 class="task-setting-slide-title">{{ item.title }}</h2>
        <div class="task-setting-slide-desc">{{ item.desc }}</div>
      </el-carousel-item>
    </el-carousel>

    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false" :disabled="pending">暂不开启</el-button>
      <el-button type="primary" @click="submit" :disabled="pending">全面开启</el-button>
    </div>
  </base-modal>
</template>
<script>
/** api */
import * as TaskApi from '@src/api/TaskApi.ts';
/** images */
import TASK_SETTING_GUIDE_1 from '@src/assets/img/setting/task_setting_guide_1.png';
import TASK_SETTING_GUIDE_2 from '@src/assets/img/setting/task_setting_guide_2.png';
import TASK_SETTING_GUIDE_3 from '@src/assets/img/setting/task_setting_guide_3.png';

export default {
  name: 'task-setting-guide',
  data() {
    return {
      pending: false,
      visible: false,
      carouselData: [
        {
          img: TASK_SETTING_GUIDE_1,
          title: '工单二级审批',
          desc: '新增工单暂停、取消状态、工单内容的二级审批，让工单流程更具严谨性；支持设置工单发起人主管、指定人员等多种审批条件，让工单审批灵活适配业务需求！点击全面开启，让您所在的企业进入并永久保持在所有工单模块的全新界面，体验更全面的新版工单功能！'
        }, {
          img: TASK_SETTING_GUIDE_2,
          title: '工单表单设计器',
          desc: '涵盖20+工单自定义组件，新增多级菜单、计算公式、关联工单等组件；新增4大表单规则，支持字段隐藏、人员可见性等通用规则；打造通用的公共字段，将组件内容一键复用于各大表单，轻松设计贴合业务场景的个性化表单！点击全面开启，让您所在的企业进入并永久保持在所有工单模块的全新界面，体验更全面的新版工单功能！'
        }, {
          img: TASK_SETTING_GUIDE_3,
          title: '附加组件表单设计器',
          desc: '附加组件表单自定义配置扩展至18个自定义组件，支持多级菜单、电子签名、说明信息等字段，可自主选择是否将此添加至工单，助力工单贴合更复杂业务场景！点击全面开启，让您所在的企业进入并永久保持在所有工单模块的全新界面，体验更全面的新版工单功能！'
        }
      ],
      url: ''
    }
  },
  methods: {
    open(url) {
      this.visible = true;
      this.url = url;
    },
    submit() {
      this.pending = true;

      TaskApi.checkConfirmSettingGrayFunction({isConfirm: true})
        .then(res => {
          if (res.succ) {
            this.$parent.changeConfirmSetting();
            this.visible = false;

            if (this.url) {
              this.$platform.openTab({
                id: 'M_SYSTEM',
                title: '系统管理',
                url: this.url
              })
            }
          } else {
            this.$platform.alert(res.message);
          }

          this.pending = false;
        })
        .catch(e => {
          this.pending = false;
        })   
    }
  }
}
</script>
<style lang="scss">
.task-setting-guide-dialog {
  display: flex;
  align-items: center;

  .base-modal-header {
    display: none;
  }

  .task-setting-slide {
    &-img {
      img {
        width: 100%;
      }
    }

    &-title {
      padding: 20px 40px 0;
      font-size: $font-size-larger;
    }

    &-desc {
      padding: 0 40px;
      color: $text-color-regular;
    }

    .el-carousel__indicators {
      bottom: 120px;
    }
  }
}
</style>