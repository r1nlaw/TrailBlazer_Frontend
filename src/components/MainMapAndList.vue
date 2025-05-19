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
  margin-left: 17%;
  overflow-y: auto;
  gap: 24px;
  padding: 32px 24px 24px;
  background: #f5f5f5;
  min-height: 100vh;
  min-width: 159vh;
  box-sizing: border-box;
}

@media (max-width: 375px) {
  .main-layout {
    display: flex;
    flex-direction: column;
    margin-left: -7%;
    overflow-y: auto;
    gap: 24px;
    padding: 32px 24px 24px;
    background: #f5f5f5;
    min-height: 100vh;
    min-width: 159vh;
    box-sizing: border-box;
  }
}

</style>
