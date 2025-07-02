<template>
  <div>
    <div class="page-title">
      <el-icon><User /></el-icon>
      <span>员工管理</span>
    </div>

    <!-- 搜索区域 -->
    <div class="search-form">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="员工状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 200px">
            <el-option label="全部" value=""></el-option>
            <el-option label="工作" value="working"></el-option>
            <el-option label="空闲" value="idle"></el-option>
            <el-option label="停用" value="disabled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="员工姓名">
          <el-input v-model="searchForm.keyword" placeholder="请输入员工姓名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">
            <el-icon><Search /></el-icon>查询
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 列表区域 -->
    <div class="card-container">
      <div class="table-header">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增员工
        </el-button>
      </div>

      <el-table :data="tableData" border class="table-container" v-loading="loading">
        <el-table-column prop="staffId" label="员工ID" width="100" align="center" />
        <el-table-column prop="name" label="姓名" align="center" />
        <el-table-column label="性别" align="center" width="80">
          <template #default="scope">
            {{ scope.row.gender === 'male' ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" align="center" />
        <el-table-column label="角色" align="center">
          <template #default="scope">
            <el-tag :type="roleTagType(scope.row.role)">
              {{ roleText(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)">
              {{ statusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)" :disabled="scope.row.status === 'working'">
              删除
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

    <!-- 对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="登录账号" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="初始密码" prop="password" v-if="!isEdit">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role">
            <el-option label="管理员" value="admin" />
            <el-option label="健康管家" value="nurse" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status" v-if="isEdit">
          <el-select v-model="form.status">
            <el-option label="工作" value="working" />
            <el-option label="空闲" value="idle" />
            <el-option label="停用" value="disabled" />
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

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import api from '@/services/api'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  setup() {
    const tableData = ref([])
    const dialogVisible = ref(false)
    const isEdit = ref(false)
    const formRef = ref(null)
    const loading = ref(false)

    const searchForm = reactive({
      status: '',
      keyword: ''
    })

    const form = reactive({
      staffId: '',
      name: '',
      gender: 'male',
      phone: '',
      username: '',
      password: '',
      role: 'nurse',
      status: 'idle'
    })

    const rules = reactive({
      name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
      gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
      phone: [
        { required: true, message: '请输入联系电话', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
      ],
      username: [{ required: true, message: '请输入登录账号', trigger: 'blur' }],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
      ],
      role: [{ required: true, message: '请选择角色', trigger: 'change' }]
    })

    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0
    })

    const dialogTitle = computed(() => (isEdit.value ? '编辑员工' : '新增员工'))

    const roleText = (role) => ({ admin: '管理员', nurse: '健康管家' }[role] || role)
    const roleTagType = (role) => ({ admin: 'primary', nurse: 'success' }[role] || '')
    const statusText = (status) => ({ working: '工作', idle: '空闲', disabled: '停用' }[status] || status)
    const statusTagType = (status) => ({ working: 'success', idle: 'warning', disabled: 'info' }[status] || '')

    const loadData = async () => {
      loading.value = true
      try {
        const response = await api.getStaff({
          ...searchForm,
          page: pagination.current,
          page_size: pagination.size
        })
        tableData.value = response.data.records || []
        pagination.total = response.data.total || 0
      } catch (e) {
        ElMessage.error('获取员工列表失败')
      } finally {
        loading.value = false
      }
    }

    const handleSizeChange = (size) => {
      pagination.size = size
      pagination.current = 1
      loadData()
    }

    const handleAdd = () => {
      isEdit.value = false
      Object.assign(form, {
        staffId: '',
        name: '',
        gender: 'male',
        phone: '',
        username: '',
        password: '',
        role: 'nurse',
        status: 'idle'
      })
      dialogVisible.value = true
    }

    const handleEdit = (row) => {
      isEdit.value = true
      Object.assign(form, { ...row })
      dialogVisible.value = true
    }

    const handleDelete = (row) => {
      ElMessageBox.confirm('确认删除该员工？', '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(async () => {
        try {
          await api.deleteStaff(row.staffId)
          ElMessage.success('删除成功')
          loadData()
        } catch (e) {
          ElMessage.error('删除失败')
        }
      })
    }

    const submitForm = () => {
      formRef.value.validate(async (valid) => {
        if (valid) {
          try {
            const staffData = {
              name: form.name,
              gender: form.gender,
              phone: form.phone,
              username: form.username,
              role: form.role,
              status: form.status
            }
            if (!isEdit.value) staffData.password = form.password
            if (isEdit.value) {
              await api.updateStaff(form.staffId, staffData)
              ElMessage.success('更新成功')
            } else {
              await api.addStaff(staffData)
              ElMessage.success('新增成功')
            }
            dialogVisible.value = false
            loadData()
          } catch (e) {
            ElMessage.error('提交失败')
          }
        }
      })
    }

    onMounted(() => loadData())

    return {
      tableData,
      dialogVisible,
      isEdit,
      formRef,
      form,
      rules,
      dialogTitle,
      pagination,
      searchForm,
      loading,
      roleText,
      roleTagType,
      statusText,
      statusTagType,
      loadData,
      handleSizeChange,
      handleAdd,
      handleEdit,
      handleDelete,
      submitForm
    }
  }
}
</script>

<style scoped>
.page-title {
  display: flex;
  align-items: center;
  font-size: 20px;
  margin-bottom: 20px;
}
.page-title el-icon {
  margin-right: 8px;
}
.table-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}
</style>
