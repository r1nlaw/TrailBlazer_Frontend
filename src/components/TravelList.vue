<template>
  <div class="travel-list-wrapper">
    <!-- Левая колонка: все места -->
    <div class="places">
      <div
        v-for="(place, index) in places"
        :key="place.id"
        class="place-card"
        :class="{ selected: selectedPlaces.includes(place.id) }"
        @click="toggleSelection(place.id)"
        :style="{ animationDelay: (index * 100) + 'ms' }"
      >
        <div class="place-content">
          <div class="title-row">
            <h3 class="place-title">{{ place.title }}</h3>
            <img :src="infoIcon" alt="info" class="icon info-icon" />
          </div>
          <p class="location">{{ place.location }}</p>
          <p class="time">{{ place.time }}</p>
          <div class="rating">
            <span class="price">{{ place.price }}</span>
            <img :src="starIcon" alt="star" class="icon" />
            <span>{{ place.rating }}</span>
            <img :src="reviewIcon" alt="review" class="icon" />
            <span>{{ place.reviews }} отзывов</span>
          </div>
        </div>
        <div class="img">
          <img :src="place.image" class="place-image" />
        </div>
        <input
          type="checkbox"
          class="checkbox"
          :checked="selectedPlaces.includes(place.id)"
          @click.stop
        />
      </div>
    </div>

    <!-- Правая колонка: выбранные места -->
    <div class="selected-places">
      <h2>Выбранные места</h2>
      <div class="scroll-area">
        <div
          v-for="(place, index) in selectedPlaceObjects"
          :key="place.id"
          class="place-card selected"
          :style="{ animationDelay: (index * 150) + 'ms' }"
        >
          <div class="place-content">
            <div class="title-row">
              <h3 class="place-title">{{ place.title }}</h3>
            </div>
            <p class="location">{{ place.location }}</p>
          </div>
          <div class="img">
            <img :src="place.image" class="place-image" />
          </div>
        </div>
      </div>

      <!-- КНОПКА внутри корзины -->
      <button
        v-if="selectedPlaces.length > 0"
        class="bottom-action-button in-cart"
        @click="handleSelection"
      >
        Построить маршрут
      </button>
    </div>
  </div>

</template>



<script setup>
import { ref, computed, inject } from 'vue';
import MapComponent from './Map.vue'
const selectedPlaces = ref([]);
const places = ref([]);
const mapRef = inject('mapRef');


loadLandmark();
function toggleSelection(id) {
  const index = selectedPlaces.value.indexOf(id)
  if (index === -1) {
    selectedPlaces.value.push(id)
  } else {
    selectedPlaces.value.splice(index, 1)
  }
}
const selectedPlaceObjects = computed(() =>
  places.value.filter(place => selectedPlaces.value.includes(place.id))
);
function handleSelection() {
  if (mapRef.value && mapRef.value.RouteMaker) {
    mapRef.value.RouteMaker(selectedPlaces.value);
    console.log('Выбранные ID:', selectedPlaces.value);
  } else {
    console.error('Map component or RouteMaker not available');
  }
}



import infoIcon from '@/assets/icons/info.png'
import starIcon from '@/assets/icons/star.png'
import reviewIcon from '@/assets/icons/review.png'

// import place1 from '@/assets/images/place1.png'
// import place2 from '@/assets/images/place2.png'
// import place3 from '@/assets/images/place3.png'


const news = [
  {
    id: 1,
    title: 'Власти планируют масштабную реконструкцию<br />Генуэзской крепости в Судаке',
    content: `
      <p>Судак, 11 мая — Власти Республики Крым объявили о начале подготовки к масштабной реконструкции

    `,
  },
]

async function loadLandmark() {
  const params = new URLSearchParams(window.location.search);
  let page = params.get('page');
  if (page===null){
    page = "1"
  }
  const domain = "localhost:8080";

  const url = `http://${domain}/api/landmark?page=${page}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const landmarks = await response.json();
    if (landmarks && landmarks.length > 0) {
      landmarks.forEach(element => {
        places.value.push({id: element.id, title: element.name, location: element.address})
        });
      }
    }
  catch (error){
    console.log(error);
  }
}
</script>

<style scoped>

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.place-card,
.news-card {
  animation: fadeInUp 0.6s ease both;
}

.travel-list-wrapper {
  display: flex;
  flex: 1;
  gap: 24px;
  width: 100%;
}

.places {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: visible;
}

.place-card {
  background: white;
  display: flex;
  padding: 12px;
  border-radius: 16px;
  align-items: center;
  gap: 16px;
  position: relative;
  transition: all 0.3s ease;
  border: 1px solid #2c473a54;
}


.place-card:hover {
  transform: translateX(10px);
  box-shadow: 2px 2px 6px #2c473a6b;
  cursor: pointer;
}

.place-card.selected {
  border-color: #2c473a;
  background-color: #f0f9f5;
  box-shadow: 0 0 10px rgba(44, 71, 58, 0.3);
}

.place-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
}
.place-content {
  flex: 1;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.place-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.location,
.time {
  font-size: 13px;
  color: #555;
}

.rating {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  margin-top: 4px;
  color: #444;
}

.price {
  background: #d8f0d8;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.icon {
  width: 16px;
  height: 16px;
  vertical-align: middle;
}

.info-icon {
  width: 14px;
  height: 14px;
  color: rgb(146, 146, 146);
}

.checkbox {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
}


.news-card {
  position: relative;
  flex: 1;
  background: linear-gradient(135deg, #2b4739, #0b4f34);
  border-radius: 16px;
  padding: 16px;
  font-size: 14px;
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  max-height: 650px;
}

.news-card h3 {
  font-size: 16px;
  margin-bottom: 12px;
  color: white;
}

.news-card p {
  margin-bottom: 12px;
  line-height: 1.5;
}

.bottom-action-button {
  background-color: #2c473a;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: opacity 0.3s ease;
  width: 100%;
  margin-top: auto;
}

.bottom-action-button.in-cart {
  margin-top: 16px;
}

.selected-places {
  flex: 0.5;
  display: flex;
  flex-direction: column;
  min-width: 450px;
  gap: 16px;
  background: #f6fdf8;
  border-radius: 16px;
  padding: 26px;
  border: 1px solid #2c473a54;
  max-height: 500px;
  overflow: hidden;
}

.scroll-area {
  flex: 1; /* растягиваем по доступной высоте */
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.selected-places .place-card {
  max-width: 405px; 
}

.selected-places h2 {
  margin-bottom: 8px;
  font-size: 18px;
  color: #2c473a;
}



</style>