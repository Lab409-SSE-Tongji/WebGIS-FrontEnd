<template>
  <div class="footer">
      <div class="pull-right">
        {{systemState}}
      </div>
      <div>
        <strong>时间: {{currentTime}}</strong>
      </div>
  </div>
</template>

<script>

export default {
  name: 'footBar',
  data () {
    return {
      systemState: '',
      currentTime: new Date().toLocaleString()
    }
  },
  created () {
    setInterval(() => {
      this.currentTime = new Date().toLocaleString()
    }, 1000)
    this.$http.get(baseUrl + '/test/state').then(response => {
      console.log(response)
      this.systemState = response.bodyText
    }, response => {
      // error callback
    })
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
