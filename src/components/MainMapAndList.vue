<template>
  <div class="main-layout">
    <Map ref="mapRef"/>
    <TravelList />
  </div>
</template>

<script setup>
import {ref,provide} from "vue";
import Map from './Map.vue'
import TravelList from './TravelList.vue'

const mapRef = ref(null);
provide('mapRef',mapRef)
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px 24px 24px;
  background: #f5f5f5;
  min-height: 100vh;

  box-sizing: border-box;
}
</style>
