<template>
  <div class="travel-list-wrapper">
    <!-- Левая колонка: все места -->
    <div class="places">
      
      <div
        v-for="(place, index) in sortedPlaces"
        :key="place.id"
        class="card place-card"
        :class="{ selected: selectedPlaces.includes(place.id) }"
        @click="toggleSelection(place.id)"
        :style="{ animationDelay: (index * 100) + 'ms' }"
      >
        <div class="place-content">
          <div class="title-row">
            <h3 class="place-title">{{ place.title }}</h3>
            <img
              :src="infoIcon"
              alt="info"
              class="icon info-icon"
              @click.stop="goToLandmark(place.translated_name)"
            />
          </div>
          <p class="location">{{ place.location }}</p>
          <p class="time">{{ place.time }}</p>
          <div v-if="getCurrentWeather(place)" class="weather-info">
            <img :src="`https://openweathermap.org/img/wn/${getCurrentWeather(place).icon}@2x.png`" 
                 :alt="getCurrentWeather(place).description"
                 class="weather-icon" />
            <span class="temperature">{{ Math.round(getCurrentWeather(place).temperature) }}°C</span>
            <span class="weather-description">{{ getCurrentWeather(place).description }}</span>
          </div>
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
    <div
      class="selected-places"
      :class="{ 'mobile-visible': isCartVisible, 'mobile-hidden': !isCartVisible && isMobileView }"
    >
      <div class="card h-100 p-3">
        <h2>Выбранные места</h2>
        <button
          v-if="selectedPlaces.length > 0"
          class="bottom-action-button clear-selection"
          @click="clearSelection"
        >
          Очистить выбранные
        </button>
        <button
          v-if="selectedPlaces.length > 0"
          class="bottom-action-button copy-route"
          @click="copyRouteLink"
        >
          Скопировать маршрут
        </button>


        <div class="scroll-area">
          <div
            v-for="(place, index) in selectedPlaceObjects"
            :key="place.id"
            class="selected-place place-card  selected"
            :style="{ animationDelay: (index * 150) + 'ms' }"
          >
            <div class="place-content">
              <div class="title-row">
                <h3 class="place-title">{{ place.title }}</h3>
                  <img
                    :src="infoIcon"
                    alt="info"
                    class="icon info-icon"
                    @click.stop="goToLandmark(place.translated_name)"
                  />
              </div>
              <p class="location">{{ place.location }}</p>
            </div>
            <div class="img">
              <img :src="place.image" class="place-image" />
            </div>
          </div>
        </div>

        <button
          v-if="selectedPlaces.length > 0"
          class="bottom-action-button in-cart"
          @click="handleSelection"
        >
          Построить маршрут
        </button>
      </div>
    </div>

    <!-- Кнопка для открытия/закрытия корзины на мобильных устройствах -->
    <button
      v-if="selectedPlaces.length > 0 && isMobileView"
      class="mobile-cart-button"
      @click="toggleCart"
    >
      <span class="cart-icon">{{ isCartVisible ? 'Закрыть маршрут' : 'Открыть маршрут' }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute(); 

const selectedPlaces = ref([]);
const places = ref([]);
const currentPage = ref(1);
const isLoading = ref(false);
const noMoreData = ref(false);
const mapRef = inject('mapRef');
const isCartVisible = ref(true);
const isMobileView = ref(false);

let scrollContainer = null;

// Категории приходят через props
const props = defineProps({
  selectedCategories: {
    type: Array,
    default: () => []
  }
});
const selectedCategories = ref([...props.selectedCategories]);

// Подписка на изменение props снаружи
watch(() => props.selectedCategories, (newVal) => {
  selectedCategories.value = [...newVal];
});

// Следим за выбранными категориями, сбрасываем и перезагружаем места
watch(selectedCategories, async (newVal) => {
  const query = newVal.length > 0 ? { category: newVal } : {};
  router.replace({ query });

  places.value = [];
  currentPage.value = 1;
  noMoreData.value = false;

  await loadLandmark();
});


const sortedPlaces = computed(() => {
  // Если нет выбранных категорий, вернуть как есть
  if (!selectedCategories.value.length) return places.value;

  // Разделяем места по совпадению с выбранными категориями
  const matching = [];
  const others = [];

  for (const place of places.value) {
    if (selectedCategories.value.includes(place.category)) {
      matching.push(place);
    } else {
      others.push(place);
    }
  }

  return [...matching, ...others];
});

onMounted(async () => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);

  scrollContainer = document.querySelector('.main-layout');
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleScroll);
  }

  const urlCategories = route.query.category;
  if (Array.isArray(urlCategories)) {
    selectedCategories.value = urlCategories;
  } else if (typeof urlCategories === 'string') {
    selectedCategories.value = [urlCategories];
  }

  const urlSelected = route.query.landmark;

  if (Array.isArray(urlSelected)) {
    selectedPlaces.value = urlSelected.map(id => parseInt(id));
  } else if (typeof urlSelected === 'string') {
    selectedPlaces.value = [parseInt(urlSelected)];
  }


  await loadLandmark();
});

watch(
  () => route.query.landmark,
  (newVal) => {
    const landmarkIds = Array.isArray(newVal)
      ? newVal.map(id => parseInt(id))
      : newVal
        ? [parseInt(newVal)]
        : [];

    // Добавляем только уникальные id
    for (const id of landmarkIds) {
      if (!selectedPlaces.value.includes(id)) {
        selectedPlaces.value.push(id);
      }
    }

    // Очищаем URL (удаляем query-параметры)
    if (landmarkIds.length > 0) {
      router.replace({ path: route.path, query: { ...route.query, landmark: undefined } });
    }
  },
  { immediate: true }
);


async function loadLandmark(categories = selectedCategories.value) {
  if (isLoading.value || noMoreData.value) return;

  isLoading.value = true;

  const domain = import.meta.env.VITE_BACKEND_URL;
  let url = `${domain}/api/landmark?page=${currentPage.value}`;

  if (categories.length > 0) {
    url += `&${categories.map(cat => `category=${encodeURIComponent(cat)}`).join('&')}`;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const landmarks = await response.json();

    if (!landmarks || landmarks.length === 0) {
      noMoreData.value = true;
      return;
    }

    const newPlaces = landmarks.map(element => ({
      id: element.id,
      title: element.name,
      location: element.address,
      translated_name: element.translated_name,
      category: element.category,
      time: element.time ?? '',
      price: element.price ?? '',
      rating: element.rating ?? '',
      reviews: element.reviews ?? '',
      image: `${domain}/images/${element.image_path}`,
      weathers: element.weathers
    }));

    if (currentPage.value === 1) {
      places.value = newPlaces;
    } else {
      places.value.push(...newPlaces);
    }

    currentPage.value++;
  } catch (error) {
    console.error("Ошибка при загрузке достопримечательностей:", error);
  } finally {
    isLoading.value = false;
  }
}

function handleScroll() {
  if (!scrollContainer) return;

  const scrollTop = scrollContainer.scrollTop;
  const scrollHeight = scrollContainer.scrollHeight;
  const clientHeight = scrollContainer.clientHeight;

  const buffer = 200;
  if (scrollTop + clientHeight + buffer >= scrollHeight) {
    loadLandmark(); // загружает следующую страницу
  }
}

function toggleSelection(id) {
  const index = selectedPlaces.value.indexOf(id);
  if (index === -1) {
    selectedPlaces.value.push(id);
  } else {
    selectedPlaces.value.splice(index, 1);
  }
}

function clearSelection() {
  selectedPlaces.value = [];

  if (mapRef?.value?.resetRoute) {
    mapRef.value.resetRoute();
  } else {
    console.warn('clearRoute не доступен через mapRef');
  }

  // Закрываем панель на мобильных устройствах
  if (isMobileView.value) {
    isCartVisible.value = false;
  }
}


function handleSelection() {
  if (mapRef?.value?.RouteMaker) {
    mapRef.value.RouteMaker(selectedPlaces.value);
    console.log('Выбранные ID:', selectedPlaces.value);
  } else {
    console.error('Map component or RouteMaker not available');
  }
}

function copyRouteLink() {
  if (!selectedPlaces.value.length) return;

  const params = selectedPlaces.value.map(id => `landmark=${encodeURIComponent(id)}`).join('&');
  const routeUrl = `${window.location.origin}/route?${params}`;

  navigator.clipboard.writeText(routeUrl)
    .then(() => {
      alert('Ссылка на маршрут скопирована!');
    })
    .catch(err => {
      console.error('Ошибка копирования маршрута:', err);
      alert('Не удалось скопировать ссылку');
    });
}


function goToLandmark(nameTranslate) {
  if (!nameTranslate) return;
  router.push(`/landmark/${encodeURIComponent(nameTranslate)}`);
}

function checkScreenSize() {
  const width = window.innerWidth;
  isMobileView.value = width <= 1026;
  isCartVisible.value = !isMobileView.value;
}

function toggleCart() {
  isCartVisible.value = !isCartVisible.value;
}

const selectedPlaceObjects = computed(() => {
  return places.value.filter(place => selectedPlaces.value.includes(place.id));
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScreenSize);

  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', handleScroll);
  }
});

import infoIcon from '@/assets/icons/info.png';
import starIcon from '@/assets/icons/star.png';
import reviewIcon from '@/assets/icons/review.png';

// Добавляем функцию для получения текущей погоды
function getCurrentWeather(place) {
  if (!place.weathers || !place.weathers.length) return null;
  
  const now = new Date();
  const currentHour = now.getUTCHours();
  
  // Находим ближайший прогноз погоды
  return place.weathers.reduce((closest, current) => {
    const currentDate = new Date(current.date);
    const currentHourDiff = Math.abs(currentDate.getUTCHours() - currentHour);
    const closestHourDiff = Math.abs(new Date(closest.date).getUTCHours() - currentHour);
    
    return currentHourDiff < closestHourDiff ? current : closest;
  });
}



</script>



<style scoped>
@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}


.selected-places .place-card {
  height: auto !important;
  width: 100%;
  max-width: 100%;
  white-space: normal;
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.selected-place{
  width: 50%;
}
.place-card{
  width:90%;
}
.selected-places {
  flex: 0.5;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f6fdf8;
  border-radius: 16px;
  padding: 26px;
  border: 1px solid #2c473a54;
  transition: transform 0.3s ease, opacity 0.3s ease;
  overflow: hidden;
  height: 500px;
  position: sticky;
  top: 20px;
  min-width: 500px;
  max-width: 600px;
 
}
.selected-places.mobile-hidden {
  transition: transform 0.4s ease;
  transform: translateX(100%);
}

.selected-places.mobile-visible {
  transition: transform 0.4s ease;
  transform: translateX(0);
  z-index: 1000;
}
.travel-list-wrapper {
  display: flex;
  flex: 1;
  gap: 24px;
  width: 100%;
  position: relative;
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
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  width: 90%;
  margin: 0 auto;
}

.place-card:hover {
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




.bottom-action-button {
  background-color: #2c473a;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(44, 71, 58, 0.25);
  transition: all 0.3s ease;
  width: 100%;
  margin-top: auto;
  position: sticky;
  bottom: 0;
  z-index: 10;
}
.bottom-action-button:hover {
  background-color: #3a5e4a;
  transform: scale(1.03);
  box-shadow: 0 6px 18px rgba(44, 71, 58, 0.35);
}

.bottom-action-button.in-cart {
  margin-top: auto;
}

.bottom-action-button.in-cart {
  margin-top: 16px;
}

.selected-places h2 {
  margin-bottom: 8px;
  font-size: 16px;
  color: #2c473a;
}

.mobile-cart-button {
  position: fixed;
  bottom: 60px;
  right: 60px;
  background-color: #2c473a;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 5010;
  cursor: pointer;
}
.bottom-action-button.clear-selection {
  background-color: #2c473a;
  color: white;
  margin-top: 12px;
  padding: 6px 12px;
  margin-bottom: 12px;
  border-radius: 12px;
  max-width: 200px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 13px;
}

.bottom-action-button.clear-selection:hover {
  background-color: #456e5a;
}

.bottom-action-button.copy-route{
    background-color: #2c473a;
  color: white;
  padding: 6px 12px;
  margin-left: 8px;
  margin-bottom: 12px;
  border-radius: 12px;
  max-width: 200px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 13px;
}

.bottom-action-button.copy-route:hover {
  background-color: #456e5a;
}
@media (max-width: 2880px){
  .travel-list-wrapper {
    width: 100%;
    gap: 16px; 
  }

  .selected-place.place-card.selected{
    max-width: 95%;
  }
}
@media (max-width: 2560px){
  .travel-list-wrapper {
    width: 100%;
    gap: 16px; 
  }

  .selected-place.place-card.selected{
    max-width: 95%;
  }
}

@media (max-width: 1920px){
  .travel-list-wrapper {
    width: 100%;
    gap: 16px; 
  }

  .selected-place.place-card.selected{
    max-width: 90%;
  }
}

@media (max-width: 1024px) {
  .selected-places {
    position: fixed;
    top: 0;
    right: 0;
    width: 96%;
    height: 100vh;
    z-index: 1000;
    padding: 20px;
    border-radius: 0;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    overflow: hidden;
    min-width: unset;
    max-width: unset;
  }

  .selected-places.mobile-visible {
    transform: translateX(0);
  }

  .selected-places.mobile-hidden {
    transform: translateX(100%);
  }

  .scroll-area {
    max-height: calc(100vh - 200px);
    padding-bottom: 840px;
    margin-bottom: 20px;
    min-height: 0;
    overflow-y: auto;
  }
  

  .bottom-action-button.in-cart {
    position: fixed;
    bottom: 20px;
    margin: 30px 0;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 40px);
    max-width: 400px;
    z-index: 1001;
  }
}

@media (max-width: 912px) { 
  .place-card{
    width: 820px;
  }

  .selected-places.mobile-hidden{
    margin-left: 1000px;
  }

  .bottom-action-button.in-cart{
    background-color: #2c473a;
  }
  .place-card.selected{
    max-width: 920px;
  }

}
@media (max-width: 853px) { 
  .place-card{
    width: 750px;
  }

  .selected-places.mobile-hidden{
    margin-left: 1000px;
  }

  .bottom-action-button.in-cart{
    background-color: #2c473a;
  }
  .place-card.selected{
    max-width: 790px;
  }


}
@media (max-width: 820px) { 
  .place-card{
    width: 720px;
  }

  .selected-places.mobile-hidden{
    margin-left: 1000px;
  }
  .selected-places{
    width: 96%;
  }

  .bottom-action-button.in-cart{
    background-color: #2c473a;
    margin: 30px 0;
  }
  .place-card.selected{
    max-width: 720px;
  }
  .scroll-area {
    max-height: calc(100vh - 180px);
    padding-bottom: 660px;
    min-height: 0;
  }

}

@media (max-width: 768px) {
  .place-card{
    width: 665px;
  }
  .selected-places {
    padding: 16px;
    width: 96%;

  }

  .selected-places h2 {
    font-size: 20px;
    margin-bottom: 16px;
  }
  .selected-place.place-card.selected {
    max-width: 96%;
    min-width: unset;
    width: 100%;
    padding: 8px;
    margin-bottom: 8px;
  }

  .bottom-action-button.clear-selection,
  .bottom-action-button.copy-route {
    max-width: 100%;
    margin: 8px 0;
  }
  .bottom-action-button.in-cart{
    max-width: 100%;
    margin: 20px 0;
  }

  .scroll-area {
    max-height: calc(100vh - 180px);
    padding-bottom: 460px;
    min-height: 0;
  }
}

@media (max-width: 540px) { 
  .place-card{
    width: 450px;
  }
  .selected-place.place-card.selected{
    min-width: 470px;
    max-width: 470px;
  }

  .selected-places.mobile-hidden{
    margin-left: 1000px;
  }
  .bottom-action-button.in-cart{
    background-color: #2c473a;
  }
  .place-card.selected{
    max-width: 470px;
  }
}
@media (max-width: 430px) { 
  .place-card{
    width: 340px;
    height: 160px;
  }
  .selected-places {
    position: fixed;
    top: 0;
    right: 0;
    width: 92%;
    height: 100vh;
    z-index: 1000;
    padding: 16px;
    border-radius: 0;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    overflow: hidden;
  }

  .selected-place.place-card.selected{
    max-width: 355px;
    min-width: 350px;
  }
  .selected-places.mobile-hidden{
    margin-left: 500px;
  }
  .bottom-action-button.in-cart {
    background-color: #2c473a;
    max-width: 70%;
    width: calc(100% - 32px);
    margin-bottom: 20px;
    padding: 8px 16px;
    font-size: 13px;
  }
  .place-card.selected{
    max-width: 370px;
  }
}

@media (max-width: 414px) { 
  .place-card {
    width: 325px;
    height: 160px;
  }

  .selected-places {
    position: fixed;
    top: 0;
    right: 0;
    width: 92%;
    height: 100vh;
    z-index: 1000;
    padding: 16px;
    border-radius: 0;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    overflow: hidden;
  }

  .selected-places.mobile-visible {
    transform: translateX(0);
  }

  .selected-places.mobile-hidden {
    transform: translateX(100%);
  }

  .selected-place.place-card.selected {
    max-width: 91%;
    min-width: unset;
    width: 100%;
  }

  
  .bottom-action-button.in-cart {
    background-color: #2c473a;
    max-width: 70%;
    width: calc(100% - 32px);
    margin-bottom: 20px;
    padding: 8px 16px;
    font-size: 13px;
  }

  .scroll-area {
    max-height: calc(100vh - 180px);
    padding-bottom: 80px;
  }

  .bottom-action-button.clear-selection,
  .bottom-action-button.copy-route {
    max-width: 100%;
    width: calc(100% - 32px);
    margin: 6px auto;
    padding: 6px 12px;
    font-size: 12px;
  }
}
@media (max-width: 412px) { 
  .place-card{
    width: 320px;
    height: 160px;
  }

  .selected-place.place-card.selected{
    max-width: 320px;
    min-width: 320px;
  }
  .selected-places.mobile-hidden{
    margin-left: 500px;
  }
  .bottom-action-button.in-cart{
    background-color: #2c473a;
  }

}
@media (max-width: 390px) { 
  .place-card{
    width: 300px;
    height: 160px;
  }


  .selected-places.mobile-hidden{
    margin-left: 500px;
  }
  .bottom-action-button.in-cart{
    background-color: #2c473a;
  }
  .place-card.selected{
    max-width: 350px;
  }
  .selected-place.place-card.selected{
    max-width: 300px;
    min-width: 300px;
  }

}

@media (max-width: 375px) { 
  .place-card {
    width: 285px;
    height: 180px;

  }
  
  .selected-places {
    position: fixed;
    top: 0;
    right: 0;
    width: 93%;
    height: 100vh;
    z-index: 1001;
    background: #f6fdf8;
    box-shadow: 0 4px 12px rgba(44, 71, 58, 0.3);
    border-radius: 0;
    padding: 12px;
  }

  .selected-places h2 {
    font-size: 15px;
    margin-bottom: 12px;
  }

  .selected-place.place-card.selected {
    max-width: 92%;
    min-width: unset;
    width: 100%;
    padding: 8px;
    margin-bottom: 8px;
  }

  .selected-place .place-content {
    gap: 4px;
  }

  .selected-place .place-title {
    font-size: 14px;
  }

  .selected-place .location {
    font-size: 12px;
  }

  .selected-place .place-image {
    width: 60px;
    height: 60px;
  }

  .bottom-action-button.in-cart {
    background-color: #2c473a;
    max-width: 100%;
    width: calc(100% - 24px);
    margin: 0 auto;
    padding: 8px 12px;
    font-size: 12px;
    margin-bottom: 12px;
  }

  .bottom-action-button.clear-selection,
  .bottom-action-button.copy-route {
    max-width: 100%;
    width: calc(100% - 24px);
    margin: 4px auto;
    padding: 5px 10px;
    font-size: 11px;
  }

  .scroll-area {
    max-height: calc(100vh - 160px);
    padding-bottom: 70px;
    margin-bottom: 0;
  }
}
@media (max-width: 360px) { 
  .place-card{
    width: 280px;
    height: 160px;
  }

  .bottom-action-button.in-cart{
    background-color: #2c473a;
  }
  .selected-place.place-card.selected {
    max-width: 93%;
    min-width: unset;
    width: 100%;
    padding: 8px;
    margin-bottom: 8px;
  }

}

@media (max-width: 344px) { 
  .place-card{
    width: 250px;
    height: 180px;
    font-size-adjust: 0.4;
  }




  .bottom-action-button.in-cart{
    background-color: #2c473a;
  }

}

@media (max-width: 320px) { 
  .place-card{
    width: 280px;
    height: 200px;
  }

}

.weather-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
  font-size: 14px;
  color: #444;
}

.weather-icon {
  width: 32px;
  height: 32px;
}

.temperature {
  font-weight: 600;
  color: #2c473a;
}

.weather-description {
  text-transform: capitalize;
}

.scroll-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  padding-right: 8px;
  padding-top: 8px;
  scrollbar-width: thin;
  scrollbar-color: #2c473a #f6fdf8;
  height: 350px;
  min-height: 0;
  overflow-y: auto;
}

.scroll-area::-webkit-scrollbar {
  width: 6px;
}

.scroll-area::-webkit-scrollbar-track {
  background: #f6fdf8;
  border-radius: 3px;
}

.scroll-area::-webkit-scrollbar-thumb {
  background-color: #2c473a;
  border-radius: 3px;
}

@media (max-width: 480px) {
  .scroll-area {
    max-height: calc(100vh - 160px);
    padding-bottom: 350px;
    min-height: 0;
  }
}

</style>