<template>
  <div class="map-container" :style="{ height: mapHeight + 'px' }">
    <img v-if="!isMapVisible" src="@/assets/images/map_placeholder.png" alt="Карта" class="map-image" :class="{ blurred: isMapModalOpen }" />
    <div v-show="isMapVisible" id="map" style="height: 100%; width: 100%; z-index: 0;"></div>
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

const map_style = import.meta.env.VITE_MAP_STYLE_URL;
const isMapVisible = ref(true);
const isMapExpanded = ref(false);
const domain = import.meta.env.VITE_BACKEND_URL;
const geojson = { type: 'FeatureCollection', features: [] };
let map = null;
const mapHeight = ref(400);
const routeSourceId = 'route';
const isMapModalOpen = ref(false);
const modalMap = ref(null); // Храним модальную карту

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
      ctx.beginPath();
      const radius = Math.min(canvas.width, canvas.height) / 2;
      ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(blob => {
        resolve(URL.createObjectURL(blob));
      }, 'image/webp', 0.7);
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

// Оптимизированная загрузка данных для карты
const loadFacilities = async (targetMap) => {
  try {
    const bounds = targetMap.getBounds().toArray();
    const response = await fetch(`${domain}/api/facilities`, {
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
    const markerSize = isMobile ? 150 : 100;

    const newFeatures = await Promise.all(facilities.map(async facility => {
      const imageUrl = facility.image_path
        ? `${import.meta.env.VITE_BACKEND_URL}/images/${facility.image_path}?width=${markerSize}`
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

    const source = targetMap.getSource('markers');
    if (!source) return;

    source.setData({ type: 'FeatureCollection', features: newFeatures });

    if (targetMap.getLayer('unclustered-point')) {
      targetMap.removeLayer('unclustered-point');
    }

    targetMap.addLayer({
      id: 'unclustered-point',
      type: 'symbol',
      source: 'markers',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': ['coalesce', ['get', 'markerImage'], 'default-marker'],
        'icon-size': isMobile ? 0.6 : 0.6,
        'icon-allow-overlap': true,
        'icon-anchor': 'bottom',
        'icon-padding': 10
      },
      paint: {
        'icon-opacity': 1
      }
    });

    const uniqueImages = [...new Set(newFeatures
      .filter(f => f.properties.markerImage)
      .map(f => f.properties.markerImage))];

    await Promise.all(uniqueImages.map(async url => {
      try {
        if (!targetMap.hasImage(url)) {
          const optimizedUrl = await loadOptimizedImage(url, markerSize);
          if (optimizedUrl) {
            const img = new Image();
            img.src = optimizedUrl;
            await img.decode();
            targetMap.addImage(url, img);
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

// Показ popup
const showPopup = (feature, targetMap) => {
  const { geometry, properties } = feature;
  const { name, address, url, image } = properties;

  const popupHTML = `
    <div class="popup-card">
      ${image ? `<img src="${image}" alt="${name}" class="popup-card-image" style="max-width: 180px; max-height: 200px; object-fit: contain;" />` : ''}
      <div class="popup-card-body">
        <h3 class="popup-card-title">${name || 'Без названия'}</h3>
        ${address ? `<p class="popup-card-address">${address}</p>` : ''}
        ${url ? `<a href="${url}" class="popup-card-link" target="_blank">Подробнее</a>` : ''}
      </div>
    </div>
  `;
  new maplibregl.Popup({
    closeOnClick: true,
    className: 'custom-popup',
    maxWidth: '300px'
  })
    .setLngLat(geometry.coordinates)
    .setHTML(popupHTML)
    .addTo(targetMap);
};

// Инициализация основной карты
onMounted(async () => {
  map = new maplibregl.Map({
    container: 'map',
    style: map_style,
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
          35,
          100,
          20,
          250,
          25
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
        'text-size': 10
      },
      paint: {
        'text-color': '#ffffff'
      }
    });

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
        'line-width': 4
      }
    });

    await loadFacilities(map);

    map.on('click', 'unclustered-point', (e) => {
      if (!e.features?.[0]) return;
      showPopup(e.features[0], map);
    });

    map.on('mouseenter', ['clusters', 'unclustered-point'], () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', ['clusters', 'unclustered-point'], () => {
      map.getCanvas().style.cursor = '';
    });
  });

  map.on('moveend', () => loadFacilities(map));
  map.on('error', console.error);
});

// Открытие модального окна
const openMapModal = () => {
  isMapModalOpen.value = true;
  setTimeout(() => initModalMap(), 300);
};

// Инициализация модальной карты
const initModalMap = () => {
  modalMap.value = new maplibregl.Map({
    container: 'map-modal',
    style: map_style,
    center: map.getCenter(),
    zoom: map.getZoom()
  });

  modalMap.value.on('load', async () => {
    modalMap.value.addSource('markers', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 11,
      clusterRadius: 30
    });

    modalMap.value.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'markers',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 10, '#f1f075', 750, '#f28cb1'],
        'circle-radius': ['step', ['get', 'point_count'], 15, 100, 20, 750, 25]
      }
    });

    modalMap.value.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'markers',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Noto Sans Regular', 'Arial Unicode MS Regular'],
        'text-size': 10
      },
      paint: {
        'text-color': '#ffffff'
      }
    });

    const routeData = map.getSource(routeSourceId)?._data;
    if (routeData) {
      modalMap.value.addSource(routeSourceId, {
        type: 'geojson',
        data: routeData
      });

      modalMap.value.addLayer({
        id: 'route-line',
        type: 'line',
        source: routeSourceId,
        paint: {
          'line-color': '#3b9ddd',
          'line-width': 4
        }
      });
    }

    await loadFacilities(modalMap.value);

    modalMap.value.on('click', 'unclustered-point', (e) => {
      if (e.features?.[0]) showPopup(e.features[0], modalMap.value);
    });

    modalMap.value.on('mouseenter', ['clusters', 'unclustered-point'], () => {
      modalMap.value.getCanvas().style.cursor = 'pointer';
    });

    modalMap.value.on('mouseleave', ['clusters', 'unclustered-point'], () => {
      modalMap.value.getCanvas().style.cursor = '';
    });
  });

  modalMap.value.on('moveend', () => loadFacilities(modalMap.value));
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
  const url = `${domain}/api/getLandmarks`;
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
    strCoord += `${i===0?"":";"}${coords[i].location.lng},${coords[i].location.lat}`;
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
        if (modalMap.value && modalMap.value.getSource(routeSourceId)) {
          modalMap.value.getSource(routeSourceId).setData({
            type: 'Feature',
            geometry: route
          });
        }
      }
    })
    .catch(err => console.error('Ошибка маршрута:', err));
}

defineExpose({
  RouteMaker
});
</script>

<style scoped>
#map {
  position: relative;
}
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

:deep(.custom-popup) {
  width: 200px !important;
  height: 200px !important;
  padding: 0 !important;
  margin: 0 !important;
  background: none !important;
  box-shadow: none !important;
  border: none !important;
}

:deep(.popup-container) {
  width: 80%;
  height: 80%;
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
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 4px;
}

:deep(.popup-address) {
  font-size: 12px;
  text-align: center;
  color: #666;
}

:deep(.maplibregl-popup-tip) {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 200px;
  padding: 8px;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.custom-popup .popup-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 200px;
  padding: 8px;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.custom-popup .popup-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 8px;
}

.custom-popup .popup-title {
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 4px;
}

.custom-popup .popup-address {
  font-size: 12px;
  text-align: center;
  color: #666;
}
@media (max-width: 1700px) {
  .map-container {
    position: relative;
    width: 100%;
    margin-top: -30px;
    min-height: 400px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}

@media (max-width: 1150px) {
  .map-container {
    position: relative;
    width: 99%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}
@media (max-width: 1060px) {
  .map-container {
    position: relative;
    width: 96%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}
@media (max-width: 1042px) {
  .map-container {
    position: relative;
    width: 93%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}
@media (max-width: 1030px) {
  .map-container {
    position: relative;
    width: 90%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}

@media (max-width: 1026px) {
  .map-container {
    position: relative;
    width: 93%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}


@media (max-width: 1024px) {
  .map-container {
    position: relative;
    width: 99%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}
@media (max-width: 1020px) {
  .map-container {
    position: relative;
    width: 98%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}
@media (max-width: 1000px) {
  .map-container {
    position: relative;
    width: 95%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}
@media (max-width: 980px) {
  .map-container {
    position: relative;
    width: 95%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}
@media (max-width: 950px) {
  .map-container {
    position: relative;
    width: 91%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}

@media (max-width: 912px) {
  .map-container {
    position: relative;
    width: 87%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}
@media (max-width: 900px) {
  .map-container {
    position: relative;
    width: 86%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}
@media (max-width: 870px) {
  .map-container {
    position: relative;
    width: 83%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}

@media (max-width: 860px) {
  .map-container {
    position: relative;
    width: 83%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}



@media (max-width: 853px) {
  .map-container {
    position: relative;
    width: 82%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}

@media (max-width: 820px) {
  .map-container {
    position: relative;
    width: 79%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}
@media (max-width: 810px) {
  .map-container {
    position: relative;
    width: 77%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}


@media (max-width: 768px) {
  .map-container {
    position: relative;
    width: 73%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}
@media (max-width: 750px) {
  .map-container {
    position: relative;
    width: 71%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}

@media (max-width: 700px) {
  .map-container {
    position: relative;
    width: 67%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}
@media (max-width: 650px) {
  .map-container {
    position: relative;
    width: 61%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}
@media (max-width: 600px) {
  .map-container {
    position: relative;
    width: 57%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}
@media (max-width: 560px) {
  .map-container {
    position: relative;
    width: 53%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}

@media (max-width: 540px) {
  .map-container {
    position: relative;
    width: 51%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}
@media (max-width: 514px) {
  .map-container {
    position: relative;
    width: 48%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}
@media (max-width: 464px) {
  .map-container {
    position: relative;
    width: 43%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}
@media (max-width: 444px) {
  .map-container {
    position: relative;
    width: 41%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}

@media (max-width: 430px) {
  .map-container {
    position: relative;
    width: 35%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}
@media (max-width: 425px) {
  .map-container {
    position: relative;
    width: 39%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}


@media (max-width: 414px) {
  .map-container {
    position: relative;
    width: 38%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}

@media (max-width: 412px) {
  .map-container {
    position: relative;
    width: 35%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}

@media (max-width: 390px) {
  .map-container {
    position: relative;
    width: 35%;
    margin-top: -30px;
    min-height: 300px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}

@media (max-width: 375px) {
  .map-container {
    position: relative;
    width: 29%;
    margin-top: -10px;
    min-height: 200px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}

@media (max-width: 360px) {
  .map-container {
    position: relative;
    width: 27%;
    margin-top: -30px;
    min-height: 200px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}

@media (max-width: 344px) {
  .map-container {
    position: relative;
    width: 25%;
    margin-top: -30px;
    min-height: 200px;
    border-radius: 24px;
    overflow: hidden;
    transition: height 0.3s ease;
  }
}
</style>