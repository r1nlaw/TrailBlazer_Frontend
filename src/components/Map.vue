<template>
  <div class="map-container" :style="{ height: mapHeight + 'px'}">
    <img v-if="!isMapVisible" src="@/assets/images/map_placeholder.png" alt="Карта" class="map-image" />
    <div v-show="isMapVisible" id="map" style="height: 400px; width: 100%; z-index: 0;"></div>
    <button class="map-button" @click="toggleMap">
      <img src="@/assets/icons/map-pin.png" alt="Pin" />
      {{ isMapExpanded ? 'Уменьшить карту' : isMapVisible ? 'Увеличить карту' : 'Раскрыть карту' }}
    </button>

    <!-- Модальное окно с анимацией -->
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
let markers = null;
const isMapVisible = ref(true);
const isMapExpanded = ref(false); 
const domain = "localhost:8080";
const geojson = { type: 'FeatureCollection', features: [] };
let map = null; 
const mapHeight = ref(400); 
const routeSourceId = 'route';

const isMapModalOpen = ref(false);

function openMapModal() {
  isMapModalOpen.value = true;

  setTimeout(() => {
    const modalMap = new maplibregl.Map({
      container: 'map-modal',
      style: 'http://localhost:8100/styles/basic-preview2/style.json',
      center: [34.09847, 44.94249],
      zoom: 13
    });

    modalMap.on('load', () => {
      // Копируем geojson из основного источника
      const sourceData = map?.getSource('markers')?._data || geojson;

      modalMap.addSource('markers', {
        type: 'geojson',
        data: sourceData,
        cluster: true,
        clusterMaxZoom: 11,
        clusterRadius: 30
      });

      modalMap.addLayer({
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
            20,
            100,
            30,
            750,
            40
          ]
        }
      });

      modalMap.addLayer({
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

      modalMap.addLayer({
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

      modalMap.on('click', 'clusters', (e) => {
        const features = modalMap.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        if (!features.length) return;
        const clusterId = features[0].properties.cluster_id;
        modalMap.getSource('markers').getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          modalMap.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom
          });
        });
      });

      modalMap.on('click', 'unclustered-point', (e) => {
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
          .addTo(modalMap);
      });

      modalMap.on('mouseenter', 'clusters', () => {
        modalMap.getCanvas().style.cursor = 'pointer';
      });
      modalMap.on('mouseleave', 'clusters', () => {
        modalMap.getCanvas().style.cursor = '';
      });

    });
  }, 300);
}


onMounted(() => {
  map = new maplibregl.Map({
    container: 'map',
    style: 'http://localhost:8100/styles/basic-preview2/style.json',
    center: [34.09847,44.94249 ],
    zoom: 13
  });

  map.on('load', () => {
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
          20,
          100,
          30,
          750,
          40
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
        'text-size': 12
      },
      paint: {
        'text-color': '#ffffff'
      }
    });

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
    map.addSource(routeSourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });
    map.addLayer({
      id: 'route-line',
      type: 'line',
      source: routeSourceId,
      paint: {
        'line-color': '#3b9ddd',
        'line-width': 6
      }
    });

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

    map.on('mouseenter', 'clusters', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
      map.getCanvas().style.cursor = '';
    });
  });

  map.on('moveend', () => {
    loadFacilities();
  });

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
          features: newFeatures 
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
  if (!isMapVisible.value) {
    isMapVisible.value = true;
    mapHeight.value = 400;
    isMapExpanded.value = false;
  } else if (!isMapExpanded.value) {
    // Открываем модалку вместо изменения высоты
    openMapModal();
  } else {
    isMapExpanded.value = false;
    mapHeight.value = 400;
  }

  if (isMapVisible.value && map) {
    setTimeout(() => {
      map.resize();
    }, 0);
  }
}

async function getLandmarksByIDs(points){
  const url = `http://${domain}/api/getLandmarks`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(points),
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const pointsInfo = await response.json();
    return pointsInfo
  } catch (error) {
    console.error('Fetch error:', error);
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

  let landmarks = await getLandmarksByIDs(points) 
  getRoute(landmarks)
 
}
defineExpose({
  RouteMaker
})
function getRoute(coords) {
    let strCoord = ""
    for (let i = 0; i < coords.length; i++) {
      strCoord += `${i===0?"":';'}${coords[i].location.lng},${coords[i].location.lat}`
      
    }
    const url = `https://router.project-osrm.org/route/v1/driving/${strCoord}?overview=full&geometries=geojson`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const route = data.routes[0].geometry;
        map.getSource(routeSourceId).setData({
          type: 'Feature',
          geometry: route
        });
      })
      .catch(err => console.error('Ошибка маршрута:', err));
  }
  
</script>
<style scoped>
.map-container {
  position: relative;
  width: 100%;
  max-width: 100%;
  min-height: 240px;
  border-radius: 24px;
  overflow: hidden;
  transition: height 0.3s ease; /* Плавный переход высоты */
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
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
  transform: scale(1);
  transition: transform 0.3s ease, opacity 0.3s ease;
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
/* Transition classes */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

</style>