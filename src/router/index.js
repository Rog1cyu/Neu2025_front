import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'
import NurseDashboard from '@/views/NurseDashboard.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: 'beds', component: () => import('@/components/BedManagement') },
      { path: 'staff', component: () => import('@/components/StaffManagement') },
      { path: 'clients', component: () => import('@/components/ClientManagement') },
      { path: 'care-records', component: () => import('@/components/CareRecordManagement') },
      { path: 'care-items', component: () => import('@/components/CareItemManagement') },
      { path: 'meal', component: () => import('@/components/MealManagement') },
      { path: '', redirect: '/admin/beds' }
    ]
  },
  {
    path: '/nurse',
    name: 'NurseDashboard',
    component: NurseDashboard,
    meta: { requiresAuth: true, role: 'nurse' },
    children: [
      { path: 'clients', component: () => import('@/components/NurseClientInfo') },
      { path: 'care-records', component: () => import('@/components/NurseCareManagement') },
      { path: '', redirect: '/nurse/clients' }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  const userRole = localStorage.getItem('role')

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresAuth && to.meta.role !== userRole) {
    next(from.path)
  } else {
    next()
  }
})

export default router