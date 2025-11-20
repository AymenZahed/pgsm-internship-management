<template>
  <div class="error-page not-found-404">
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
    <router-link to="/">Return to Home</router-link>
  </div>
</template>

<script>
export default {
  name: 'NotFound404'
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
  color: #2c3e50;
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
