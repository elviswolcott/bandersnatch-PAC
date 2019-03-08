<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
#app {
  font-family: sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

body {
  background-color: white;

  &.darkmode {
    background-color: black;
  }
}
</style>

<script>
document.body.classList.add("darkmode");
export default {};
</script>
