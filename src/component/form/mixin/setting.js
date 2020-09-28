/* config */
import * as config from '@src/component/form/config';
/* component */
import MobileShowSetting from '@src/component/form/common/setting/MobileShowSetting.vue';

const SettingMixin = {
  computed: {
    // 是否是 工单模式
    isTaskMode() {
      return this.mode === 'task';
    },
    // 工单：移动端显示的 字段列表
    mobileShowField() {
      return this.fields.filter(field => field.isAppShow === 1);
    },
    // 名字最大长度
    nameMaxLength(){
      return config.FIELD_NAME_LENGTH_MAX;
    },
    // 占位符最大长度
    placeholderMaxLength(){
      return config.FIELD_PLACEHOLER_LENGTH_MAX;
    },
    // 工单移动端展示最大数量
    taskMobileShowMaxLengthMax() {
      return config.TASK_MOBILE_SHOW_MAX_LENGTH_MAX;
    }
  },
  components: {
    [MobileShowSetting.name]: MobileShowSetting
  }
}

export default SettingMixin;