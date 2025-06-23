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
      <el-table :data="tableData" border class="table-container">
        <el-table-column prop="name" label="姓名" align="center" />
        <el-table-column prop="gender" label="性别" align="center" width="80">
          <template #default="scope">
            {{ scope.row.gender === 'male' ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" align="center" width="80" />
        <el-table-column prop="phone" label="联系电话" align="center" width="150" />
        <el-table-column prop="bed_code" label="床位号" align="center" width="120" />
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

export default {
  setup() {
    const router = useRouter()
    const tableData = ref([])

    const searchForm = reactive({
      keyword: ''
    })

    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0
    })

    const loadData = async () => {
      try {
        const params = {
          ...searchForm,
          page: pagination.current,
          page_size: pagination.size
        }

        // 在实际应用中，这里应该调用获取护工负责的客户列表API
        const response = await api.getClients(params)
        tableData.value = response.data.list.map(client => {
          return {
            ...client,
            age: calculateAge(client.birth_date)
          }
        })
        pagination.total = response.data.total
      } catch (error) {
        console.error('获取客户数据失败', error)
      }
    }

    const calculateAge = (birthDate) => {
      const today = new Date()
      const birth = new Date(birthDate)
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }

      return age
    }

    const handleSizeChange = (size) => {
      pagination.size = size
      pagination.current = 1
      loadData()
    }

    const viewCareRecords = (client) => {
      router.push({
        path: '/nurse/care-records',
        query: { clientId: client.client_id }
      })
    }

    onMounted(() => {
      loadData()
    })

    return {
      tableData,
      searchForm,
      pagination,
      loadData,
      handleSizeChange,
      viewCareRecords
    }
  }
}
</script>