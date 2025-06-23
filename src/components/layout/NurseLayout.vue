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
              <el-avatar :size="36" :src="userAvatar" />
              <span class="user-name">护工，{{ userName }}</span>
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
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import {
  UserFilled, Document, SwitchButton
} from '@element-plus/icons-vue'

export default {
  components: {
    UserFilled, Document, SwitchButton
  },
  setup() {
    const store = useStore()
    const router = useRouter()

    const userName = computed(() => store.state.user?.name || '护工')
    const userAvatar = computed(() => store.state.user?.avatar || '')
    const activeMenu = computed(() => router.currentRoute.value.path)

    const routeNames = {
      '/nurse/clients': '客户信息',
      '/nurse/care-records': '护理记录'
    }

    const currentRouteName = computed(() => {
      return routeNames[router.currentRoute.value.path] || '工作面板'
    })

    const logout = () => {
      store.commit('logout')
      router.push('/login')
    }

    return {
      userName,
      userAvatar,
      activeMenu,
      currentRouteName,
      logout
    }
  }
}
</script>

<style scoped>
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>