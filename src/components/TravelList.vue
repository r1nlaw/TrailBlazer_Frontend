<template>
  <div class="travel-list-wrapper">
    <div class="places">
      <div
        v-for="place in places"
        :key="place.id"
        class="place-card"
        :class="{ selected: selectedPlaces.includes(place.id) }"
        @click="toggleSelection(place.id)"
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

    <div v-for="item in news" :key="item.id" class="news-card">
      <h3 v-html="item.title" />
      <p v-html="item.content"></p>
    </div>
  </div>
  <button
      v-if="selectedPlaces.length > 0"
      class="bottom-action-button"
      @click="handleSelection"
    >
      Построить маршрут.
  </button>

</template>


<script setup>
import { ref } from 'vue'

const selectedPlaces = ref([])

function toggleSelection(id) {
  const index = selectedPlaces.value.indexOf(id)
  if (index === -1) {
    selectedPlaces.value.push(id)
  } else {
    selectedPlaces.value.splice(index, 1)
  }
}
function handleSelection() {
  console.log('Выбранные ID:', selectedPlaces.value)
  alert(`Вы выбрали ${selectedPlaces.value.length} место(а): ${selectedPlaces.value.join(', ')}`)
}



import infoIcon from '@/assets/icons/info.png'
import starIcon from '@/assets/icons/star.png'
import reviewIcon from '@/assets/icons/review.png'

import place1 from '@/assets/images/place1.png'
import place2 from '@/assets/images/place2.png'
import place3 from '@/assets/images/place3.png'

const places = [
  {
    id: 1,
    title: 'Ласточкино гнездо',
    image: place1,
    location: 'г. Ялта',
    time: 'Ежедневно, с 10:00 до 19:00',
    price: '200₽',
    rating: 4.9,
    reviews: 384,
  },
  {
    id: 2,
    title: 'Генуэзская крепость',
    image: place2,
    location: 'г. Судак',
    time: 'Ежедневно, с 10:00 до 19:00',
    price: '200₽',
    rating: 4.9,
    reviews: 384,
  },
  {
    id: 3,
    title: 'Воронцовский дворец',
    image: place3,
    location: 'г. Ялта',
    time: 'Ежедневно, с 10:00 до 19:00',
    price: '200₽',
    rating: 4.9,
    reviews: 384,
  },
    {
    id: 4,
    title: 'Воронцовский дворец',
    image: place3,
    location: 'г. Ялта',
    time: 'Ежедневно, с 10:00 до 19:00',
    price: '200₽',
    rating: 4.9,
    reviews: 384,
  },
  {
    id: 5,
    title: 'Генуэзская крепость',
    image: place2,
    location: 'г. Судак',
    time: 'Ежедневно, с 10:00 до 19:00',
    price: '200₽',
    rating: 4.9,
    reviews: 384,
  },
   {
    id: 6,
    title: 'Ласточкино гнездо',
    image: place1,
    location: 'г. Ялта',
    time: 'Ежедневно, с 10:00 до 19:00',
    price: '200₽',
    rating: 4.9,
    reviews: 384,
  },
   {
    id: 7,
    title: 'Генуэзская крепость',
    image: place2,
    location: 'г. Судак',
    time: 'Ежедневно, с 10:00 до 19:00',
    price: '200₽',
    rating: 4.9,
    reviews: 384,
  },
     {
    id: 8,
    title: 'Генуэзская крепость',
    image: place2,
    location: 'г. Судак',
    time: 'Ежедневно, с 10:00 до 19:00',
    price: '200₽',
    rating: 4.9,
    reviews: 384,
  },
    {
    id: 9,
    title: 'Воронцовский дворец',
    image: place3,
    location: 'г. Ялта',
    time: 'Ежедневно, с 10:00 до 19:00',
    price: '200₽',
    rating: 4.9,
    reviews: 384,
  },
    {
    id: 10,
    title: 'Воронцовский дворец',
    image: place3,
    location: 'г. Ялта',
    time: 'Ежедневно, с 10:00 до 19:00',
    price: '200₽',
    rating: 4.9,
    reviews: 384,
  },
]

const news = [
  {
    id: 1,
    title: 'Власти планируют масштабную реконструкцию<br />Генуэзской крепости в Судаке',
    content: `
      <p>Судак, 11 мая — Власти Республики Крым объявили о начале подготовки к масштабной реконструкции

    `,
  },
]
</script>

<style scoped>
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
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #2c473a;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  transition: opacity 0.3s ease;
}


</style>