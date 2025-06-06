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

  // Инициализация из URL
  const urlCategories = route.query.category;
  if (Array.isArray(urlCategories)) {
    selectedCategories.value = urlCategories;
  } else if (typeof urlCategories === 'string') {
    selectedCategories.value = [urlCategories];
  }

  await loadLandmark();
});

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
      image: `${domain}/images/${element.image_path}`
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

function handleSelection() {
  if (mapRef?.value?.RouteMaker) {
    mapRef.value.RouteMaker(selectedPlaces.value);
    console.log('Выбранные ID:', selectedPlaces.value);
  } else {
    console.error('Map component or RouteMaker not available');
  }
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

.selected-place,
.selected-places .place-card {
  height: auto !important;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  white-space: normal;
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.selected-places{
  max-height:25%;
  animation: fadeInUp 0.4s ease both;
}
.selected-places.mobile-hidden {
  transition: transform 0.4s ease;
  transform: translateX(100%);
}
.scroll-area {
  max-height: 450px; 
  overflow-y: auto;
}
.selected-places.mobile-visible {
  transition: transform 0.4s ease;
  transform: translateX(0);
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
  gap: 16px;
  background: #f6fdf8;
  border-radius: 16px;
  padding: 26px;
  border: 1px solid #2c473a54;
}

.scroll-area {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.selected-places h2 {
  margin-bottom: 8px;
  font-size: 18px;
  color: #2c473a;
}

.mobile-cart-button {
  display: none;
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
  z-index: 1000;
  cursor: pointer;
}
@media (max-width: 2880px){
  .travel-list-wrapper {
    width: 100%;
    gap: 16px; 
  }
  .selected-places {
    min-width: 30%;
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
  .selected-places {
    min-width: 30%;
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
  .selected-places {
    min-width: 30%;
  }
  .selected-place.place-card.selected{
    max-width: 95%;
  }
}

@media (max-width: 1024px) {
  .mobile-cart-button {
    display: block;
  }
  .travel-list-wrapper {
    flex-direction: column;
    width: 100%;
    gap: 16px; 
  }
  
  .places {
    flex: none;
    width: 100%;
  }
  .place-card{
    height: 120px;
  }
  


  .selected-places {
    min-width: unset;
    border-radius: 12px;
    padding: 16px;
    position: fixed;
    bottom: 120px;
    right: 50px;
    background: #f6fdf8;
    box-shadow: 0 4px 12px rgba(44, 71, 58, 0.3);
    width: 300px;
    overflow-y: auto;
    transition: opacity 0.3s ease, visibility 0.3s ease;
    z-index: 1001;
  }
}


@media (max-width: 1024px) { 
  .place-card{
    width: 920px;
  }
  .selected-places{
    margin-left: 0px;
    min-width: 1000px;
    min-height: 1230px;
    left: 0;
    z-index: 20000;
  }
  .selected-places.mobile-hidden{
    margin-left: 1500px;
  }

  .bottom-action-button.in-cart{
    background-color: #2c473a;
  }
  .place-card.selected{
    max-width: 920px;
  }

}
@media (max-width: 912px) { 
  .place-card{
    width: 820px;
  }
  .selected-places{
    margin-left: 0px;
    min-width: 880px;
    min-height: 1230px;
    left: 0;
    z-index: 20000;
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
  .selected-places{
    margin-left: 0px;
    min-width: 820px;
    min-height: 570px;
    left: 0;
    z-index: 20000;
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
  .selected-places{
    margin-left: 0px;
    min-width: 785px;
    min-height: 1030px;
    left: 0;
    z-index: 20000;
  }
  .selected-places.mobile-hidden{
    margin-left: 1000px;
  }

  .bottom-action-button.in-cart{
    background-color: #2c473a;
  }
  .place-card.selected{
    max-width: 720px;
  }

}

@media (max-width: 768px) { 
  .place-card{
    width: 690px;
  }
  .selected-places{
    margin-left: 0px;
    min-width: 745px;
    min-height: 877px;
    left: 0;
    z-index: 20000;
  }
  .selected-places.mobile-hidden{
    margin-left: 1000px;
  }

  .bottom-action-button.in-cart{
    background-color: #2c473a;
  }
  .place-card.selected{
    max-width: 700px;
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
  .selected-places{
    margin-left: 0px;
    min-width: 525px;
    min-height: 573px;
    left: 0;
    z-index: 20000;
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
    width: 355px;
  }
  .selected-places{
    margin-left: 0px;
    min-width: 400px;
    min-height: 493px;
    left: 0;
    z-index: 20000;
  }
  .selected-place.place-card.selected{
    max-width: 370px;
    min-width: 370px;
  }
  .selected-places.mobile-hidden{
    margin-left: 500px;
  }
  .bottom-action-button.in-cart{
    background-color: #2c473a;
  }
  .place-card.selected{
    max-width: 370px;
  }
}

@media (max-width: 414px) { 
  .place-card{
    width: 335px;
    height: 130px;
  }
  .selected-places{
    margin-left: 0px;
    min-width: 380px;
    min-height: 553px;
    left: 0;
    z-index: 20000;
  }

  .selected-places.mobile-hidden{
    margin-left: 500px;
  }
  .selected-place.place-card.selected{
    max-width: 350px;
    min-width: 350px;
  }
  
  .bottom-action-button.in-cart{
    background-color: #2c473a;
  }
  .place-card.selected{
    max-width: 350px;
  }
}
@media (max-width: 412px) { 
  .place-card{
    width: 335px;
    height: 130px;
  }
  .selected-places{
    margin-left: 0px;
    min-width: 380px;
    min-height: 573px;
    left: 0;
    z-index: 20000;
  }
  .selected-place.place-card.selected{
    max-width: 350px;
    min-width: 350px;
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
}
@media (max-width: 390px) { 
  .place-card{
    width: 315px;
    height: 130px;
  }
  .selected-places{
    margin-left: 0px;
    min-width: 380px;
    min-height: 550px;
    left: 0;
    z-index: 20000;
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
    max-width: 330px;
    min-width: 330px;
  }

}

@media (max-width: 375px) { 
  .place-card{
    width: 305px;
    height: 130px;
  }
  .selected-places{
    margin-left: 0px;
    min-width: 350px;
    min-height: 523px;
    left: 0;
    z-index: 20000;
  }
  .selected-place.place-card.selected{
    max-width: 320px;
  }
  .bottom-action-button.in-cart{
    background-color: #2c473a;
  }
  .place-card.selected{
    max-width: 320px;
  }
}
@media (max-width: 360px) { 
  .place-card{
    width: 280px;
    height: 150px;
  }
  .selected-places{
    margin-left: 0px;
    min-width: 350px;
    left: 0;
  }
  .selected-places{
    margin-left: 0px;
    min-width: 350px;
    min-height: 500px;
    left: 0;
    z-index: 20000;
  }
  .bottom-action-button.in-cart{
    background-color: #2c473a;
  }
  .selected-place.place-card.selected{
    max-width: 310px;
    min-width: 310px;
  }
  .place-card.selected{
    max-width: 320px;
  }
}

@media (max-width: 344px) { 
  .place-card{
    width: 275px;
    height: 150px;
  }
  .selected-place.place-card.selected{
    max-width: 290px;
    min-width: 290px;
  }
  .selected-places{
    margin-left: 0px;
    min-width: 330px;
    min-height: 520px;
    left: 0;
    z-index: 20000;
  }

  .bottom-action-button.in-cart{
    background-color: #2c473a;
  }
  .place-card.selected{
    max-width: 320px;
  }
}

@media (max-width: 320px) { 
  .place-card{
    width: 280px;
    height: 200px;
  }
  .selected-places{
    margin-left: 0px;
    min-width: 350px;
    left: 0;
  }
}

</style>