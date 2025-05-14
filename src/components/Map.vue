<template>
  <div class="map-container">
    <img v-if="!isMapVisible" src="@/assets/images/map_placeholder.png" alt="Карта" class="map-image" />
    <div v-show="isMapVisible" id="map" style="height: 400px; width: 100%; z-index: 0;"></div>
    <button class="map-button" @click="toggleMap">
      <img src="@/assets/icons/map-pin.png" alt="Pin" />
      {{ isMapVisible ? 'Скрыть карту' : 'Раскрыть карту' }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Состояние для переключения карты
const isMapVisible = ref(true);
const domain = "localhost:8080";
const geojson = { type: 'FeatureCollection', features: [] };
let map = null; // Объявляем map как null, чтобы инициализировать позже

// Инициализация карты после рендеринга шаблона
onMounted(() => {
  map = new maplibregl.Map({
    container: 'map',
    style: 'http://localhost:8100/styles/basic-preview2/style.json',
    center: [34.09847,44.94249 ],
    zoom: 13
  });

  map.on('load', () => {
    // Добавление источника для маркеров
    map.addSource('markers', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 11,
      clusterRadius: 30
    });

    // Слой для кластеров
    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'markers',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6', // до 10 точек
          10,
          '#f1f075', // до 750 точек
          750,
          '#f28cb1' // больше 750
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          100,
          30,
          750,
          40
        ]
      }
    });

    // Слой для количества точек в кластере
    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'markers',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Noto Sans Regular', 'Arial Unicode MS Regular'],
        'text-size': 12
      },
      paint: {
        'text-color': '#ffffff'
      }
    });

    // Слой для отдельных маркеров
    map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'markers',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#029cff',
        'circle-radius': 15,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff'
      }
    });

    // Клик по кластерам для приближения
    map.on('click', 'clusters', (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      if (!features.length) return;
      const clusterId = features[0].properties.cluster_id;
      map.getSource('markers').getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom
        });
      });
    });

    // Клик по отдельным маркерам для всплывающего окна
    map.on('click', 'unclustered-point', (e) => {
      if (!e.features || !e.features[0]) return;
      const coordinates = e.features[0].geometry.coordinates.slice();
      const { name, address, url } = e.features[0].properties;
      const isMobile = window.innerWidth <= 768;

      new maplibregl.Popup({
        closeOnClick: true,
        maxWidth: isMobile ? '200px' : '300px',
        className: isMobile ? 'mobile-popup' : ''
      })
        .setLngLat(coordinates)
        .setHTML(`
          <div style="font-family: Arial, sans-serif; line-height: 1.4;">
            <h5 style="margin: 0; color: #587ea3;">
              <a href="${url ? `http://${domain}${url}` : '#'}" 
                 style="text-decoration: none; color: inherit;" 
                 target="_blank">
                ${name || 'Без названия'}
              </a>
            </h5>
            <p style="margin: 5px 0 0; font-size: ${isMobile ? '12px' : '14px'}; color: #6c757d;">
              ${address || 'Адрес не указан'}
            </p>
          </div>
        `)
        .addTo(map);
    });

    // Изменение курсора при наведении на кластеры
    map.on('mouseenter', 'clusters', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
      map.getCanvas().style.cursor = '';
    });
  });

  // Загрузка маркеров при перемещении карты
  map.on('moveend', () => {
    loadFacilities();
  });

  // Обработка ошибок карты
  map.on('error', (e) => {
    console.error('Map error:', e);
  });
});

async function loadFacilities() {
  const url = `http://${domain}/api/facilities`;
  const data = map.getBounds().toArray();
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({sw:{lng:data[0][0] , lat: data[0][1]}, ne: {lng: data[1][0], lat: data[1][1]}}),
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const facilities = await response.json();
    if (facilities && facilities.length > 0) {
      const newFeatures = facilities.map(facility => ({
        type: 'Feature',
        properties: {
          id: facility.id,
          name: facility.name,
          address: facility.Address,
          url: facility.url || ''
        },
        geometry: {
          type: 'Point',
          coordinates: [facility.location.lng,facility.location.lat ]
        }
      }));

      const source = map.getSource('markers');
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: newFeatures // Заменяем данные, чтобы избежать дублирования
        });
      } else {
        console.error("Source 'markers' does not exist.");
      }
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

function toggleMap() {
  isMapVisible.value = !isMapVisible.value;
  if (isMapVisible.value && map) {
    map.resize(); // Перерисовка карты при отображении
  }
}
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  max-width: 100%;
  height: 400px;
  min-height: 240px;
  border-radius: 24px;
  overflow: hidden;
}

.map-image {
  position: absolute;
  top: 0;
  left: 0;
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