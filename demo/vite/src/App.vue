<template>
  <div class="App">
    {{result}}
    <button @click="get(2)">GET 2</button>
    <button @click="post(3)">POST 3</button>
    <button @click="put(4)">PUT 4</button>
    <button @click="patch(5)">PATCH 5</button>
    <button @click="deleet(6)">DELETE 6</button>
    <button @click="configBaseURL">config baseURL</button>
    <button @click="configHeaders">config headers</button>
    <button @click="configCache">config cache</button>
  </div>
</template>
<script setup lang="ts">

import { ref } from 'vue';
import { exampleService } from './example-service';
import { configure } from 'offstage';

const result = ref<any>(null);

const get = async(nr:number) => {
  result.value = (await exampleService.getSquare({ nr })).result
}
const post = async(nr:number) => {
  result.value = (await exampleService.postSquare({ nr })).result
}
const put = async(nr:number) => {
  result.value = (await exampleService.putSquare({ nr })).result
}

const patch = async(nr:number) => {
  result.value = (await exampleService.patchSquare({ nr })).result
}
const deleet = async(nr:number) => {
  result.value = (await exampleService.deleteSquare({ nr })).result
}

const configBaseURL = async() => {
  configure([
    () => ({ baseURL:'http://localhost:3000' }),
  ]);
  try {
    result.value = (await exampleService.getSquare({ nr:2 })).result
  } catch(e:any) {
    result.value = e.responseData.error;
  }
}

const configHeaders = async() => {
  configure([
    () => ({
      headers: {
        Authorization: 'Bearer foo',
      },
    }),
    () => ({
      headers: {
        'x-foo-bar': 'Bar',
      },
    }),
  ]);
  result.value = (await exampleService.getSquare({ nr:2 })).result
}
const configCache = async() => {
  configure([
    () => ({ cacheSeconds: 5 }),
  ]);
}

</script>
<style scoped>
</style>
