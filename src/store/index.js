import { createStore } from 'vuex'
import api from '@/services/api'
export default createStore({
    state: {
        user: null,
        token: localStorage.getItem('token') || null,
        role: localStorage.getItem('role') || null
    },
    mutations: {
        setUser(state, user) {
            state.user = user
        },
        setToken(state, { token, role }) {
            state.token = token
            state.role = role
            localStorage.setItem('token', token)
            localStorage.setItem('role', role)
        },
        logout(state) {
            state.user = null
            state.token = null
            state.role = null
            localStorage.removeItem('token')
            localStorage.removeItem('role')
        }
    },
    actions: {
        async login({ commit }, credentials) {
            try {
                // 这里应该是实际的API调用
                // const response = await authService.login(credentials)
                // 模拟响应


                /*const response = {
                    data: {
                        token: 'mock-token',
                        role: credentials.username.includes('admin') ? 'admin' : 'nurse'
                    }
                }*/
                const response = await api.login(credentials)

                commit('setToken', {
                    token: response.data.token,
                    role: response.data.role
                })

                return response
            } catch (error) {
                throw error
            }
        },
        logout({ commit }) {
            commit('logout')
        }
    }
})