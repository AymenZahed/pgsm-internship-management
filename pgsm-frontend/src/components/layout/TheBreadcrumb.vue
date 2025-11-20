<template>
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <ol class="breadcrumb-list">
      <li 
        v-for="(item, index) in breadcrumbItems" 
        :key="index" 
        class="breadcrumb-item"
        :class="{ 'is-active': index === breadcrumbItems.length - 1 }"
      >
        <router-link
          v-if="index !== breadcrumbItems.length - 1"
          :to="item.to"
          class="breadcrumb-link"
        >
          {{ item.text }}
        </router-link>
        <span v-else class="breadcrumb-text">
          {{ item.text }}
        </span>
        <span 
          v-if="index < breadcrumbItems.length - 1" 
          class="breadcrumb-separator"
          aria-hidden="true"
        >
          /
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const breadcrumbItems = computed(() => {
  const items = [{ text: 'Home', to: '/' }];
  
  if (route.meta.breadcrumb) {
    return route.meta.breadcrumb;
  }
  
  const pathSegments = route.path.split('/').filter(Boolean);
  
  pathSegments.forEach((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const text = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    items.push({ text, to: path });
  });
  
  return items;
});
</script>

<style scoped>
.breadcrumb {
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  padding: 0 2rem;
}

.breadcrumb-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 0;
  margin: 0;
  list-style: none;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  color: #6b7280;
}

.breadcrumb-link {
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

.breadcrumb-item.is-active .breadcrumb-text {
  color: #4b5563;
  font-weight: 500;
}

.breadcrumb-separator {
  margin: 0 0.5rem;
  color: #9ca3af;
  user-select: none;
}
</style>
