<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import Tree from '../../public/resources/canvas-tree/tree.js';
import { treeData } from '../../public/resources/canvas-tree/treeData.js';

const selectedRole = ref('platform');
const tree = ref<Tree | null>(null);
onMounted(() => {
  console.log('mounted: ', tree.value);
  tree.value = new Tree(treeData);
  tree.value.render();
});
watch(selectedRole, (newVal, oldVal) => {
  if (tree.value) {
    tree.value.changeRole(newVal, oldVal);
  }
});
</script>

<template>
  <fieldset class="role-selector">
    <input type="radio" id="platform" name="role" value="platform" v-model="selectedRole" />
    <label for="platform">Platform</label>
    <input type="radio" id="operator" name="role" value="operator" v-model="selectedRole" />
    <label for="operator">Operator</label>
    <input type="radio" id="shop" name="role" value="shop" v-model="selectedRole" />
    <label for="shop">Shop</label>
  </fieldset>
  <canvas id="canvas"></canvas>
</template>

<style scoped>
.role-selector {
  display: flex;
  gap: 10px;
  padding: 10px;
}
#canvas {
  transform: scale(0.75);
}
</style>
