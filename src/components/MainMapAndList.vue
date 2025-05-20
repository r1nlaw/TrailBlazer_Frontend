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
@media (max-width: 1650px) {
    .main-layout {
    display: flex;
    flex-direction: column;
    margin-left: 18%;
    overflow-y: auto;
    gap: 24px;
    padding: 32px 24px 24px;
    background: #f5f5f5;
    min-height: 100vh;
    min-width: 135vh;
    box-sizing: border-box;
  }
}
@media (max-width: 1430px) {
    .main-layout {
    display: flex;
    flex-direction: column;
    margin-left: 20%;
    overflow-y: auto;
    gap: 24px;
    padding: 32px 24px 24px;
    background: #f5f5f5;
    min-height: 100vh;
    min-width: 15vh;
    box-sizing: border-box;
  }
}
@media (max-width: 1350px) {
    .main-layout {
    display: flex;
    flex-direction: column;
    margin-left: 21%;
    overflow-y: auto;
    gap: 24px;
    padding: 32px 24px 24px;
    background: #f5f5f5;
    min-height: 100vh;
    min-width: 15vh;
    box-sizing: border-box;
  }
}
@media (max-width: 1280px) {
    .main-layout {
    display: flex;
    flex-direction: column;
    margin-left: 0%;
    overflow-y: auto;
    gap: 24px;
    padding: 32px 24px 24px;
    background: #f5f5f5;
    min-height: 100vh;
    min-width: 135vh;
    box-sizing: border-box;
  }
}
@media (max-width: 1150px) {
    .main-layout {
    display: flex;
    flex-direction: column;
    margin-left: -2%;
    overflow-y: auto;
    gap: 24px;
    padding: 32px 24px 24px;
    background: #f5f5f5;
    min-height: 100vh;
    min-width: 135vh;
    box-sizing: border-box;
  }
}
@media (max-width: 1130px) {
    .main-layout {
    display: flex;
    flex-direction: column;
    margin-left: -2%;
    overflow-y: auto;
    gap: 24px;
    padding: 32px 24px 24px;
    background: #f5f5f5;
    min-height: 100vh;
    min-width: 135vh;
    box-sizing: border-box;
  }
}

@media (max-width: 1024px) {
    .main-layout {
    display: flex;
    flex-direction: column;
    margin-left: -7%;
    overflow-y: auto;
    gap: 24px;
    padding: 32px 24px 24px;
    background: #f5f5f5;
    min-height: 100vh;
    min-width: 135vh;
    box-sizing: border-box;
  }
}
@media (max-width: 912px) {
    .main-layout {
    display: flex;
    flex-direction: column;
    margin-left: -7%;
    overflow-y: auto;
    gap: 24px;
    padding: 32px 24px 24px;
    background: #f5f5f5;
    min-height: 100vh;
    min-width: 135vh;
    box-sizing: border-box;
  }
}
@media (max-width: 853px) {
    .main-layout {
    display: flex;
    flex-direction: column;
    margin-left: -7%;
    overflow-y: auto;
    gap: 24px;
    padding: 32px 24px 24px;
    background: #f5f5f5;
    min-height: 100vh;
    min-width: 135vh;
    box-sizing: border-box;
  }
}
@media (max-width: 820px) {
    .main-layout {
    display: flex;
    flex-direction: column;
    margin-left: -7%;
    overflow-y: auto;
    gap: 24px;
    padding: 32px 24px 24px;
    background: #f5f5f5;
    min-height: 100vh;
    min-width: 135vh;
    box-sizing: border-box;
  }
}
@media (max-width: 768px) {
    .main-layout {
    display: flex;
    flex-direction: column;
    margin-left: -7%;
    overflow-y: auto;
    gap: 24px;
    padding: 32px 24px 24px;
    background: #f5f5f5;
    min-height: 100vh;
    min-width: 135vh;
    box-sizing: border-box;
  }
}
@media (max-width: 540px) {
    .main-layout {
    display: flex;
    flex-direction: column;
    margin-left: -7%;
    overflow-y: auto;
    gap: 24px;
    padding: 32px 24px 24px;
    background: #f5f5f5;
    min-height: 100vh;
    min-width: 135vh;
    box-sizing: border-box;
  }
}
@media (max-width: 430px) {
    .main-layout {
    display: flex;
    flex-direction: column;
    margin-left: -7%;
    overflow-y: auto;
    gap: 24px;
    padding: 32px 24px 24px;
    background: #f5f5f5;
    min-height: 100vh;
    min-width: 135vh;
    box-sizing: border-box;
  }
}
@media (max-width: 414px) {
    .main-layout {
    display: flex;
    flex-direction: column;
    margin-left: -7%;
    overflow-y: auto;
    gap: 24px;
    padding: 32px 24px 24px;
    background: #f5f5f5;
    min-height: 100vh;
    min-width: 135vh;
    box-sizing: border-box;
  }
}
@media (max-width: 414px) {
    .main-layout {
    display: flex;
    flex-direction: column;
    margin-left: -7%;
    overflow-y: auto;
    gap: 24px;
    padding: 32px 24px 24px;
    background: #f5f5f5;
    min-height: 100vh;
    min-width: 135vh;
    box-sizing: border-box;
  }
}
@media (max-width: 390px) {
    .main-layout {
    display: flex;
    flex-direction: column;
    margin-left: -7%;
    overflow-y: auto;
    gap: 24px;
    padding: 32px 24px 24px;
    background: #f5f5f5;
    min-height: 100vh;
    min-width: 135vh;
    box-sizing: border-box;
  }
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

@media (max-width: 360px) {
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

@media (max-width: 344px) {
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
