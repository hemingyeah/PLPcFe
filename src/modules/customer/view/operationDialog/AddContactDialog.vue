<template>
  <base-modal title="添加联系人" :show.sync="addContactDialog" width="500px"
              class="add-contact-dialog">

  </base-modal>
</template>

<script>
  export default {
    name: "add-contact-dialog",
    data() {
      return {
        addContactDialog: false,
      }
    },
    mounted() {
    },
    methods: {
      openDialog() {
        this.addContactDialog = true;
      },
    },
  }
</script>

<style lang="scss">

</style>