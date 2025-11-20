<template>
  <div class="error-page forbidden-403">
    <h1>403 - Forbidden</h1>
    <p>You don't have permission to access this page.</p>
    <router-link to="/">Return to Home</router-link>
  </div>
</template>

<script>
export default {
  name: 'Forbidden403'
};
</script>

<style scoped>
.error-page {
  text-align: center;
  padding: 2rem;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #e74c3c;
}

p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #7f8c8d;
}

a {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

a:hover {
  background-color: #2980b9;
}
</style>
