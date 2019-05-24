import * as config from '../config';

const SettingMixin = {
  computed: {
    nameMaxLength(){
      return config.FIELD_NAME_LENGTH_MAX;
    },
    placeholderMaxLength(){
      return config.FIELD_PLACEHOLER_LENGTH_MAX;
    }
  }
}

export default SettingMixin;