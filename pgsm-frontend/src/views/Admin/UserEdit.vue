<template>
  <div class="user-edit">
    <h1>Edit User</h1>
    <!-- User edit form will go here -->
  </div>
</template>

<script>
export default {
  name: 'UserEdit',
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  }
};
</script>

<style scoped>
/* Component styles will go here */
</style>
