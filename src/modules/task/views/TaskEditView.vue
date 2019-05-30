<template>
  <div>
    <task-edit-form v-model="form"></task-edit-form>
  </div>
</template>

<script>
import TaskEditForm from '../components/TaskEditForm.vue';

export default {
  name: 'task-edit-view',
  data(){
    return {
      init: false,
      fields: [],
      form: {}
    }
  },
  methods: {
    
  },
  mounted(){
    
  },
  components: {
    [TaskEditForm.name]: TaskEditForm
  }
}
</script>
