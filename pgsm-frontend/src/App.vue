<template>
  <div class="min-h-screen bg-gray-50">
    <TheNavbar />
    <div class="flex">
      <TheSidebar />
      <main class="flex-1 p-6">
        <TheBreadcrumb />
        <RouterView />
      </main>
    </div>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import TheNavbar from '@/components/layout/TheNavbar.vue'
import TheSidebar from '@/components/layout/TheSidebar.vue'
import TheFooter from '@/components/layout/TheFooter.vue'
import TheBreadcrumb from '@/components/layout/TheBreadcrumb.vue'
</script>