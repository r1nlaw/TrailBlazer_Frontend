<template>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <div class="main-layout">
    <Map ref="mapRef"/>
    <SidebarAndTravelList />
  </div>
</template>

<script setup>
import {ref,provide} from "vue";
import Map from './Map.vue'
import SidebarAndTravelList from "./SidebarAndTravelList.vue";

const mapRef = ref(null);
provide('mapRef',mapRef)


</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  gap: 24px;
  padding: 32px 24px 24px;
  background: #f5f5f5;
  width: 100%;
  box-sizing: border-box;
}

@media(max-width: 1024px){
  .main-layout {
    display: flex;
    flex-direction: column;
    margin-left: -2%;
    overflow-y: auto;
    gap: 24px;
    padding: 32px 24px 24px;
    background: #f5f5f5;

    box-sizing: border-box;
  }

}



</style>
