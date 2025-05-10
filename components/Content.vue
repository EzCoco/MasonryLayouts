<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
const { data } = await useFetch("/api/data");
const dataList = ref([]);
const loading = ref(true);
const content = ref(null);
let timer = null; //定时器防抖
let scrollTimer = null; // 滚动定时器
let touchEndTimer = null; // 触摸定时器
const isLoading = ref(false);
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
async function handleFormSubmit() {
  loading.value = true;
  const res = await $fetch("/mock/mockData.json");
  dataList.value.push(...res.splice(0, 10));
  ElMessage({
    message: "数据加载完毕",
    type: "success",
  });
  setPostion(() => {
    if (isLoading.value) isLoading.value = false;
  });
}

function calcImgWidth() {
  let imgWidthPrcent;
  const device = window.navigator.userAgent;
  const mobileAgents = [
    "Android",
    "iPhone",
    "SymbianOS",
    "Windows Phone",
    "Windows",
    "iPad",
    "iPod",
  ];
  let deviceType = mobileAgents.find((item) => {
    if (device.indexOf(item) > -1) return item;
  });
  if (deviceType !== "Windows") {
    // 手机
    imgWidthPrcent = 48; // 40vw
  } else {
    // PC
    imgWidthPrcent = 19.2;
    // 模拟器状态
    if (window.innerWidth < 480) {
      // 手机
      imgWidthPrcent = 48; // 40vw
    } else if (window.innerWidth < 768) {
      // 平板
      imgWidthPrcent = 48; // 40vw
    } else if (window.innerWidth < 1500) {
      // PC
      imgWidthPrcent = 32; // 40vw
    }
  }
  return imgWidthPrcent;
}
// 计算位置
function setPostion(fn = () => {}) {
  debugger
  // 图片宽度比例
  let imgWidthPrcent = calcImgWidth();
  const divContainer = document.querySelector(".content");
  let imgWidth;
  // 有多少列，每一列间隙
  function cal() {
    let containerWidth = divContainer.clientWidth;
    imgWidth = (containerWidth * imgWidthPrcent) / 100;
    // 列数量
    let columns = Math.floor(containerWidth / imgWidth);
    // 每一列间隙
    let spaceNumber = columns + 1;
    let leftSpace = containerWidth - columns * imgWidth;
    // 剩余空间
    let space = Number((leftSpace / spaceNumber).toFixed(2));
    return {
      columns,
      space,
    };
  }
  let info = cal(); // 计算列数和间隙
  let nextTops = new Array(info.columns); // 该数组长度为 列数， 值表示每一列高度，下一个元素的纵坐标
  nextTops.fill(0); // 初始化为0
  for (let i = 0; i < dataList.value.length; i++) {
    let item = dataList.value[i];
    let minIndex = 0; // 最小高度的列
    let minTop = Math.min.apply(null, nextTops); // 最小高度
    item.top = minTop + "px";
    // 设置 该数组元素的 下一个top值
    let index = nextTops.indexOf(minTop);
    nextTops[index] +=
      (item.height + 42) / (item.width / imgWidth) + info.space; // 更新该列高度
    item.imgWidth = imgWidth - info.space;
    // 计算元素横坐标
    item.left = index * imgWidth + info.space * index + "px";
    let max = Math.max.apply(null, nextTops); // 最大高度
  }
  console.log("dataList.value", dataList.value);
  fn && fn();
}

// 滚动到底部加载更多
function handleScroll() {
  const scrollTop = content.value.scrollTop;
  const clientHeight = content.value.clientHeight;
  const scrollHeight = content.value.scrollHeight;
  if (scrollTop + clientHeight >= scrollHeight - 10) {
    isLoading.value = true;
    ElMessage({
      message: "数据正在载中",
      type: "success",
    });
    // 滚动到底部
    let time = getRandomArbitrary(100, 2000);
    setTimeout(() => {
      handleFormSubmit();
    }, time);
  }
}

const isRefreshing = ref(false);
// 下拉刷新
function handleRefresh() {
  // 下拉刷新
  let time = getRandomArbitrary(100, 2000);
  isRefreshing.value = true;
  setTimeout(() => {
    handleRefreshDate();
  }, time);
}
async function handleRefreshDate() {
  dataList.value = [];
  const res = await $fetch("/mock/mockData.json");
  let data = shuffle(res);
  dataList.value = data;
  setPostion(() => {
    isPulling.value = false;
    // refreshTip.value.style.display = "none";
  });
}
const startY = ref(0);
const isPulling = ref(false);
// const refreshTip = ref(false);
onMounted(() => {
  handleFormSubmit();
  window.addEventListener("resize", () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      setPostion(() => {
        if (isLoading.value) isLoading.value = false;
      });
    }, 100);
  });

  content.value.addEventListener("scroll", () => {
    if (scrollTimer) {
      clearTimeout(scrollTimer);
    }
    scrollTimer = setTimeout(() => {
      handleScroll();
    }, 100);
  });

  //  监听下拉刷新
  content.value.addEventListener("touchstart", (e) => {
    console.log("e", e);
    if (content.value.scrollTop === 0) {
      // 触摸开始
      startY.value = e.touches[0].clientY;
      isPulling.value = true;
    }
  });
  content.value.addEventListener("touchmove", (e) => {
    if (isPulling.value) {
      console.log("e", e.touches[0].clientY - startY.value);
      if (e.touches[0].clientY - startY.value > 50) {
        // 下拉刷新
        isRefreshing.value = true;
        //   handleFormSubmit();
      }
      // cosnt currentY = e.touches[0].clientY;
    }
  });
  content.value.addEventListener("touchend", (e) => {
    if (touchEndTimer) {
      clearTimeout(touchEndTimer);
    }
    touchEndTimer = setTimeout(() => {
      if (isPulling.value && isRefreshing.value) {
        handleRefresh();
        // refreshTip.value.style.display = "none";
        isPulling.value = false;
        // handleFormSubmit();
        isRefreshing.value = false;
      }
    }, 100);
  });
});

onUnmounted(() => {
  window.removeEventListener("resize", () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  });
  content.value.removeEventListener("scroll", () => {
    if (scrollTimer) {
      clearTimeout(scrollTimer);
      scrollTimer = null;
    }
  });
});
</script>

<template>
  <div class="container">
    <!-- 下拉刷新提示 -->
    <div class="refresh-tip" ref="refreshTip" :class="{ active: isRefreshing }">
      <span v-if="isRefreshing">加载中...</span>
      <span v-else>↓ 下拉刷新</span>
    </div>
    <div class="content" ref="content">
      <div
        v-for="(item, index) in dataList"
        :key="index"
        class="card"
        :style="{
          left: item?.left,
          top: item?.top,
          width: `${item.imgWidth}px`,
        }"
      >
        <template v-if="item?.type == 'video'">
          <div class="title-container">
            <div>
              <div class="desc">{{ item.title + item.username }}</div>
              <div class="like">
                <img src="/like.svg" />
                {{ item.likes }}
              </div>
            </div>
          </div>
          <Player :src="item.src" style="width: 100%" />
        </template>
        <template v-else>
          <div class="title-container">
            <div class="title">{{ item.title }}</div>
            <div>
              <div class="desc">{{ item.username }}</div>
              <div class="like">
                <img src="/like.svg" />
                {{ item.likes }}
              </div>
            </div>
          </div>
          <img :src="`/png/${item.img}`" style="width: 100%" />
        </template>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.refresh-tip {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  background-color: #fff;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: none;
  transition: all 0.3s ease;
}
.active {
  display: block;
}
.container {
  width: 100vw;
  display: flex;
  justify-content: center;
}
.content {
  width: 80%;
  height: calc(100vh - 20vh);
  background-color: rgb(42, 228, 166);
  overflow: auto;
  position: relative;
  //   display: grid;
  //   grid-template-columns: repeat(auto-fill, minmax(15vw, 1fr));
  //   gap: 20px;
  //   grid-auto-flow: dense; /* 关键属性：紧凑填充 */
  .card {
    position: absolute;
    // padding: 20px 0;
    // break-inside: avoid;
    .title-container {
      position: absolute;
      background-color: #fff;
      width: 100%;
      bottom: 0;
      z-index: 200;
      .title {
        font-size: 14px;
        font-weight: bold;
        color: #000;
      }
      .desc {
        width: 60%;
        display: inline-block;
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .like {
        display: flex;
        position: absolute;
        bottom: 0;
        right: 2%;
        font-size: 12px;
      }
    }
    .img {
      //   width: 100%;
    }
  }
}
@media screen and (min-width: 768px) {
  .content {
    width: 60vw;
    .img {
      width: 200px;
    }
  }
}
</style>
