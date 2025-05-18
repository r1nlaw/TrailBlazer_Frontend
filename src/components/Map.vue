<template>
  <div class="map-container" :style="{ height: mapHeight + 'px' }">
    <img v-if="!isMapVisible" src="@/assets/images/map_placeholder.png" alt="Карта" class="map-image" :class="{ blurred: isMapModalOpen }" />
    <div v-show="isMapVisible" id="map" style="height: 400px; width: 100%; z-index: 0;"></div>
    <button class="map-button" @click="toggleMap">
      <img src="@/assets/icons/map-pin.png" alt="Pin" />
      {{ isMapExpanded ? 'Уменьшить карту' : isMapVisible ? 'Увеличить карту' : 'Раскрыть карту' }}
    </button>

    <transition name="modal-fade">
      <div v-if="isMapModalOpen" class="modal-overlay" @click.self="isMapModalOpen = false">
        <div class="modal-content">
          <button class="modal-close" @click="isMapModalOpen = false">✕</button>
          <div id="map-modal" style="height: 100%; width: 100%"></div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const isMapVisible = ref(true);
const isMapExpanded = ref(false);
const domain = "localhost:8080";
const geojson = { type: 'FeatureCollection', features: [] };
let map = null;
const mapHeight = ref(400);
const routeSourceId = 'route';
const isMapModalOpen = ref(false);

// Оптимизированная загрузка изображения с ресайзом
const loadOptimizedImage = async (url, targetWidth) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = targetWidth / img.width;
      canvas.width = targetWidth;
      canvas.height = img.height * ratio;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(blob => {
        resolve(URL.createObjectURL(blob));
      }, 'image/webp', 0.7);
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

// Основная функция инициализации карты
onMounted(async () => {
  map = new maplibregl.Map({
    container: 'map',
    style: 'http://localhost:8100/styles/basic-preview2/style.json',
    center: [34.09847, 44.94249],
    zoom: 13
  });

  map.on('load', async () => {
    map.addSource('markers', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 11,
      clusterRadius: 30
    });

    // Слои кластеров (остаются без изменений)
    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'markers',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6',
          10,
          '#f1f075',
          750,
          '#f28cb1'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          25,  // Уменьшенные размеры
          100, 20,
          250, 25
        ]
      }
    });

    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'markers',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Noto Sans Regular', 'Arial Unicode MS Regular'],
        'text-size': 10 // Уменьшенный размер текста
        
      },
      paint: {
        'text-color': '#ffffff'
      }
    });

    // Слой маршрута
    map.addSource(routeSourceId, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });
    
    map.addLayer({
      id: 'route-line',
      type: 'line',
      source: routeSourceId,
      paint: {
        'line-color': '#3b9ddd',
        'line-width': 4 // Более тонкая линия
      }
    });

    await loadFacilities();

    // Обработчики событий
    map.on('click', 'unclustered-point', (e) => {
      if (!e.features?.[0]) return;
      showPopup(e.features[0]);
    });

    map.on('mouseenter', ['clusters', 'unclustered-point'], () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    
    map.on('mouseleave', ['clusters', 'unclustered-point'], () => {
      map.getCanvas().style.cursor = '';
    });
  });

  map.on('moveend', loadFacilities);
  map.on('error', console.error);
});

// Оптимизированная функция показа popup 50x50
const showPopup = (feature) => {
  const { geometry, properties } = feature;
  const { name, address, url, image } = properties;
  
  new maplibregl.Popup({
    closeOnClick: true,
    className: 'custom-popup',
    maxWidth: 'none',
    anchor: 'bottom'
  })
    .setLngLat(geometry.coordinates)
    .setHTML(`
      <div class="popup-container">
        ${image ? `
          <img src="${image}" alt="${name}" class="popup-image" />
        ` : `
          <div class="popup-text">
            <div class="popup-title">${name || 'Без названия'}</div>
            <div class="popup-address">${address || ''}</div>
          </div>
        `}
      </div>
    `)
    .addTo(map);
};

// Оптимизированная загрузка данных
const loadFacilities = async () => {
  try {
    const bounds = map.getBounds().toArray();
    const response = await fetch(`http://${domain}/api/facilities`, {
      method: 'POST',
      body: JSON.stringify({
        sw: { lng: bounds[0][0], lat: bounds[0][1] }, 
        ne: { lng: bounds[1][0], lat: bounds[1][1] }
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    
    const facilities = await response.json();
    if (!facilities?.length) return;

    const isMobile = window.innerWidth <= 768;
    const markerSize = isMobile ? 150 : 100; // Размеры для разных устройств

    const newFeatures = await Promise.all(facilities.map(async facility => {
      const imageUrl = facility.image_path 
        ? `http://localhost:8080/images/${facility.image_path}?width=${markerSize}`
        : null;

      return {
        type: 'Feature',
        properties: {
          id: facility.id,
          name: facility.name,
          address: facility.address,
          url: facility.url || '',
          image: imageUrl,
          markerImage: imageUrl
        },
        geometry: {
          type: 'Point',
          coordinates: [facility.location.lng, facility.location.lat]
        }
      };
    }));

    const source = map.getSource('markers');
    if (!source) return;

    source.setData({ type: 'FeatureCollection', features: newFeatures });

    if (map.getLayer('unclustered-point')) {
      map.removeLayer('unclustered-point');
    }

    // Добавляем слой с оптимизированными размерами
    map.addLayer({
      id: 'unclustered-point',
      type: 'symbol',
      source: 'markers',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': ['coalesce', ['get', 'markerImage'], 'default-marker'],
        'icon-size': isMobile ? 0.5 : 0.6, // Уменьшенный размер
        'icon-allow-overlap': true,
        'icon-anchor': 'bottom',
        'icon-padding': 10

      },
      paint: {
        'icon-opacity': 1,
      }
      
    });
    

    // Загрузка и кэширование изображений
    const uniqueImages = [...new Set(newFeatures
      .filter(f => f.properties.markerImage)
      .map(f => f.properties.markerImage))];

    await Promise.all(uniqueImages.map(async url => {
      try {
        if (!map.hasImage(url)) {
          const optimizedUrl = await loadOptimizedImage(url, markerSize);
          if (optimizedUrl) {
            const img = new Image();
            img.src = optimizedUrl;
            await img.decode();
            map.addImage(url, img);
          }
        }
      } catch (e) {
        console.warn(`Error loading image ${url}`, e);
      }
    }));

  } catch (error) {
    console.error('Error loading facilities:', error);
  }
};

// Функции для модального окна (аналогично оптимизированы)
const openMapModal = () => {
  isMapModalOpen.value = true;
  setTimeout(initModalMap, 300);
};

const initModalMap = () => {
  const modalMap = new maplibregl.Map({
    container: 'map-modal',
    style: 'http://localhost:8100/styles/basic-preview2/style.json',
    center: map.getCenter(),
    zoom: map.getZoom()    
  });

  modalMap.on('load', () => {
    const sourceData = map.getSource('markers')?._data || geojson;
    modalMap.addSource('markers', { type: 'geojson', data: sourceData, cluster: true });

    // Оптимизированные слои для модального окна
    modalMap.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'markers',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 10, '#f1f075', 750, '#f28cb1'],
        'circle-radius': ['step', ['get', 'point_count'], 15, 100, 20, 750, 25]
      }
    });

    modalMap.addLayer({
      id: 'unclustered-point',
      type: 'symbol',
      source: 'markers',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': ['coalesce', ['get', 'markerImage'], 'default-marker'],
        'icon-size': 0.4,
        'icon-allow-overlap': true
      }
    });

    modalMap.on('click', 'unclustered-point', (e) => {
      if (e.features?.[0]) showModalPopup(e.features[0], modalMap);
    });
  });
};

const showModalPopup = (feature, modalMap) => {
  const { geometry, properties } = feature;
  
  new maplibregl.Popup({
    closeOnClick: true,
    className: 'custom-popup',
    maxWidth: 'none'
  })
    .setLngLat(geometry.coordinates)
    .setHTML(`
      <div class="popup-container">
        <img src="${properties.image}" alt="${properties.name}" class="popup-image" />
      </div>
    `)
    .addTo(modalMap);
};

// Управление картой
const toggleMap = () => {
  if (!isMapVisible.value) {
    isMapVisible.value = true;
    isMapExpanded.value = false;
  } else if (!isMapExpanded.value) {
    openMapModal();
  } else {
    isMapExpanded.value = false;
  }
  mapHeight.value = isMapExpanded.value ? 600 : 400;
  
  if (isMapVisible.value && map) {
    setTimeout(() => map.resize(), 0);
  }
};

// Функции для работы с маршрутами
async function getLandmarksByIDs(points) {
  const url = `http://${domain}/api/getLandmarks`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(points),
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

async function RouteMaker(points) {
  if (map.getSource(routeSourceId)) {
    map.getSource(routeSourceId).setData({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: []
      }
    });
  }

  const landmarks = await getLandmarksByIDs(points);
  if (landmarks) getRoute(landmarks);
}

function getRoute(coords) {
  let strCoord = "";
  for (let i = 0; i < coords.length; i++) {
    strCoord += `${i===0?"":';'}${coords[i].location.lng},${coords[i].location.lat}`;
  }
  
  const url = `https://router.project-osrm.org/route/v1/driving/${strCoord}?overview=full&geometries=geojson`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.routes && data.routes[0]) {
        const route = data.routes[0].geometry;
        map.getSource(routeSourceId).setData({
          type: 'Feature',
          geometry: route
        });
      }
    })
    .catch(err => console.error('Ошибка маршрута:', err));
}

defineExpose({
  RouteMaker
});
</script>


<style scoped>
.blurred {
  filter: blur(8px);
  transition: filter 0.3s ease;
}

.map-container {
  position: relative;
  width: 100%;
  margin-top: 0;
  min-height: 300px;
  border-radius: 24px;
  overflow: hidden;
  transition: height 0.3s ease;
}

.map-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50px;
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
  
}

.map-button img {
  width: 16px;
  height: 16px;
}

@media (max-width: 768px) {
  .map-container {
    height: 300px;
  }
  .map-button {
    padding: 6px 12px;
    font-size: 11px;
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1500;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 90vw;
  max-height: 90vh;
  width: 90vw;
  height: 90vh;
  overflow: hidden;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #333;
  z-index: 1001;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Стили для popup */
:deep(.custom-popup) {
  width: 50px !important;
  height: 50px !important;
  padding: 0 !important;
  margin: 0 !important;
  background: none !important;
  box-shadow: none !important;
  border: none !important;
}

:deep(.popup-container) {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.popup-image) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

:deep(.popup-text) {
  width: 100%;
  padding: 2px;
  font-size: 10px;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.popup-title) {
  font-weight: bold;
  color: #587ea3;
  white-space: nowrap;
}

:deep(.popup-address) {
  color: #6c757d;
  font-size: 8px;
  white-space: nowrap;
}

:deep(.maplibregl-popup-tip) {
  display: none !important;
}
</style>