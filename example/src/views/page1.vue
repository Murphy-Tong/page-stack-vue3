<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <h1>Page 1</h1>
    <br/>
    <!-- <router-link to="/p1" replace>替换为page1</router-link> -->
    <br/><br/>
    <button @click="forward">前往page2</button>
    <br/><br/>
    <router-link to="/p3" replace>替换为page3</router-link>
    <br/><br/>
    <button @click="back">后退</button>
    <br/><br/>

    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />
    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />
    
    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src
import router from '@/router';

@Options({
  components: {
    HelloWorld,
  },
  methods: {
    forward() {
      router.push('/p2')
    },
    back() {
      router.go(-1)
    }
  }
})
export default class HomeView extends Vue { }
</script>

<style scoped>
.home {
  height: 100vh;
  overflow: scroll;
  text-align: center;
}
</style>