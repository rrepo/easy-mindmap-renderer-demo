<template>
  <div>
    <!-- <img :src=imageSrc alt="Icon" height="30px" width="30px"/> -->
    <div>
      <MindMap :node_props="nodes" />
    </div>

  </div>

</template>

<script setup lang="ts">
import MindMap from './components/MindMap.vue';

const nodes = [
  { id: 0, text: 'ch0', url: '', parent: null, direction: '' },
  { id: 1, text: 'ch1', url: '', parent: 0, direction: '' },
  { id: 2, text: 'ch2', url: '', parent: 0, direction: '' },
  { id: 3, text: 'ch3', url: '', parent: 0, direction: '' },
  { id: 4, text: 'ch4', url: '', parent: 2, direction: '' },
  { id: 5, text: 'ch5', url: '', parent: 4, direction: '' },
  { id: 6, text: 'ch6', url: '', parent: 4, direction: '' },
]
</script>

<style>
body {
  margin: 0px;
  padding: 0px;
}

#app {
  margin: 0px;
  padding: 0px;
}

.rapmap {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  border: 1px solid #000;
}
</style>
