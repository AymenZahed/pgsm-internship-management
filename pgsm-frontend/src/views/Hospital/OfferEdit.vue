<template>
  <div class="offer-edit">
    <h1>Edit Internship Offer</h1>
    <!-- Internship offer edit form will go here -->
  </div>
</template>

<script>
export default {
  name: 'OfferEdit',
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
