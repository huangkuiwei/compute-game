<script>
export default {
  onLaunch: function() {
    let moneyData = uni.getStorageSync('moneyData')

    if (!moneyData) {
      uni.setStorageSync('moneyData', [
        {
          minMoney: 0.9,
          maxMoney: 1.5
        },
      ])
    }
  },
}
</script>

<style>
/*每个页面公共css */
@import '/common/styles/reset.scss';
@import '/common/styles/global.scss';
</style>
