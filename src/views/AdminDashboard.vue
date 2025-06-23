<template>
  <admin-layout>
    <router-view />
  </admin-layout>
</template>

<script>
import AdminLayout from '@/components/layout/AdminLayout.vue'

export default {
  name: 'AdminDashboard',
  components: {
    AdminLayout
  }
}
</script>