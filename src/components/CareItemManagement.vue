<template>
  <div>
    <div class="page-title">
      <el-icon><List /></el-icon>
      <span>护理项目管理</span>
    </div>

    <div class="search-form">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="项目状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 200px">
            <el-option label="全部" value=""></el-option>
            <el-option label="启用" value="active"></el-option>
            <el-option label="停用" value="inactive"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目名称">
          <el-input v-model="searchForm.keyword" placeholder="请输入项目名称" clearable />
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
          <el-icon><Plus /></el-icon>新增项目
        </el-button>
      </div>

      <el-table :data="tableData" border class="table-container" v-loading="loading">
        <el-table-column prop="itemId" label="项目ID" align="center" width="100" />
        <el-table-column prop="name" label="项目名称" />
        <el-table-column label="状态" align="center" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
              {{ scope.row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="项目描述" />
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button
                size="small"
                type="danger"
                @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === 'active' ? '停用' : '启用' }}
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

    <!-- 新增/编辑项目对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="启用" value="active"></el-option>
            <el-option label="停用" value="inactive"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input
              v-model="form.description"
              type="textarea"
              :rows="4"
              placeholder="请输入项目描述"
          />
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

    const searchForm = reactive({
      status: '',
      keyword: ''
    })

    const form = reactive({
      itemId: '',
      name: '',
      status: 'active',
      description: ''
    })

    const rules = reactive({
      name: [
        { required: true, message: '请输入项目名称', trigger: 'blur' }
      ],
      status: [
        { required: true, message: '请选择状态', trigger: 'change' }
      ]
    })

    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0
    })

    const dialogTitle = computed(() => {
      return isEdit.value ? '编辑项目' : '新增项目'
    })

    const loadData = async () => {
      loading.value = true
      try {
        // 调整参数名以匹配后端
        const params = {
          status: searchForm.status,
          keyword: searchForm.keyword,
          page: pagination.current,
          size: pagination.size // 后端使用 size 而不是 page_size
        }

        const response = await api.getCareItems(params)

        // 适配后端返回的数据结构
        tableData.value = response.data.records
        pagination.total = response.data.total
      } catch (error) {
        ElMessage.error('获取项目数据失败')
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
        itemId: '',
        name: '',
        status: 'active',
        description: ''
      })
      dialogVisible.value = true
    }

    const handleEdit = (row) => {
      isEdit.value = true
      Object.assign(form, {
        itemId: row.itemId,
        name: row.name,
        status: row.status,
        description: row.description
      })
      dialogVisible.value = true
    }

    const handleToggleStatus = (row) => {
      const newStatus = row.status === 'active' ? 'inactive' : 'active'
      const actionText = newStatus === 'active' ? '启用' : '停用'

      ElMessageBox.confirm(`确定要${actionText}该项目吗？`, '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(async () => {
        try {
          // 使用通用更新接口更新状态
          await api.updateCareItem(row.itemId, {
            ...row,
            status: newStatus
          })
          ElMessage.success(`${actionText}成功`)
          loadData()
        } catch (error) {
          ElMessage.error(`${actionText}失败`)
        }
      })
    }

    const submitForm = () => {
      formRef.value.validate(async valid => {
        if (valid) {
          try {
            // 准备提交的数据
            const careItemData = {
              name: form.name,
              status: form.status,
              description: form.description
            }

            if (isEdit.value) {
              // 编辑时添加 ID
              careItemData.itemId = form.itemId
              await api.updateCareItem(form.itemId, careItemData)
              ElMessage.success('更新成功')
            } else {
              await api.addCareItem(careItemData)
              ElMessage.success('新增成功')
            }

            dialogVisible.value = false
            loadData()
          } catch (error) {
            ElMessage.error('操作失败')
          }
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
      loading,
      loadData,
      handleSizeChange,
      handleAdd,
      handleEdit,
      handleToggleStatus,
      submitForm
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
</style>