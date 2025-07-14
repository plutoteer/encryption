<template>
  <div id="app">
    <header class="main-navbar">
      <div class="navbar-container">
        <div class="logo">MPHEDEV</div>
        <nav class="nav-menu">
          <router-link to="/" exact>首页</router-link>
          <router-link to="/online-status">在线状态</router-link>
          <router-link to="/collaborative-decrypt">协同解密</router-link>
          <router-link to="/keygen-progress">密钥进度</router-link>
        </nav>
      </div>
    </header>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>
<script setup>
// App.vue 只负责全局布局和导航栏，无需首页表单逻辑
</script>
<style scoped>
#app {
  min-height: 100vh;
  background: #f7fafc;
  font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif;
}
.main-navbar {
  width: 100%;
  height: 64px;
  background: #fff;
  box-shadow: 0 2px 12px 0 #e3e8f0;
  display: flex;
  justify-content: center;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}
.navbar-container {
  width: 100%;
  max-width: 1400px;
  padding: 0 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo {
  font-size: 1.5rem;
  font-weight: 800;
  color: #2563eb;
  letter-spacing: 0.08em;
}
.nav-menu {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  overflow: visible;
}
.nav-menu a {
  color: #2563eb;
  background: #f1f5f9;
  border-radius: 20px;
  padding: 7px 28px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  box-shadow: 0 0 0 #2563eb00;
}
.nav-menu a.router-link-exact-active, .nav-menu a:hover {
  background: #2563eb;
  color: #fff;
  box-shadow: 0 2px 8px 0 #2563eb33;
}
.main-content {
  max-width: 1400px;
  margin: 48px auto 0 auto;
  padding: 48px 48px 64px 48px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 32px 0 #e3e8f0;
  min-height: 500px;
}
</style> 