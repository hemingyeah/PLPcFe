<template>
  <div class="form-preview-group form-info-preview">
    <div class="form-item__text">
      {{ field.placeHolder || placeholder }}
    </div>
  </div>
</template>

<script>
import {PLACE_HOLDER} from './config';

export default {
  name: 'form-info-preview',
  props: {
    field: {
      type: Object,
      default: () => ({})
    },
    setting: {
      type: Object,
      default: () => ({})
    },
    placeholder: {
      type: String,
      default: PLACE_HOLDER
    }
  }
}
</script>

<style lang="scss">
.form-info-preview {
  label {
    flex-shrink: 0;
  }
  .form-item__text {
    word-break: break-all;
  }
}
</style>
