<template>
  <div class="home-container">
    <div class="main-content">
      <Sidebar />
      <MainMapAndList />
    </div>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import MainMapAndList from '@/components/MainMapAndList.vue'
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}
</style>
