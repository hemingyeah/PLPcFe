<template>
  <div style="padding: 10px;">
    <base-calculation-formula ref="BaseCalculationFormula" />
  </div>
</template>

<script>
import BaseCalculationFormula from '@src/component/common/BaseCalculationFormula/BaseCalculationFormula.tsx'

export default {
  name: 'demo-view',
  data () {
    return {

    }
  },
  methods: {

  },
  mounted() {
    this.$refs.BaseCalculationFormula.open()
  },
  components: {
    [BaseCalculationFormula.name]: BaseCalculationFormula
  }
};
</script>



