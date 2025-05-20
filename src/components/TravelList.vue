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
    <div class="selected-places" :class="{ 'mobile-visible': isCartVisible }">
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

    <!-- Кнопка для открытия корзины на мобильных устройствах -->
    <button 
      v-if="selectedPlaces.length > 0" 
      class="mobile-cart-button"
      @click="toggleCart"
    >
      <span class="cart-icon">Маршрут</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, onBeforeUnmount } from 'vue';

// Состояния
const selectedPlaces = ref([]);
const places = ref([]);
const currentPage = ref(1);
const isLoading = ref(false);
const noMoreData = ref(false);

const mapRef = inject('mapRef');
const isCartVisible = ref(false);
const isMobile = ref(false);

let scrollContainer = null;

// Загрузка данных по страницам
async function loadLandmark() {
  if (isLoading.value || noMoreData.value) return;

  isLoading.value = true;

  const domain = import.meta.env.VITE_BACKEND_URL;
  const url = `${domain}/api/landmark?page=${currentPage.value}`;

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

    landmarks.forEach(element => {
      places.value.push({
        id: element.id,
        title: element.name,
        location: element.address,
        time: element.time ?? '',
        price: element.price ?? '',
        rating: element.rating ?? '',
        reviews: element.reviews ?? '',
        image: `${domain}/images/${element.image_path}`
      });
    });

    currentPage.value++;
  } catch (error) {
    console.error("Ошибка при загрузке достопримечательностей:", error);
  } finally {
    isLoading.value = false;
  }
}

// Обработчик скролла по контейнеру .main-layout
function handleScroll() {
  if (!scrollContainer) return;

  const scrollTop = scrollContainer.scrollTop;
  const scrollHeight = scrollContainer.scrollHeight;
  const clientHeight = scrollContainer.clientHeight;

  const buffer = 200; // px до конца контейнера для срабатывания

  if (scrollTop + clientHeight + buffer >= scrollHeight) {
    loadLandmark();
  }
}

// Адаптация под мобильные устройства и отображение корзины
function checkScreenSize() {
  isMobile.value = window.innerWidth <= 1100;
  isCartVisible.value = !isMobile.value;
}

function toggleCart() {
  isCartVisible.value = !isCartVisible.value;
}

function toggleSelection(id) {
  const index = selectedPlaces.value.indexOf(id);
  if (index === -1) {
    selectedPlaces.value.push(id);
  } else {
    selectedPlaces.value.splice(index, 1);
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

// Иконки
import infoIcon from '@/assets/icons/info.png'
import starIcon from '@/assets/icons/star.png'
import reviewIcon from '@/assets/icons/review.png'

// Жизненный цикл компонента
onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);

  scrollContainer = document.querySelector('.main-layout');
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleScroll);
  }

  loadLandmark();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScreenSize);

  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', handleScroll);
  }
});
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
  padding: 14px 28px;
  border: none;
  border-radius: 28px;
  font-size: 17px;
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
  flex: 1;
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

/* Стили для мобильной версии */
.mobile-cart-button {
  display: none;
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #2c473a;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}
@media (max-width: 1150px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 1100px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 10px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 770px;
    margin-top: 70px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
  .place-card.selected {
    min-width: 1070px;
  }
  .mobile-cart-button {
    margin-bottom: 5px;
  }
}
@media (max-width: 1100px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 1100px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 10px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 770px;
    margin-top: 70px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
  .place-card.selected {
    min-width: 1070px;
  }
  .mobile-cart-button {
    margin-bottom: 5px;
  }
}
@media (max-width: 1060px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 1020px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 10px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 700px;
    margin-top: 70px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
    
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
  .place-card.selected {
    min-width: 990px;
  }
  .mobile-cart-button {
    margin-bottom: 5px;
  }
}
@media (max-width: 1045px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 1000px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 0px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 1295px;
    margin-top: 70px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
  .place-card.selected {
    min-width: 950px;
  }
  .mobile-cart-button {
    margin-bottom: 5px;
  }
}
@media (max-width: 1030px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 1000px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 0px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 1295px;
    margin-top: 70px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
  .place-card.selected {
    min-width: 950px;
  }
  .mobile-cart-button {
    margin-bottom: 5px;
  }
}
@media (max-width: 1024px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 1000px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 50px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 1295px;
    margin-top: 70px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
  .place-card.selected {
    min-width: 950px;
  }
  .mobile-cart-button {
    margin-bottom: 5px;
  }
}

@media (max-width: 1024px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 1000px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 50px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 1295px;
    margin-top: 70px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
  .place-card.selected {
    min-width: 950px;
  }
  .mobile-cart-button {
    margin-bottom: 5px;
  }
}
@media (max-width: 1100px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 1020px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 30px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 1305px;
    margin-top: 70px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
  .place-card.selected {
    min-width: 840px;
  }
  .mobile-cart-button {
    margin-bottom: 5px;
  }
}
@media (max-width: 1051px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 990px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 0px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 1305px;
    margin-top: 70px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
  .place-card.selected {
    min-width: 840px;
  }
  .mobile-cart-button {
    margin-bottom: 5px;
  }
}
@media (max-width: 1050px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 990px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 50px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 1305px;
    margin-top: 70px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
  .place-card.selected {
    min-width: 840px;
  }
  .mobile-cart-button {
    margin-bottom: 5px;
  }
}
@media (max-width: 1000px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 950px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 50px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 1305px;
    margin-top: 70px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
  .place-card.selected {
    min-width: 840px;
  }
  .mobile-cart-button {
    margin-bottom: 5px;
  }
}
@media (max-width: 980px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 950px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 50px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 1305px;
    margin-top: 70px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
  .place-card.selected {
    min-width: 840px;
  }
  .mobile-cart-button {
    margin-bottom: 5px;
  }
}
@media (max-width: 950px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 910px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 50px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 1305px;
    margin-top: 70px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
  .place-card.selected {
    min-width: 840px;
  }
  .mobile-cart-button {
    margin-bottom: 5px;
  }
}
@media (max-width: 912px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 870px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 50px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 1305px;
    margin-top: 70px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
  .place-card.selected {
    min-width: 840px;
  }
  .mobile-cart-button {
    margin-bottom: 5px;
  }
}
@media (max-width: 900px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 860px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 50px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 1305px;
    margin-top: 70px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
  .place-card.selected {
    min-width: 840px;
  }
  .mobile-cart-button {
    margin-bottom: 5px;
  }
}
@media (max-width: 860px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 830px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 40px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 1220px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
  .place-card.selected {
    min-width: 750px;
  }
}
@media (max-width: 853px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 820px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 40px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 1220px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
  .place-card.selected {
    min-width: 750px;
  }
}
@media (max-width: 830px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 800px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 40px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 1220px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
  .place-card.selected {
    min-width: 750px;
  }
}
@media (max-width: 820px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 790px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 40px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 1120px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
  .place-card.selected {
    min-width: 750px;
  }
}
@media (max-width: 810px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 770px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 40px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 1120px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
  .place-card.selected {
    min-width: 750px;
  }
}
@media (max-width: 768px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 740px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 35px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 870px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
  .place-card.selected {
    min-width: 700px;
  }
}
@media (max-width: 750px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 710px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 35px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 870px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
  .place-card.selected {
    min-width: 700px;
  }
}
@media (max-width: 700px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 660px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 35px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 870px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
  .place-card.selected {
    min-width: 700px;
  }
}
@media (max-width: 650px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 620px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 20px;
  }
  .place-card.selected {
    min-width: 470px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 567px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
}
@media (max-width: 600px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 580px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 20px;
  }
  .place-card.selected {
    min-width: 470px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 567px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
}
@media (max-width: 560px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 530px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 20px;
  }
  .place-card.selected {
    min-width: 470px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 567px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
}
@media (max-width: 540px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 510px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 20px;
  }
  .place-card.selected {
    min-width: 470px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 567px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
}
@media (max-width: 514px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 470px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 20px;
  }
  .place-card.selected {
    min-width: 470px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 567px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
}
@media (max-width: 490px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 460px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 15px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 795px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  .place-card.selected {
    min-width: 270px;
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
}
@media (max-width: 464px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 430px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 15px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 795px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  .place-card.selected {
    min-width: 270px;
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
}


@media (max-width: 444px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 410px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 15px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 795px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  .place-card.selected {
    min-width: 270px;
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
}


@media (max-width: 430px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 390px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 8px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 775px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  .place-card.selected {
    min-width: 270px;
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
}

@media (max-width: 414px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 390px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 8px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 740px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  .place-card.selected {
    min-width: 270px;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
}
@media (max-width: 412px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 390px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 8px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 760px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  .place-card.selected {
    min-width: 270px;
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; 
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 230px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
}
@media (max-width: 390px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 360px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 8px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 690px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; /* Добавлено */
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 226px;
   
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
}

@media (max-width: 375px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 350px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 5px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 510px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  .place-card.selected {
    min-width: 270px;
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; /* Добавлено */
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 210px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
}

@media (max-width: 360px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 334px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 5px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 585px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  .place-card.selected {
    min-width: 270px;
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; /* Добавлено */
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 190px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
}

@media (max-width: 344px) {
  .places {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow: visible;
    max-width: 315px;
  }
  .travel-list-wrapper {
    flex-direction: column;
    gap: 16px;
    margin-left: 5px;
  }
  
  .selected-places {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    min-width: unset;
    max-height: 725px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    padding: 20px;
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
  }
  
  .selected-places.mobile-visible {
    transform: translateX(0);
  }
  .place-card.selected {
    min-width: 270px;
  }
  
  .scroll-area {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 16px; /* Добавлено */
  }
  
  .bottom-action-button.in-cart {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    max-width: 160px;
  }
  
  .mobile-cart-button {
    display: block;
    margin-bottom: 85px;
  }
  
  .places {
    flex: 1;
    padding-bottom: 80px;
    width: 100%;
    margin-left: 0;
  }
}



</style>