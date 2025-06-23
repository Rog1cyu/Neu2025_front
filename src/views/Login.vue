<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <img src="@/assets/logo.png" alt="颐养中心" class="logo">
        <h1>东软颐养中心管理系统</h1>
      </div>

      <el-form ref="loginForm" :model="form" :rules="rules" class="login-form">
        <el-form-item prop="username">
          <el-input
              v-model="form.username"
              placeholder="请输入账号"
              prefix-icon="User"
              size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              size="large"
              show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              size="large"
              @click="submitForm"
              :loading="loading"
              class="login-btn"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <p>© 2025 东软睿道教育信息技术有限公司</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

export default {
  setup() {
    const store = useStore()
    const router = useRouter()
    const loginForm = ref(null)
    const loading = ref(false)

    const form = ref({
      username: '',
      password: ''
    })

    const rules = ref({
      username: [
        { required: true, message: '请输入账号', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
      ]
    })

    const submitForm = () => {
      loginForm.value.validate(valid => {
        if (valid) {
          loading.value = true

          store.dispatch('login', form.value)
              .then(() => {
                const role = localStorage.getItem('role')
                if (role === 'admin') {
                  router.push('/admin')
                } else {
                  router.push('/nurse')
                }
              })
              .catch(error => {
                ElMessage.error(error.message || '登录失败，请检查账号密码')
              })
              .finally(() => {
                loading.value = false
              })
        }
      })
    }

    return {
      form,
      rules,
      loading,
      loginForm,
      submitForm
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #304156 0%, #409EFF 100%);
}

.login-card {
  width: 420px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.login-header {
  padding: 30px 20px;
  text-align: center;
  background-color: #304156;
  color: white;
}

.login-header h1 {
  font-size: 22px;
  font-weight: 500;
  margin-top: 15px;
}

.logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: white;
  padding: 10px;
}

.login-form {
  padding: 30px 40px;
}

.login-btn {
  width: 100%;
  margin-top: 10px;
  font-size: 16px;
  letter-spacing: 2px;
}

.login-footer {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
  border-top: 1px solid #eee;
}
</style>