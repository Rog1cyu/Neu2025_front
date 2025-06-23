<template>
  <nurse-layout>
    <router-view />
  </nurse-layout>
</template>

<script>
import NurseLayout from '@/components/layout/NurseLayout.vue'

export default {
  name: 'NurseDashboard',
  components: {
    NurseLayout
  }
}
</script>