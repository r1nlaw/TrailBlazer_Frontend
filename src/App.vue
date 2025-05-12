<template>
  <div class="app">
    <Header />
    <div class="content">
      <!--<Sidebar /> -->
      <div class="main">
       <!-- <MapView /> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
//import Sidebar from './components/Sidebar.vue'
//import MapView from './components/MapView.vue'
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.main {
  flex: 1;
  position: relative;
  overflow: auto;
}
</style>
