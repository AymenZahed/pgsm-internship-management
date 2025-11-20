<template>
  <div class="reset-password">
    <h1>Reset Password</h1>
    <!-- Reset password form will go here -->
  </div>
</template>

<script>
export default {
  name: 'ResetPassword',
  props: {
    token: {
      type: String,
      required: true
    }
  }
};
</script>

<style scoped>
/* Component styles will go here */
</style>
