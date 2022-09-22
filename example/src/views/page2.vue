<template>
  <div class="page">
    <input/>
    <button @click="forward">go next page</button>
    <button @click="back">go back</button>
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