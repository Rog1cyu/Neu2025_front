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

        <el-menu-item index="/admin/meal">
          <el-icon><KnifeFork /></el-icon>
          <span>膳食管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <!-- 固定显示assets/logo.png作为头像 -->
              <el-avatar :size="36" :src="logoImage" />
              <span class="user-name">欢迎回来，尊敬的管理员{{ userName }}</span>
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
  User, Avatar, UserFilled, House,
  FirstAidKit, Document, List, SwitchButton, KnifeFork
} from '@element-plus/icons-vue'
import logoImage from '@/assets/man.png' // 直接导入logo图片
import api from '@/services/api' // 引入API服务

export default {
  components: {
    KnifeFork,
    User, Avatar, UserFilled, House,
    FirstAidKit, Document, List, SwitchButton
  },
  setup() {
    const store = useStore()
    const router = useRouter()

    // 用户名使用ref以便更新
    const userName = ref('管理员')
    // 直接使用导入的logo图片
    const logo = ref(logoImage)

    const activeMenu = computed(() => router.currentRoute.value.path)

    const routeNames = {
      '/admin/beds': '床位管理',
      '/admin/staff': '员工管理',
      '/admin/clients': '客户管理',
      '/admin/care-records': '护理记录管理',
      '/admin/care-items': '护理项目管理',
      '/admin/meal': '膳食管理'
    }

    const currentRouteName = computed(() => {
      return routeNames[router.currentRoute.value.path] || '管理面板'
    })

    // 获取当前登录管理员信息
    const fetchCurrentAdminInfo = async () => {
      try {
        // 从store获取当前登录管理员ID
        const currentAdminId = store.state.staffId

        if (!currentAdminId) {
          console.warn('未找到当前登录管理员ID')
          return
        }

        console.log('当前管理员ID:', currentAdminId, typeof currentAdminId)

        // 尝试获取当前用户信息（可能登录时已存储）
        if (store.state.user?.name) {
          userName.value = store.state.user.name
          return
        }

        // 使用API获取员工列表（管理员也在员工表中）
        const response = await api.getStaff({
          page: 1,
          size: 1000
        })

        console.log('员工列表API响应:', response)

        if (response.data && response.data.records && Array.isArray(response.data.records)) {
          // 输出所有员工ID和名称以便调试
          console.log('所有员工记录:', response.data.records.map(r => ({
            id: r.id,
            staffId: r.staffId,
            userId: r.userId,
            name: r.name
          })))

          // 尝试多种可能的ID字段和类型
          const admin = response.data.records.find(s =>
              (s.id == currentAdminId) ||
              (s.staffId == currentAdminId) ||
              (s.userId == currentAdminId) ||
              (s.id === String(currentAdminId)) ||
              (s.staffId === String(currentAdminId)) ||
              (s.userId === String(currentAdminId))
          )

          if (admin) {
            console.log('找到匹配的管理员:', admin)
            // 尝试多种可能的名称字段
            userName.value = admin.name || admin.username || admin.realName || admin.nickname || '管理员'
          } else {
            console.warn(`未找到ID为 ${currentAdminId} 的管理员`)
            console.warn('可用的员工ID:', response.data.records.map(r => r.id || r.staffId || r.userId))
          }
        } else {
          console.warn('返回的员工列表数据格式不正确')
        }
      } catch (error) {
        console.error('获取管理员信息失败', error)
      }
    }

    onMounted(() => {
      fetchCurrentAdminInfo()
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