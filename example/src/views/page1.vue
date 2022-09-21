<template>
  <div class="page">
    <input />
    <h2>count:{{count}}</h2>
    <button class="anim" @click="forward">go next page</button>
    <button class="anim2" @click="back">go back</button>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import router from '@/router';

@Options({
  data() {
    return {
      count: 0,
      timeRef: 0
    }
  },
  mounted() {
    this.timeRef = setInterval(() => this.count = this.count + 1, 1000)
  },
  unmounted() {
    clearInterval(this.timeRef)
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
.page {
  display: flex;
  flex-direction: column;
  align-content: center;
  height: 100vh;
  overflow: scroll;
  text-align: center;
  background: olive;
}

@keyframes scale-anim {
  0% {
    transform: scale(0);
  }

  50% {
    transform: scale(4);
  }

  100% {
    transform: scale(1);
  }
}

.anim {
  /* animation: scale-anim 1s infinite; */
}

.anim2{
  /* transform: translateY(-100px); */
}
</style>