<template>
  <el-container style="height: 100vh;">
    <el-aside width="220px">
      <div class="logo-container">
        <img src="@/assets/logo.png" alt="颐养中心" class="logo">
        <h2>护工工作台</h2>
      </div>
      <el-menu
          :default-active="activeMenu"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
      >
        <el-menu-item index="/nurse/clients">
          <el-icon><UserFilled /></el-icon>
          <span>客户信息</span>
        </el-menu-item>
        <el-menu-item index="/nurse/care-records">
          <el-icon><Document /></el-icon>
          <span>护理记录</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="36" :src="logoImage" />
              <span class="user-name">欢迎回来，{{ userName }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main>
        <div class="breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentRouteName }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import {
  UserFilled, Document, SwitchButton
} from '@element-plus/icons-vue'
import logoImage from '@/assets/man.png'
import api from '@/services/api'

export default {
  components: {
    UserFilled, Document, SwitchButton
  },
  setup() {
    const store = useStore()
    const router = useRouter()

    const userName = ref('护工')
    const logo = ref(logoImage)

    const activeMenu = computed(() => router.currentRoute.value.path)

    const routeNames = {
      '/nurse/clients': '客户信息',
      '/nurse/care-records': '护理记录'
    }

    const currentRouteName = computed(() => {
      return routeNames[router.currentRoute.value.path] || '工作面板'
    })

    // 获取当前登录护工信息
    const fetchCurrentNurseInfo = async () => {
      try {
        // 从store获取当前登录护工ID
        const currentNurseId = store.state.staffId

        if (!currentNurseId) {
          console.warn('未找到当前登录护工ID')
          return
        }

        console.log('当前护工ID:', currentNurseId, typeof currentNurseId)

        // 尝试获取当前用户信息（可能登录时已存储）
        if (store.state.user?.name) {
          userName.value = store.state.user.name
          return
        }

        // 使用API获取护工列表
        const response = await api.getStaff({
          page: 1,
          size: 1000
        })

        console.log('护工列表API响应:', response)

        if (response.data && response.data.records && Array.isArray(response.data.records)) {
          // 输出所有护工ID和名称以便调试
          console.log('所有护工记录:', response.data.records.map(r => ({
            id: r.id,
            staffId: r.staffId,
            userId: r.userId,
            name: r.name
          })))

          // 匹配ID
          const nurse = response.data.records.find(s =>
              (s.staffId == currentNurseId)
          )

          if (nurse) {
            console.log('找到匹配的护工:', nurse)
            userName.value = nurse.name || '护工'
          } else {
            console.warn(`未找到ID为 ${currentNurseId} 的护工`)
            console.warn('可用的护工ID:', response.data.records.map(r => r.id || r.staffId || r.userId))
          }
        } else {
          console.warn('返回的护工列表数据格式不正确')
        }
      } catch (error) {
        console.error('获取护工信息失败', error)
      }
    }

    onMounted(() => {
      fetchCurrentNurseInfo()
    })

    const logout = () => {
      store.commit('logout')
      router.push('/login')
    }

    return {
      userName,
      logoImage: logo,
      activeMenu,
      currentRouteName,
      logout
    }
  }
}
</script>

<style scoped>
/* 原有的样式保持不变 */
.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  background-color: #2b2f3a;
  color: white;
  padding: 10px;
}

.logo-container h2 {
  font-size: 18px;
  margin-left: 10px;
}

.logo {
  width: 36px;
  height: 36px;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-name {
  margin-left: 10px;
  font-size: 16px;
}

.breadcrumb {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}


.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>