<template>
  <div class="meal-calendar-container">
    <h2>每日膳食日历</h2>

    <!-- 日历 -->
    <el-calendar v-model="selectedDate">
      <template #date-cell="{ data }">
        <div class="cell-content" @click="goToMealDetails(data.day)">
          <div class="date">{{ data.day.split('-')[2] }}</div>
        </div>
      </template>
    </el-calendar>

    <!-- 餐别选择对话框 -->
    <el-dialog v-model="mealTypeDialogVisible" :title="currentDate + ' 餐别选择'" width="30%" center>
      <div class="meal-type-buttons">
        <el-button type="primary" size="large" round @click="showMealDetail('breakfast')">🍞 早餐</el-button>
        <el-button type="success" size="large" round @click="showMealDetail('lunch')">🍚 中餐</el-button>
        <el-button type="warning" size="large" round @click="showMealDetail('dinner')">🍜 晚餐</el-button>
      </div>
    </el-dialog>

    <!-- 餐别详情对话框 -->
    <el-dialog v-model="mealDetailDialogVisible" :title="currentMealName + ' 信息'" width="50%">
      <div v-if="editing">
        <el-form :model="mealForm" label-width="80px">
          <el-form-item label="描述">
            <el-input type="textarea" v-model="mealForm.introduce" rows="5" />
          </el-form-item>
          <el-form-item label="图片">
            <el-input v-model="mealForm.image" placeholder="图片URL" />
            <div class="image-preview" v-if="mealForm.image">
              <img :src="mealForm.image" alt="预览" class="preview-image" />
            </div>
          </el-form-item>
        </el-form>
      </div>
      <div v-else>
        <div class="meal-display">
          <div class="image-container">
            <img
                :src="mealForm.image || placeholderImage"
                class="meal-image"
                @error="handleImageError"
            />
          </div>
          <div class="meal-content">
            <h3>{{ currentMealName }}详情</h3>
            <div class="meal-introduce">
              {{ mealForm.introduce || '暂无描述信息' }}
            </div>
            <div class="meal-meta">
              <div class="meal-date">{{ mealForm.mealDate }} {{ currentMealName }}</div>
              <div class="meal-id" v-if="mealForm.mealId">ID: {{ mealForm.mealId }}</div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button type="primary" @click="editing = true" v-if="!editing">编辑</el-button>
        <el-button type="success" @click="saveMeal" v-if="editing">保存</el-button>
        <el-button type="danger" @click="deleteMeal" v-if="mealForm.mealId">删除</el-button>
        <el-button @click="closeDialog">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../services/api'

const selectedDate = ref(new Date())
const currentDate = ref('')
const mealTypeDialogVisible = ref(false)
const mealDetailDialogVisible = ref(false)
const currentMealName = ref('')
const currentMealType = ref('')
const editing = ref(false)

// 使用Base64占位图避免404错误
const placeholderImage = ref('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSI+TWVhbCBJbWFnZTwvdGV4dD48L3N2Zz4=')

// 确保字段名与后端一致
const mealForm = ref({
  mealId: null,
  mealDate: '',
  mealType: '',
  introduce: '',
  image: ''
})

const typeMap = {
  breakfast: '早餐',
  lunch: '中餐',
  dinner: '晚餐'
}

// 更健壮的日期格式化
const formatDate = (dateStr) => {
  try {
    const date = new Date(dateStr)
    if (isNaN(date)) return new Date().toISOString().split('T')[0]

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch (e) {
    console.error('日期格式化错误:', e)
    return new Date().toISOString().split('T')[0]
  }
}

const goToMealDetails = (dayStr) => {
  currentDate.value = formatDate(dayStr)
  mealTypeDialogVisible.value = true
}

const showMealDetail = async (type) => {
  currentMealType.value = type
  currentMealName.value = typeMap[type]

  // 重置表单
  mealForm.value = {
    mealId: null,
    mealDate: currentDate.value,
    mealType: type,
    introduce: '',
    image: ''
  }

  try {
    console.log(`[前端] 请求日期: ${currentDate.value}, 餐别: ${type}`)
    const response = await api.getMealsByDate(currentDate.value)
    console.log('[前端] 后端响应数据:', response)

    // 处理可能的响应格式
    const meals = response.data || []
    console.log(`[前端] 找到 ${meals.length} 条记录`)

    // 查找匹配的餐别
    const meal = meals.find(m => m.mealType === type)

    if (meal) {
      console.log('[前端] 找到匹配记录:', meal)
      // 确保字段正确映射
      mealForm.value = {
        mealId: meal.mealId,
        mealDate: meal.mealDate,
        mealType: meal.mealType,
        introduce: meal.introduce || '',
        image: meal.image || ''
      }
    } else {
      console.log(`[前端] 未找到 ${currentDate.value} 的 ${type} 数据`)
      ElMessage.info('暂无数据，可点击"编辑"新增')
    }
  } catch (error) {
    console.error('[前端] 获取餐别数据失败:', error)
    ElMessage.error('获取数据失败: ' + (error.response?.data?.message || error.message))
  }

  mealTypeDialogVisible.value = false
  mealDetailDialogVisible.value = true
  editing.value = false
}

const saveMeal = async () => {
  try {
    if (!mealForm.value.introduce?.trim()) {
      ElMessage.warning('请输入膳食描述')
      return
    }

    // 准备请求数据
    const payload = {
      mealDate: mealForm.value.mealDate,
      mealType: mealForm.value.mealType,
      introduce: mealForm.value.introduce,
      image: mealForm.value.image || null
    }

    console.log('[前端] 保存数据:', payload)

    if (mealForm.value.mealId) {
      // 更新需要包含ID
      payload.mealId = mealForm.value.mealId
      await api.updateMeal(payload)
      ElMessage.success('更新成功')
    } else {
      const response = await api.addMeal(payload)
      // 确保后端返回新创建的ID
      if (response.data?.mealId) {
        mealForm.value.mealId = response.data.mealId
        ElMessage.success('新增成功')
      } else {
        throw new Error('新增成功但未返回ID')
      }
    }

    editing.value = false
  } catch (error) {
    console.error('[前端] 保存失败:', error)
    ElMessage.error('保存失败: ' + (error.response?.data?.message || error.message))
  }
}

const deleteMeal = async () => {
  if (!mealForm.value.mealId) {
    ElMessage.warning('当前无数据可删除')
    return
  }

  try {
    await ElMessageBox.confirm('确定要删除该餐别信息吗？此操作不可撤销。', '警告', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      center: true
    })

    await api.deleteMeal(mealForm.value.mealId)
    ElMessage.success('删除成功')

    // 重置表单
    mealForm.value = {
      mealId: null,
      mealDate: currentDate.value,
      mealType: currentMealType.value,
      introduce: '',
      image: ''
    }

    // 关闭对话框
    mealDetailDialogVisible.value = false
  } catch (error) {
    if (error !== 'cancel') {
      console.error('[前端] 删除失败:', error)
      ElMessage.error('删除失败: ' + (error.response?.data?.message || error.message))
    }
  }
}

const handleImageError = (event) => {
  console.log('图片加载失败:', event)
  event.target.src = placeholderImage.value
}

const closeDialog = () => {
  mealDetailDialogVisible.value = false
  editing.value = false
}
</script>

<style scoped>
.meal-calendar-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.cell-content {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.cell-content:hover {
  background-color: #e6f7ff;
  border-radius: 50%;
}

.date {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.meal-type-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
}

.meal-type-buttons .el-button {
  width: 220px;
  height: 60px;
  font-size: 18px;
  letter-spacing: 1px;
}

.meal-display {
  display: flex;
  gap: 30px;
  align-items: flex-start;
  padding: 15px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.image-container {
  flex-shrink: 0;
  width: 320px;
  height: 220px;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.meal-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.meal-content {
  flex: 1;
}

.meal-content h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #1a73e8;
  font-size: 22px;
  border-bottom: 2px solid #eaeaea;
  padding-bottom: 10px;
}

.meal-introduce {
  font-size: 17px;
  line-height: 1.7;
  color: #444;
  white-space: pre-wrap;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  min-height: 100px;
  border-left: 4px solid #1a73e8;
}

.meal-meta {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 14px;
}

.meal-date {
  font-weight: bold;
}

.meal-id {
  background-color: #e0e0e0;
  padding: 3px 8px;
  border-radius: 4px;
}

.image-preview {
  margin-top: 10px;
}

.preview-image {
  max-width: 200px;
  max-height: 150px;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 5px;
  background: white;
}
</style>