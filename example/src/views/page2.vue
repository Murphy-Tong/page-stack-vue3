<template>
  <div class="page">
    <input/>
    <button @click="forward">go next page</button>
    <button @click="back">go back</button>
    <button @click="back2">go back2</button>
    <button @click="back3">go back3</button>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import router from '@/router';

@Options({
  methods: {
    forward() {
      router.push('/scroll')
    },
    back() {
      router.go(-1)
    },
    back3() {
      router.go(-3)
    },
    back2() {
      router.go(-2)
    }
  }
})
export default class HomeView extends Vue { }
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  align-content: center;
  height: 100vh;
  overflow: scroll;
  text-align: center;
  background: olivedrab;
}
</style>