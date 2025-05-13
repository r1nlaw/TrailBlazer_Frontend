<template>
  <div class="main-layout">
    <Map />
    <TravelList />
  </div>
</template>

<script setup>
import Map from './Map.vue'
import TravelList from './TravelList.vue'
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px 24px 24px;
  background: #f5f5f5;
  min-height: 100vh;
  overflow-y: auto;
  box-sizing: border-box;
}
</style>
