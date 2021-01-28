<template>
  <base-modal
    class="task-setting-guide-dialog"
    :show.sync="visible"
    width="800px"
  >
    <el-carousel class="task-setting-slide" height="430px" :interval="5000" arrow="always">
      <el-carousel-item v-for="(item, index) in carouselData" :key="index">
        <div class="task-setting-slide-img">
          <img :src="item.img" />
        </div>
        <h2 class="task-setting-slide-title">{{ item.title }}</h2>
        <div class="task-setting-slide-desc">{{ item.desc }}</div>
        <div class="task-setting-slide-important">点击全面开启，让您所在的企业进入并永久保持在所有工单模块的全新界面，体验更全面的新版工单功能！</div>
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
          title: '二级审批',
          desc: '指派工单、开始工单、完成工单、工单结算、工单回访、工单关闭6个工单节点升级为二级审批，同时新增工单暂停、取消状态的二级审批，让工单流程更具严谨性；支持设置工单发起人主管、指定人员等多种审批条件，让工单审批灵活适配业务需求！'
        }, {
          img: TASK_SETTING_GUIDE_2,
          title: '工单表单设计器',
          desc: '涵盖20+表单控件，新增多级菜单、计算公式、关联工单等基础控件；新增4大控件通用规则：支持字段隐藏、设置字段查看权限等；打造通用的公共字段，将控件内容一键复用于每个工单表单，轻松设计贴合业务场景的个性化表单！'
        }, {
          img: TASK_SETTING_GUIDE_3,
          title: '附加组件表单设计器',
          desc: '附加组件表单自定义配置扩展至18个表单控件，支持多级菜单、电子签名、说明信息等字段，可自主选择是否将附加组件添加至工单，助力工单贴合更复杂业务场景！'
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

    &-important {
      padding: 10px 40px 0;
      color: $color-primary;
    }

    .el-carousel__indicators {
      bottom: 150px;

      .el-carousel__button {
        width: 8px !important;
        height: 8px !important;
        background-color: $color-primary;
      }
    }
  }
}
</style>