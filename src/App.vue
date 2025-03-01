<template>
  <div>
    <!-- <img :src=imageSrc alt="Icon" height="30px" width="30px"/> -->


    <MindMap title_props="title" :node_props="[
      {
        'id': 0,
        'text': 'ch0',
        'url': '',
        'parent': 'title',
        'direction': ''
      },
      {
        'id': 1,
        'text': 'ch1',
        'url': '',
        'parent': 'title',
        'direction': ''
      },
      {
        'id': 2,
        'text': 'ch2',
        'url': '',
        'parent': 'title',
        'direction': ''
      },
      {
        'id': 3,
        'text': 'ch3',
        'url': '',
        'parent': 'title',
        'direction': ''
      },
      {
        'id': 4,
        'text': 'ch4',
        'url': '',
        'parent': '2',
        'direction': ''
      },
      {
        'id': 5,
        'text': 'ch5',
        'url': '',
        'parent': '4',
        'direction': ''
      },
      {
        'id': 6,
        'text': 'ch6',
        'url': '',
        'parent': '4',
        'direction': ''
      },
      {
        'id': 7,
        'text': 'ch7',
        'url': '',
        'parent': '5',
        'direction': ''
      },
      {
        'id': 8,
        'text': 'ch8',
        'url': '',
        'parent': 'title',
        'direction': ''
      },
      {
        'id': 9,
        'text': 'ch9',
        'url': '',
        'parent': 'title',
        'direction': ''
      },
      {
        'id': 10,
        'text': 'ch10',
        'url': '',
        'parent': 'title',
        'direction': ''
      },
      {
        'id': 11,
        'text': 'ch11',
        'url': '',
        'parent': '8',
        'direction': ''
      },
      {
        'id': 12,
        'text': 'ch12',
        'url': '',
        'parent': '11',
        'direction': ''
      },
    ]">

    </MindMap>

  </div>

</template>

<script setup lang="ts">
import MindMap from './components/MindMap.vue';
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