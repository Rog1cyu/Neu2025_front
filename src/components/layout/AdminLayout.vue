<template>
  <el-container style="height: 100vh;">
    <el-aside width="220px">
      <div class="logo-container">
        <img src="@/assets/logo.png" alt="颐养中心" class="logo">
        <h2>颐养中心管理</h2>
      </div>
      <el-menu
          :default-active="activeMenu"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          unique-opened
      >

        <!-- 床位管理 -->
        <el-menu-item index="/admin/beds">
          <el-icon><House /></el-icon>
          <span>床位管理</span>
        </el-menu-item>


        <!-- 人员管理 -->
        <el-sub-menu index="1">
          <template #title>
            <el-icon><User /></el-icon>
            <span>人员管理</span>
          </template>
          <el-menu-item index="/admin/staff">
            <el-icon><Avatar /></el-icon>
            <span>员工管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/clients">
            <el-icon><UserFilled /></el-icon>
            <span>客户管理</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 护理管理 -->
        <el-sub-menu index="3">
          <template #title>
            <el-icon><FirstAidKit /></el-icon>
            <span>护理管理</span>
          </template>
          <el-menu-item index="/admin/care-records">
            <el-icon><Document /></el-icon>
            <span>记录管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/care-items">
            <el-icon><List /></el-icon>
            <span>项目管理</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="36" :src="userAvatar" />
              <span class="user-name">管理员，{{ userName }}</span>
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
  User, Avatar, UserFilled, House,
  FirstAidKit, Document, List, SwitchButton
} from '@element-plus/icons-vue'

export default {
  components: {
    User, Avatar, UserFilled, House,
    FirstAidKit, Document, List, SwitchButton
  },
  setup() {
    const store = useStore()
    const router = useRouter()

    const userName = computed(() => store.state.user?.name || '管理员')
    const userAvatar = computed(() => store.state.user?.avatar || '')
    const activeMenu = computed(() => router.currentRoute.value.path)

    const routeNames = {
      '/admin/beds': '床位管理',
      '/admin/staff': '员工管理',
      '/admin/clients': '客户管理',
      '/admin/care-records': '护理记录管理',
      '/admin/care-items': '护理项目管理'
    }

    const currentRouteName = computed(() => {
      return routeNames[router.currentRoute.value.path] || '管理面板'
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