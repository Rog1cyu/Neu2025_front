<template>
  <div>
    <div class="page-title">
      <el-icon><OfficeBuilding /></el-icon>
      <span>床位管理</span>
      <el-button @click="toggleView" class="toggle-button" size="small" type="info" plain>
        {{ isGridView ? '切换为表格视图' : '切换为可视化视图' }}
      </el-button>
    </div>

    <!-- 可视化方格视图 -->
    <div v-if="isGridView" class="bed-grid">
      <div
          v-for="bed in tableData"
          :key="bed.bedId"
          class="bed-box"
          :class="bedClass(bed.status)"
          @click.left="toggleStatus(bed)"
      >
        <div class="bed-code">{{ bed.bedCode }}</div>
        <div class="bed-status">{{ statusText(bed.status) }}</div>
      </div>
    </div>

    <div class="search-form">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="床位状态" prop="status" v-if="isEdit">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="可用" value="available"></el-option>
            <el-option label="停用" value="disabled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="床位编号">
          <el-input v-model="searchForm.keyword" placeholder="请输入床位编号" clearable />
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
          <el-icon><Plus /></el-icon>新增床位
        </el-button>
      </div>

      <el-table :data="tableData" border class="table-container" v-loading="loading">
        <el-table-column prop="bedCode" label="床位编号" align="center" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="状态" align="center">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)">
              {{ statusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="当前使用者" align="center">
          <template #default="scope">
            {{ scope.row.client_name || '无' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
                size="small"
                type="danger"
                @click="handleDelete(scope.row)"
                :disabled="scope.row.status === 'occupied'"
            >
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

    <!-- 新增/编辑床位对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="床位编号" prop="bedCode">
          <el-input v-model="form.bedCode" placeholder="请输入床位编号" />
        </el-form-item>
        <el-form-item label="床位描述" prop="description">
          <el-input
              v-model="form.description"
              type="textarea"
              :rows="3"
              placeholder="请输入床位描述"
          />
        </el-form-item>
        <el-form-item label="床位状态" prop="status" v-if="isEdit">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="可用" value="available"></el-option>
            <el-option label="停用" value="disabled"></el-option>
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
import { ref, reactive, onMounted, computed} from 'vue'
import api from '@/services/api'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  setup() {
    const tableData = ref([])
    const dialogVisible = ref(false)
    const isEdit = ref(false)
    const formRef = ref(null)
    const loading = ref(false)
    const isGridView = ref(false)

    const toggleView = () => {
      isGridView.value = !isGridView.value
    }

    const bedClass = (status) => {
      return {
        available: 'bed-available',
        occupied: 'bed-occupied',
        disabled: 'bed-disabled'
      }[status] || ''
    }



    const searchForm = reactive({
      status: '',
      keyword: ''
    })

    const form = reactive({
      bedId: '',
      bedCode: '',
      description: '',
      status: 'available'
    })

    const rules = reactive({
      bedCode: [
        { required: true, message: '请输入床位编号', trigger: 'blur' }
      ],
      description: [
        { required: true, message: '请输入床位描述', trigger: 'blur' }
      ]
    })

    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0
    })

    const dialogTitle = computed(() => {
      return isEdit.value ? '编辑床位' : '新增床位'
    })

    const statusText = (status) => {
      const map = {
        available: '可用',
        occupied: '占用',
        disabled: '停用'
      }
      return map[status] || status
    }

    const statusTagType = (status) => {
      const map = {
        available: 'success',
        occupied: 'primary',
        disabled: 'info'
      }
      return map[status] || ''
    }

    // 点击切换状态（仅可用 <=> 停用）
    const toggleStatus = async (bed) => {
      if (bed.status === 'occupied') {
        ElMessage.warning('当前床位已被占用，不能更改状态')
        return
      }

      const newStatus = bed.status === 'available' ? 'disabled' : 'available'
      try {
        await api.updateBed(bed.bedId, {
          description: bed.description,
          status: newStatus
        })
        ElMessage.success(`状态已修改为 ${statusText(newStatus)}`)
        loadData()
      } catch (e) {
        ElMessage.error('修改失败')
      }
    }

    const loadData = async () => {
      loading.value = true
      try {
        const params = {
          ...searchForm,
          page: pagination.current,
          page_size: pagination.size
        }
        const response = await api.getBeds(params)
        tableData.value = response.data.records   // ✅ 修正字段名
        pagination.total = response.data.total    // ✅ 修正字段名
      } catch (error) {
        ElMessage.error('获取床位数据失败')
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
        bedId: '',
        bedCode: '',
        description: '',
        status: 'available'
      })
      dialogVisible.value = true
    }

    const handleEdit = (row) => {
      isEdit.value = true
      Object.assign(form, { ...row })
      dialogVisible.value = true
    }

    const handleDelete = (row) => {
      ElMessageBox.confirm('确定要删除该床位吗？', '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(async () => {
        try {
          await api.deleteBed(row.bedId)
          ElMessage.success('删除成功')
          loadData()
        } catch (error) {
          ElMessage.error('删除失败')
        }
      })
    }

    const submitForm = () => {
      formRef.value.validate(async valid => {
        if (!valid) return
        try {
          if (isEdit.value) {
            await api.updateBed(form.bedId, form)
            ElMessage.success('更新成功')
          } else {
            const newForm = { ...form }
            delete newForm.bedId  // ❗必须移除主键字段
            console.log('新增床位数据：', newForm)
            await api.addBed(newForm)
            ElMessage.success('新增成功')
          }
          dialogVisible.value = false
          loadData()
        } catch (e) {
          console.error('新增床位失败：', e)
          ElMessage.error('新增床位失败')
        }
      })
    }

    onMounted(() => {
      loadData()
    })

    return {
      tableData,
      searchForm,
      pagination,
      form,
      rules,
      formRef,
      dialogVisible,
      isEdit,
      dialogTitle,
      statusText,
      statusTagType,
      loading,
      loadData,
      handleSizeChange,
      handleAdd,
      handleEdit,
      handleDelete,
      submitForm,
      toggleStatus,
      bedClass,
      toggleView,
      isGridView
    }
  }
}
</script>

<style scoped>
.table-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.bed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.bed-box {
  padding: 10px;
  border-radius: 8px;
  color: white;
  text-align: center;
  cursor: pointer;
  font-size: 14px;
  user-select: none;
  transition: transform 0.2s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.bed-box:hover {
  transform: scale(1.05);
}

.bed-available {
  background-color: #67c23a;
}
.bed-occupied {
  background-color: #f56c6c;
  cursor: not-allowed;
}
.bed-disabled {
  background-color: #909399;
}

.toggle-button {
  margin-left: auto;
}
.bed-code {
  font-weight: bold;
}
.bed-status {
  margin-top: 4px;
  font-size: 12px;
}
</style>