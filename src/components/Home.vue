<template>
  <div class="home-container">
    <div class="main-content">

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
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 100vh;
  margin: 0 auto;
}

.main-content {
  display: flex;
  width: 100%;
  flex: 1;
  overflow: hidden;
  margin: 0 auto;
}
</style>
