<template>
  <div>
    <div class="page-title">
      <el-icon><UserFilled /></el-icon>
      <span>客户信息</span>
    </div>

    <div class="search-form">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="客户姓名">
          <el-input
              v-model="searchForm.keyword"
              placeholder="请输入客户姓名"
              clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="loadData">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="card-container">
      <el-table :data="tableData" border class="table-container" v-loading="loading">
        <el-table-column prop="name" label="姓名" align="center" />
        <el-table-column label="性别" align="center" width="80">
          <template #default="scope">
            {{ scope.row.gender === 'male' ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column label="年龄" align="center" width="80">
          <template #default="scope">
            {{ calculateAge(scope.row.birthDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" align="center" width="150" />
        <el-table-column label="床位" align="center" width="120">
          <template #default="scope">
            {{ getBedDisplay(scope.row.bedId) }}
          </template>
        </el-table-column>
        <el-table-column label="健康管家" align="center">
          <template #default="scope">
            {{ getStaffDisplay(scope.row.nurseId) }}
          </template>
        </el-table-column>
        <el-table-column label="护理记录" align="center" width="120">
          <template #default="scope">
            <el-button
                type="primary"
                size="small"
                @click="viewCareRecords(scope.row)"
            >
              查看记录
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="loadData"
          @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

export default {
  setup() {
    const router = useRouter()
    const store = useStore()
    console.log('store', store)
    const tableData = ref([])
    const loading = ref(false)

    // 数据缓存
    const staffList = ref([])      // 所有护工列表
    const bedList = ref([])        // 所有床位列表

    const searchForm = reactive({
      keyword: ''
    })

    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0
    })

    // 加载所有基础数据
    const loadAllBaseData = async () => {
      try {
        // 加载护工数据
        const staffRes = await api.getStaff({ page: 1, size: 1000 })
        staffList.value = staffRes.data.records || []

        // 加载床位数据
        const bedRes = await api.getBeds({ page: 1, size: 1000 })
        bedList.value = bedRes.data.records || []
      } catch (error) {
        ElMessage.error('加载基础数据失败')
      }
    }

    // 根据ID获取护工显示名称
    const getStaffDisplay = (staffId) => {
      if (!staffId) return '-'
      const staff = staffList.value.find(s => s.staffId === staffId)
      return staff ? staff.name : `未知 (${staffId})`
    }

    // 根据ID获取床位显示名称
    const getBedDisplay = (bedId) => {
      if (!bedId) return '未分配'
      const bed = bedList.value.find(b => b.bedId === bedId)
      return bed ? bed.bedCode : `未知 (${bedId})`
    }

    const calculateAge = (birthDate) => {
      if (!birthDate) return ''
      const today = new Date()
      const birth = new Date(birthDate)
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }

      return age
    }

    const loadData = async () => {
      loading.value = true
      try {
        // 获取当前护工ID（从Vuex中）
        const currentNurseId = store.state.staffId

        const params = {
          keyword: searchForm.keyword,
          page: pagination.current,
          size: pagination.size,
          nurseId: currentNurseId // 只查询当前护工负责的客户
        }

        const response = await api.getClients(params)

        // 适配后端返回的数据结构
        tableData.value = response.data.records || []
        pagination.total = response.data.total || 0
      } catch (error) {
        console.error('获取客户数据失败', error)
        ElMessage.error('获取客户数据失败')
      } finally {
        loading.value = false
      }
    }

    const handleSizeChange = (size) => {
      pagination.size = size
      pagination.current = 1
      loadData()
    }

    const viewCareRecords = (client) => {
      router.push({
        path: '/nurse/care-records',
        query: { clientId: client.clientId }
      })
    }

    onMounted(async () => {
      await loadAllBaseData()
      loadData()
    })

    return {
      tableData,
      searchForm,
      pagination,
      loading,
      loadData,
      handleSizeChange,
      viewCareRecords,
      calculateAge,
      getStaffDisplay,
      getBedDisplay
    }
  }
}
</script>