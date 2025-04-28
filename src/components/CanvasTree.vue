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
    <span class="selector-item">
      <input type="radio" id="platform" name="role" value="platform" v-model="selectedRole" />
      <label for="platform">Platform</label>
    </span>
    <span class="selector-item">
      <input type="radio" id="operator" name="role" value="operator" v-model="selectedRole" />
      <label for="operator">Operator</label>
    </span>
    <span class="selector-item">
      <input type="radio" id="shop" name="role" value="shop" v-model="selectedRole" />
      <label for="shop">Shop</label>
    </span>
  </fieldset>
  <canvas id="canvas" style="width: 500px"></canvas>
</template>

<style scoped>
.role-selector {
  display: flex;
  gap: 10px;
  padding: 10px;
  .selector-item {
    display: flex;
    align-items: center;
    label {
      padding-left: 5px;
    }
    * {
      cursor: pointer;
    }
  }
}
</style>
