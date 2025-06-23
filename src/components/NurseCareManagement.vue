<template>
  <div>
    <div class="page-title">
      <el-icon><Document /></el-icon>
      <span>护理记录</span>
    </div>

    <div class="search-form">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="客户姓名">
          <el-input
              v-model="searchForm.client_name"
              placeholder="请输入客户姓名"
              clearable
          />
        </el-form-item>

        <el-form-item label="项目名称">
          <el-input
              v-model="searchForm.item_name"
              placeholder="请输入项目名称"
              clearable
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态">
            <el-option label="全部" value=""></el-option>
            <el-option label="已完成" value="completed"></el-option>
            <el-option label="未完成" value="pending"></el-option>
          </el-select>
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
      <div class="table-header">
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          新增记录
        </el-button>
      </div>

      <el-table :data="tableData" border class="table-container">
        <el-table-column prop="client_name" label="客户姓名" align="center" />
        <el-table-column prop="item_name" label="护理项目" align="center" />
        <el-table-column label="状态" align="center" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'completed' ? 'success' : 'warning'">
              {{ scope.row.status === 'completed' ? '已完成' : '未完成' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="completion_time" label="完成时间" align="center" width="180" />
        <el-table-column prop="remarks" label="备注" />
        <el-table-column label="操作" width="120" align="center">
          <template #default="scope">
            <el-button
                size="small"
                @click="editRecord(scope.row)"
                v-if="scope.row.status === 'pending'"
            >
              编辑
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

    <!-- 新增/编辑护理记录对话框 -->
    <el-dialog
        :title="dialogTitle"
        v-model="dialogVisible"
        width="600px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="客户" prop="client_id">
          <el-select
              v-model="form.client_id"
              placeholder="请选择客户"
              filterable
          >
            <el-option
                v-for="client in clients"
                :key="client.client_id"
                :label="client.name"
                :value="client.client_id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="护理项目" prop="item_id">
          <el-select
              v-model="form.item_id"
              placeholder="请选择护理项目"
              filterable
          >
            <el-option
                v-for="item in careItems"
                :key="item.item_id"
                :label="item.name"
                :value="item.item_id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="计划时间" prop="order_time">
          <el-date-picker
              v-model="form.order_time"
              type="datetime"
              placeholder="选择日期时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
          />
        </el-form-item>

        <el-form-item label="备注" prop="remarks">
          <el-input
              v-model="form.remarks"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
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
import { ref, reactive, onMounted, computed } from 'vue'
import api from '@/services/api'
import { ElMessage } from 'element-plus'

export default {
  setup() {
    const tableData = ref([])
    const clients = ref([])
    const careItems = ref([])
    const dialogVisible = ref(false)
    const isEdit = ref(false)
    const formRef = ref(null)

    const searchForm = reactive({
      client_name: '',
      item_name: '',
      status: ''
    })

    const form = reactive({
      record_id: '',
      client_id: '',
      item_id: '',
      order_time: '',
      remarks: ''
    })

    const rules = reactive({
      client_id: [
        { required: true, message: '请选择客户', trigger: 'blur' }
      ],
      item_id: [
        { required: true, message: '请选择护理项目', trigger: 'blur' }
      ],
      order_time: [
        { required: true, message: '请选择计划时间', trigger: 'blur' }
      ]
    })

    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0
    })

    const dialogTitle = computed(() => {
      return isEdit.value ? '编辑护理记录' : '新增护理记录'
    })

    const loadData = async () => {
      try {
        const params = {
          ...searchForm,
          page: pagination.current,
          page_size: pagination.size
        }

        // 在实际应用中，这里应该调用获取护工负责的护理记录API
        const response = await api.getCareRecords(params)
        tableData.value = response.data.list
        pagination.total = response.data.total
      } catch (error) {
        console.error('获取护理记录失败', error)
      }
    }

    const loadClients = async () => {
      try {
        // 获取护工负责的客户列表
        const response = await api.getMyClients()
        clients.value = response.data
      } catch (error) {
        console.error('获取客户列表失败', error)
      }
    }

    const loadCareItems = async () => {
      try {
        const response = await api.getCareItems({ status: 'active' })
        careItems.value = response.data.list
      } catch (error) {
        console.error('获取护理项目失败', error)
      }
    }

    const handleSizeChange = (size) => {
      pagination.size = size
      pagination.current = 1
      loadData()
    }

    const showAddDialog = () => {
      isEdit.value = false
      Object.assign(form, {
        record_id: '',
        client_id: '',
        item_id: '',
        order_time: '',
        remarks: ''
      })
      dialogVisible.value = true
    }

    const editRecord = (record) => {
      isEdit.value = true
      Object.assign(form, {
        record_id: record.record_id,
        client_id: record.client_id,
        item_id: record.item_id,
        order_time: record.order_time,
        remarks: record.remarks
      })
      dialogVisible.value = true
    }

    const submitForm = () => {
      formRef.value.validate(async valid => {
        if (valid) {
          try {
            if (isEdit.value) {
              await api.updateCareRecord(form.record_id, form)
              ElMessage.success('更新成功')
            } else {
              await api.addCareRecord(form)
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
      loadClients()
      loadCareItems()
    })

    return {
      tableData,
      clients,
      careItems,
      searchForm,
      pagination,
      form,
      rules,
      formRef,
      dialogVisible,
      isEdit,
      dialogTitle,
      loadData,
      handleSizeChange,
      showAddDialog,
      editRecord,
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