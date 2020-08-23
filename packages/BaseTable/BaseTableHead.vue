<template>
  <div class="base-table-head-wrap">
    <table class="base-table-head">
      <colgroup>
        <col v-if="disableSelect !== true" width="55"></col>
        <col v-for="column in columns" :key="column.field" :width="column.width"></col>
        <col v-if="gutter >= 0" :width="gutter"></col>
      </colgroup>
      <thead>
        <tr>
          <th v-if="this.disableSelect !== true"><input type="checkbox" :checked="checked" @click="toggle"></th>
          <th v-for="column in columns" :key="column.field" v-if="column.hidden !== true">{{column.label}}</th>
          <th v-if="gutter >= 0"></th>
        </tr>
      </thead>
    </table>
  </div>
</template>

<script>
export default {
  name: 'base-table-head',
  props: {
    columns: Array,
    rows: Array,
    checked: Boolean,
    disableSelect: Boolean,
    gutter: Number
  },
  methods: {
    toggle(event){
      this.$emit('select-all', event.target.checked);
    }
  }
}
</script>
