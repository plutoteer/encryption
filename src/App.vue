<template>
  <div id="app">
    <header class="main-navbar">
      <div class="navbar-container">
        <div class="logo">
          <span class="logo-text">MPHEDEV</span>
          <div class="logo-glow"></div>
        </div>
        <nav class="nav-menu">
          <router-link to="/" exact class="nav-link">
            <span class="nav-icon">🏠</span>
            <span class="nav-text">首页</span>
          </router-link>
          <router-link to="/backend-output" class="nav-link">
            <span class="nav-icon">📊</span>
            <span class="nav-text">后端输出</span>
          </router-link>
          <router-link to="/keygen-progress" class="nav-link">
            <span class="nav-icon">🔐</span>
            <span class="nav-text">密钥进度</span>
          </router-link>
          <router-link to="/training-chart" class="nav-link">
            <span class="nav-icon">📈</span>
            <span class="nav-text">训练图表</span>
          </router-link>
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif;
  position: relative;
}

#app::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.main-navbar {
  width: 100%;
  height: 80px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.navbar-container {
  width: 100%;
  max-width: 1500px;
  padding: 0 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  position: relative;
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: 1.8rem;
  font-weight: 900;
  background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.1em;
  text-shadow: 0 2px 20px rgba(255, 255, 255, 0.3);
  position: relative;
  z-index: 1;
}

.logo-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120px;
  height: 40px;
  background: radial-gradient(ellipse, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  filter: blur(10px);
  z-index: 0;
}

.nav-menu {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  overflow: visible;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 12px 20px;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s;
}

.nav-link:hover::before {
  left: 100%;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.nav-link.router-link-exact-active {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%);
  border-color: rgba(255, 255, 255, 0.4);
  color: #ffffff;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.nav-icon {
  font-size: 1.1rem;
}

.nav-text {
  font-weight: 600;
}

.main-content {
  max-width: 1500px;
  margin: 20px auto 0 auto;
  padding: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  min-height: calc(100vh - 120px);
  position: relative;
  z-index: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar-container {
    padding: 0 20px;
    flex-direction: column;
    gap: 15px;
  }
  
  .main-navbar {
    height: auto;
    padding: 15px 0;
  }
  
  .nav-menu {
    gap: 8px;
    justify-content: center;
  }
  
  .nav-link {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
  
  .logo-text {
    font-size: 1.5rem;
  }
  
  .main-content {
    margin-top: 10px;
    min-height: calc(100vh - 140px);
  }
}

@media (max-width: 480px) {
  .nav-menu {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    width: 100%;
  }
  
  .nav-link {
    justify-content: center;
  }
}
</style>