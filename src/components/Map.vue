<template>
  <div class="map-container">
    <img src="@/assets/images/map_placeholder.png" alt="Карта" class="map-image" />
    <button class="map-button">
      <img src="@/assets/icons/map-pin.png" alt="Pin" />
      Раскрыть карту
    </button>
  </div>
</template>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  max-width: 100%;
  height: 400px;
  min-height: 240px; /* Не позволяет схлопываться */
  border-radius: 24px;
  overflow: hidden;
}

.map-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.map-button {
  position: absolute;
  bottom: 16px;
  right: 16px;
  padding: 8px 16px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  box-shadow: none;
}

.map-button img {
  width: 16px;
  height: 16px;
}

/* Адаптация для маленьких экранов */
@media (max-width: 768px) {
  .map-container {
    height: 300px;
  }

  .map-button {
    padding: 6px 12px;
    font-size: 11px;
  }
}
</style>
