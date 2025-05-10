<template>
  <video  vjs-big-play-centered controls>
    <source :src="src" type="video/webm" />
  </video>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
const { src } = defineProps({
  src: {
    type: String,
    required: true,
  },
});

console.log("src", src);
</script>
