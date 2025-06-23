<template>
  <div>
    <div class="page-title">
      <el-icon><Avatar /></el-icon>
      <span>客户管理</span>
    </div>

    <div class="search-form">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="客户姓名">
          <el-input v-model="searchForm.keyword" placeholder="请输入客户姓名" clearable />
        </el-form-item>
        <el-form-item label="床位号">
          <el-select v-model="searchForm.bedId" placeholder="请选择床位" filterable clearable style="width: 180px">
            <el-option
                v-for="bed in availableBeds"
                :key="bed.bedId"
                :label="`${bed.bedCode} (${bed.description})`"
                :value="bed.bedId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="健康管家">
          <el-select v-model="searchForm.nurseId" placeholder="请选择健康管家" filterable clearable style="width: 180px">
            <el-option
                v-for="nurse in availableNurses"
                :key="nurse.staffId"
                :label="nurse.name"
                :value="nurse.staffId"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">
            <el-icon><Search /></el-icon>查询
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="card-container">
      <div class="table-header">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增客户
        </el-button>
      </div>

      <el-table :data="tableData" border class="table-container" v-loading="loading">
        <el-table-column prop="name" label="姓名" align="center" />
        <el-table-column label="性别" align="center" width="80">
          <template #default="scope">
            {{ scope.row.gender === 'male' ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column prop="birthDate" label="出生日期" align="center" width="120" />
        <el-table-column prop="phone" label="联系电话" align="center" width="150" />
        <el-table-column prop="bedCode" label="床位号" align="center" width="120" />
        <el-table-column prop="nurseName" label="健康管家" align="center" />
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出生日期" prop="birthDate">
          <el-date-picker v-model="form.birthDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="分配床位" prop="bedId">
          <el-select v-model="form.bedId" placeholder="请选择床位" filterable>
            <el-option
                v-for="bed in availableBeds"
                :key="bed.bedId"
                :label="`${bed.bedCode} (${bed.description})`"
                :value="bed.bedId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="健康管家" prop="nurseId">
          <el-select v-model="form.nurseId" placeholder="请选择健康管家" filterable>
            <el-option
                v-for="nurse in availableNurses"
                :key="nurse.staffId"
                :label="nurse.name"
                :value="nurse.staffId"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import api from '@/services/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const tableData = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const loading = ref(false)
const availableBeds = ref([])
const availableNurses = ref([])

const searchForm = reactive({ keyword: '', bedId: null, nurseId: null })
const form = reactive({ name: '', gender: 'male', birthDate: '', phone: '', bedId: null, nurseId: null })

const rules = reactive({
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  birthDate: [{ required: true, message: '请选择出生日期', trigger: 'change' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
})

const pagination = reactive({ current: 1, size: 10, total: 0 })
const dialogTitle = computed(() => (isEdit.value ? '编辑客户' : '新增客户'))

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

const loadAvailableBeds = async () => {
  try {
    const res = await api.getBeds({ status: 'available' })
    availableBeds.value = res.data?.records || []
  } catch {
    ElMessage.error('获取可用床位失败')
    availableBeds.value = []
  }
}

const loadAvailableNurses = async () => {
  try {
    const res = await api.getStaff({ status: 'idle' })
    availableNurses.value = res.data?.records || []
  } catch {
    ElMessage.error('获取可用健康管家失败')
    availableNurses.value = []
  }
}

const loadData = async () => {
  loading.value = true
  try {
    await Promise.all([loadAvailableBeds(), loadAvailableNurses()])
    const res = await api.getClients({ ...searchForm, page: pagination.current, page_size: pagination.size })
    const list = res.data?.records || []
    tableData.value = list.map(client => {
      const bed = availableBeds.value.find(b => b.bedId === client.bedId)
      const nurse = availableNurses.value.find(n => n.staffId === client.nurseId)
      return {
        clientId: client.clientId,
        name: client.name,
        gender: client.gender,
        birthDate: formatDate(client.birthDate),
        phone: client.phone,
        bedId: client.bedId,
        nurseId: client.nurseId,
        bedCode: bed ? bed.bedCode : '—',
        nurseName: nurse ? nurse.name : '—'
      }
    })
    pagination.total = res.data?.total || list.length
  } catch {
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

const handleAdd = async () => {
  isEdit.value = false
  Object.assign(form, {
    name: '',
    gender: 'male',
    birthDate: '',
    phone: '',
    bedId: null,
    nurseId: null
  })
  delete form.clientId // ✅ 彻底移除已有主键
  await Promise.all([loadAvailableBeds(), loadAvailableNurses()])
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  isEdit.value = true
  Object.assign(form, {
    clientId: row.clientId,
    name: row.name,
    gender: row.gender,
    birthDate: row.birthDate,
    phone: row.phone,
    bedId: row.bedId !== null ? Number(row.bedId) : null,
    nurseId: row.nurseId !== null ? Number(row.nurseId) : null
  })
  await Promise.all([loadAvailableBeds(), loadAvailableNurses()])
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该客户吗？', '提示', {
    type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消'
  }).then(async () => {
    try {
      await api.deleteClient(row.clientId)
      ElMessage.success('删除成功')
      loadData()
    } catch {
      ElMessage.error('删除失败')
    }
  })
}

const submitForm = () => {
  formRef.value.validate(async valid => {
    if (!valid) return
    try {
      if (isEdit.value) {
        if (!form.clientId) {
          ElMessage.error('编辑失败：clientId 缺失')
          return
        }
        await api.updateClient(form.clientId, form)
        ElMessage.success('更新成功')
      } else {
        await api.addClient(form)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      loadData()
    } catch {
      ElMessage.error('操作失败')
    }
  })
}

onMounted(() => loadData())
</script>

<style scoped>
.table-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}
</style>
