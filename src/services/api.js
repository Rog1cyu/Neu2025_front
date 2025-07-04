import axios from 'axios'

const apiClient = axios.create({
    baseURL: process.env.VUE_APP_API_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}, error => {
    return Promise.reject(error)
})

// 响应拦截器
apiClient.interceptors.response.use(response => {
    return response
}, error => {
    if (error.response && error.response.status === 401) {
        // 处理未授权
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        window.location.reload()
    }
    return Promise.reject(error)
})

export default {
    // 床位管理
    getBeds(params) {
        return apiClient.get('/beds', { params })
    },
    addBed(data) {
        return apiClient.post('/beds', data)
    },
    updateBed(id, data) {
        return apiClient.put(`/beds/${id}`, data)
    },
    deleteBed(id) {
        return apiClient.delete(`/beds/${id}`)
    },

    // 员工管理
    getStaff(params) {
        return apiClient.get('/staff', { params })
    },
    addStaff(data) {
        return apiClient.post('/staff', data)
    },
    updateStaff(id, data) {
        return apiClient.put(`/staff/${id}`, data)
    },
    deleteStaff(id) {
        return apiClient.delete(`/staff/${id}`)
    },

    // 客户管理
    getClients(params) {
        return apiClient.get('/clients', { params })
    },
    addClient(data) {
        return apiClient.post('/clients', data)
    },
    updateClient(id, data) {
        return apiClient.put(`/clients/${id}`, data)
    },
    deleteClient(id) {
        return apiClient.delete(`/clients/${id}`)
    },

    // 护理记录管理
    getCareRecords(params) {
        return apiClient.get('/care-records', { params })
    },
    addCareRecord(data) {
        return apiClient.post('/care-records', data)
    },
    updateCareRecord(id, data) {
        return apiClient.put(`/care-records/${id}`, data)
    },

    // 护理项目管理
    getCareItems(params) {
        return apiClient.get('/care-items', { params })
    },
    addCareItem(data) {
        return apiClient.post('/care-items', data)
    },
    updateCareItem(id, data) {
        return apiClient.put(`/care-items/${id}`, data)
    },

    // 护工相关
    getMyClients(params) {
        return apiClient.get('/my-clients', { params })
    },
    getMyCareRecords(params) {
        return apiClient.get('/my-care-records', { params })
    },

    login(data) {
        return apiClient.post('/login', data)
    },

    // 膳食相关
    getMealsByDate(date) {
        return apiClient.get(`/meals/${date}`)
    },
    addMeal(data) {   // 新增膳食信息
        return apiClient.post('/meals', data)
    },
    updateMeal(data) {  // 修改膳食信息
        return apiClient.put('/meals', data)
    },
    deleteMeal(id) {  // 删除某一条餐别
        return apiClient.delete(`/meals/${id}`)
    },

    uploadMealImage(file) {
        const formData = new FormData()
        formData.append('file', file)
        return axios.post('http://localhost:8080/api/upload/meal', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }
}