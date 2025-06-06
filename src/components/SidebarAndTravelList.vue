<template>
  <Sidebar :selectedCategories="selectedCategories" @toggle-category="toggleCategory" />
  <TravelList :selectedCategories="selectedCategories" />
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import TravelList from './TravelList.vue'

const selectedCategories = ref([])

function toggleCategory(category) {
  if (selectedCategories.value.includes(category)) {
    selectedCategories.value = selectedCategories.value.filter(c => c !== category)
  } else {
    selectedCategories.value = [...selectedCategories.value, category]
  }
}
</script>
