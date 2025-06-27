import { createStore } from 'vuex'
import api from '@/services/api'
export default createStore({
    state: {
        user: null,
        token: localStorage.getItem('token') || null,
        role: localStorage.getItem('role') || null,
        staffId: localStorage.getItem('staffId') || null
    },
    mutations: {
        setUser(state, user) {
            state.user = user
        },
        setToken(state, { token, role, staffId }) {
            state.token = token
            state.role = role
            state.staffId = staffId
            localStorage.setItem('token', token)
            localStorage.setItem('role', role)
            localStorage.setItem('staffId', staffId)
        },
        logout(state) {
            state.user = null
            state.token = null
            state.role = null
            state.staffId = null
            localStorage.removeItem('token')
            localStorage.removeItem('role')
            localStorage.removeItem('staffId')
        }
    },
    actions: {
        async login({ commit }, credentials) {
            try {
                const response = await api.login(credentials)

                commit('setToken', {
                    token: response.data.token,
                    role: response.data.role,
                    staffId: response.data.staffId
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