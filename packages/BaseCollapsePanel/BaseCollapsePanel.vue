<template>
  <el-collapse-transition>
    <div v-show="value">
      <slot></slot>
    </div>
  </el-collapse-transition>
</template>

<script>
import CollapseTransition from 'element-ui/lib/transitions/collapse-transition';

export default {
  name: 'base-collapse-panel',
  props: ['value'],
  components: {
    [CollapseTransition.name]: CollapseTransition
  }
}
</script>
