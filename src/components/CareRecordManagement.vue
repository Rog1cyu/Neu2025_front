<template>
  <div>
    <div class="page-title">
      <el-icon><Document /></el-icon>
      <span>护理记录管理</span>
    </div>

    <div class="search-form">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="客户姓名">
          <el-input v-model="searchForm.clientName" placeholder="请输入客户姓名" clearable />
        </el-form-item>
        <el-form-item label="项目名称">
          <el-input v-model="searchForm.itemName" placeholder="请输入项目名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="已完成" value="completed"></el-option>
            <el-option label="未完成" value="pending"></el-option>
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
      <el-table :data="tableData" border class="table-container" v-loading="loading">
        <el-table-column prop="recordId" label="记录ID" align="center" width="100" />
        <el-table-column label="客户" align="center">
          <template #default="scope">
            {{ getClientDisplay(scope.row.clientId) }}
          </template>
        </el-table-column>
        <el-table-column label="床位" align="center">
          <template #default="scope">
            {{ getBedDisplayForClient(scope.row.clientId) }}
          </template>
        </el-table-column>
        <el-table-column label="护理项目" align="center">
          <template #default="scope">
            {{ getCareItemDisplay(scope.row.itemId) }}
          </template>
        </el-table-column>
        <el-table-column label="执行护工" align="center">
          <template #default="scope">
            {{ getStaffDisplay(scope.row.nurseId) }}
          </template>
        </el-table-column>
        <el-table-column prop="orderTime" label="预约时间" align="center" width="180" />
        <el-table-column prop="completionTime" label="完成时间" align="center" width="180" />
        <el-table-column label="状态" align="center" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'completed' ? 'success' : 'warning'">
              {{ scope.row.status === 'completed' ? '已完成' : '未完成' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注" />
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
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

    <!-- 编辑护理记录对话框 -->
    <el-dialog title="编辑护理记录" v-model="dialogVisible" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="客户">
          <el-select
              v-model="form.clientId"
              placeholder="请选择客户"
              filterable
              disabled
          >
            <el-option
                v-for="client in clientList"
                :key="client.clientId"
                :label="`${client.name} (ID: ${client.clientId})`"
                :value="client.clientId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="床位">
          <el-select
              v-model="form.bedId"
              placeholder="请选择床位"
              filterable
              disabled
          >
            <el-option
                v-for="bed in availableBeds"
                :key="bed.bedId"
                :label="`${bed.bedCode} (${bed.status})`"
                :value="bed.bedId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="护理项目">
          <el-select
              v-model="form.itemId"
              placeholder="请选择护理项目"
              filterable
              disabled
          >
            <el-option
                v-for="item in careItemList"
                :key="item.itemId"
                :label="item.name"
                :value="item.itemId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="执行护工" prop="nurseId">
          <el-select v-model="form.nurseId" placeholder="请选择护工" filterable>
            <el-option
                v-for="staff in staffList"
                :key="staff.staffId"
                :label="`${staff.name} (ID: ${staff.staffId})`"
                :value="staff.staffId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="预约时间" prop="orderTime">
          <el-date-picker
              v-model="form.orderTime"
              type="datetime"
              placeholder="选择日期时间"
              value-format="YYYY-MM-DD HH:mm"
          />
        </el-form-item>
        <el-form-item label="完成时间" prop="completionTime">
          <el-date-picker
              v-model="form.completionTime"
              type="datetime"
              placeholder="选择日期时间"
              value-format="YYYY-MM-DD HH:mm"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="已完成" value="completed"></el-option>
            <el-option label="未完成" value="pending"></el-option>
          </el-select>
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
    const dialogVisible = ref(false)
    const formRef = ref(null)
    const loading = ref(false)

    // 数据缓存
    const staffList = ref([])      // 所有护工列表
    const clientList = ref([])     // 所有客户列表
    const bedList = ref([])        // 所有床位列表
    const careItemList = ref([])   // 所有护理项目列表
    const availableBeds = ref([])  // 可用床位列表（用于下拉框）

    const searchForm = reactive({
      clientName: '',
      itemName: '',
      status: ''
    })

    const form = reactive({
      recordId: '',
      clientId: '',
      bedId: '', // 新增床位ID字段
      itemId: '',
      nurseId: '',
      orderTime: '',
      completionTime: '',
      status: '',
      remarks: ''
    })

    const rules = reactive({
      nurseId: [
        { required: true, message: '请选择护工', trigger: 'change' }
      ],
      orderTime: [
        { required: true, message: '请选择预约时间', trigger: 'change' }
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

    // 加载所有基础数据
    const loadAllBaseData = async () => {
      try {
        // 加载护工数据
        const staffRes = await api.getStaff({ page: 1, size: 1000 })
        staffList.value = staffRes.data.records || []

        // 加载客户数据
        const clientRes = await api.getClients({ page: 1, size: 1000 })
        clientList.value = clientRes.data.records || []

        // 加载床位数据
        const bedRes = await api.getBeds({ page: 1, size: 1000 })
        bedList.value = bedRes.data.records || []
        availableBeds.value = bedList.value.filter(bed => bed.status === 'available')

        // 加载护理项目数据
        const careItemRes = await api.getCareItems({ page: 1, size: 1000 })
        careItemList.value = careItemRes.data.records || []
      } catch (error) {
        ElMessage.error('加载基础数据失败')
      }
    }

    // 根据ID获取护工显示名称
    const getStaffDisplay = (staffId) => {
      if (!staffId) return '-'
      const staff = staffList.value.find(s => s.staffId === staffId)
      return staff ? `${staff.name} (${staff.staffId})` : `未知 (${staffId})`
    }

    // 根据ID获取床位显示名称
    const getBedDisplay = (bedId) => {
      if (!bedId) return '未分配'
      const bed = bedList.value.find(b => b.bedId === bedId)
      return bed ? bed.bedCode : `未知 (${bedId})`
    }

    // 根据客户ID获取床位显示名称
    const getBedDisplayForClient = (clientId) => {
      if (!clientId) return '未分配'
      const client = clientList.value.find(c => c.clientId === clientId)
      if (!client) return '未知客户'
      return getBedDisplay(client.bedId)
    }

    // 根据ID获取客户显示名称
    const getClientDisplay = (clientId) => {
      if (!clientId) return '-'
      const client = clientList.value.find(c => c.clientId === clientId)
      return client ? client.name : `未知 (${clientId})`
    }

    // 根据ID获取护理项目显示名称
    const getCareItemDisplay = (itemId) => {
      if (!itemId) return '-'
      const item = careItemList.value.find(i => i.itemId === itemId)
      return item ? item.name : `未知 (${itemId})`
    }

    const loadData = async () => {
      loading.value = true
      try {
        const params = {
          page: pagination.current,
          size: pagination.size
        }

        // 添加状态过滤
        if (searchForm.status) {
          params.status = searchForm.status
        }

        const response = await api.getCareRecords(params)
        let records = response.data.records || []

        // 前端过滤客户名称
        if (searchForm.clientName) {
          records = records.filter(record => {
            const client = clientList.value.find(c => c.clientId === record.clientId)
            return client && client.name.includes(searchForm.clientName)
          })
        }

        // 前端过滤项目名称
        if (searchForm.itemName) {
          records = records.filter(record => {
            const item = careItemList.value.find(i => i.itemId === record.itemId)
            return item && item.name.includes(searchForm.itemName)
          })
        }

        tableData.value = records
        pagination.total = records.length
      } catch (error) {
        ElMessage.error('获取护理记录失败: ' + (error.message || '未知错误'))
      } finally {
        loading.value = false
      }
    }

    const handleSizeChange = (size) => {
      pagination.size = size
      pagination.current = 1
      loadData()
    }

    const handleEdit = async (row) => {
      // 获取该客户的床位ID
      const client = clientList.value.find(c => c.clientId === row.clientId)
      const bedId = client ? client.bedId : null

      Object.assign(form, {
        recordId: row.recordId,
        clientId: row.clientId,
        bedId: bedId, // 设置床位ID
        itemId: row.itemId,
        nurseId: row.nurseId,
        orderTime: row.orderTime,
        completionTime: row.completionTime,
        status: row.status,
        remarks: row.remarks
      })
      dialogVisible.value = true
    }

    const submitForm = () => {
      formRef.value.validate(async valid => {
        if (valid) {
          try {
            // 更新护理记录
            const careRecordData = {
              clientId: form.clientId,
              itemId: form.itemId,
              nurseId: form.nurseId,
              orderTime: form.orderTime,
              completionTime: form.completionTime,
              status: form.status,
              remarks: form.remarks
            }
            await api.updateCareRecord(form.recordId, careRecordData)

            // 更新客户床位信息
            if (form.bedId) {
              const clientData = {
                clientId: form.clientId,
                bedId: form.bedId
              }
              await api.updateClient(form.clientId, clientData)
            }

            ElMessage.success('更新成功')
            dialogVisible.value = false

            // 重新加载数据
            await loadAllBaseData()
            loadData()
          } catch (error) {
            ElMessage.error('操作失败: ' + (error.message || '未知错误'))
          }
        }
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
      form,
      rules,
      formRef,
      dialogVisible,
      staffList,
      clientList,
      bedList,
      careItemList,
      availableBeds,
      loading,
      loadData,
      handleSizeChange,
      handleEdit,
      submitForm,
      getStaffDisplay,
      getBedDisplay,
      getBedDisplayForClient,
      getClientDisplay,
      getCareItemDisplay
    }
  }
}
</script>