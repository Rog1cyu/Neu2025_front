<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>

<script>
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

export default {
  name: 'App',
  data() {
    return {
      zhCn
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap');

:root {
  --primary-color: #409EFF;
  --success-color: #67C23A;
  --warning-color: #E6A23C;
  --danger-color: #F56C6C;
  --info-color: #909399;

  --el-color-primary: #409EFF;
  --el-color-success: #67C23A;
  --el-color-warning: #E6A23C;
  --el-color-danger: #F56C6C;
  --el-color-info: #909399;

  --el-font-family: 'Noto Sans SC', sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Noto Sans SC', sans-serif;
  background-color: #f5f7fa;
  color: #333;
}

.el-header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.el-aside {
  background-color: #304156;
  color: #fff;
  height: 100vh;
}

.el-main {
  padding: 20px;
  background-color: #f5f7fa;
}

.page-title {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 20px;
  color: #304156;
  display: flex;
  align-items: center;
}

.page-title i {
  margin-right: 10px;
  font-size: 24px;
}

.card-container {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.table-container {
  margin-top: 20px;
}

.search-form {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 20px;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  margin-top: 20px;
}
</style>