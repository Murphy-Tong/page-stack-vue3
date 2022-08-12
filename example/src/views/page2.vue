<template>
  <div class="about">
    <h1>Page 2</h1><br/>
    <input v-model="val" /><br/>
    <router-link to="/p3">前往page3</router-link><br/><br/>
    <router-link to="/p1" replace>替换为page1</router-link><br/><br/>
    <!-- <router-link to="/p2" replace>替换为page2</router-link><br/> -->
    <router-link to="/p3" replace>替换为page3</router-link><br/><br/>
    <button @click="back">后退</button><br/>
  </div>
</template>

<script lang="js">
import router from '@/router';

export default {
  data() {
    return {
      val: ''
    }
  }, methods: {
    back() {
      router.go(-1)
    }
  }
}
</script>

<style scoped>
.about {
  height: 100vh;
  overflow: scroll;
}
</style>