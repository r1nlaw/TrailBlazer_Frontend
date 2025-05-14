<template>
  <div class="app-container">
    <Header />

    <div class="main-content">
      <Sidebar />
      <MainMapAndList />
    </div>
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'
import MainMapAndList from './components/MainMapAndList.vue'
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}
html,
body,
#app {
  font-optical-sizing: auto;
  height: 100%;
  margin: 0;
}

</style>
