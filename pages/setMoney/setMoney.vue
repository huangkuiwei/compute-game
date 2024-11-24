<script>
export default {
  name: 'setMoney',

  data() {
    return {
      moneyData: [
        {
          minMoney: 0.9,
          maxMoney: 1.5
        },
      ]
    }
  },

  onLoad() {
    let moneyData = uni.getStorageSync('moneyData')

    if (moneyData) {
      this.moneyData = moneyData
    }
  },

  methods: {
    submit() {
      if (Number(Number(this.moneyData[0].minMoney)) <= 0 || Number(Number(this.moneyData[0].maxMoney)) <= 0) {
        uni.showToast({
          title:'金额需大于0',
          icon:'error'
        })

        return
      }

      if (Number(this.moneyData[0].minMoney) >= Number(this.moneyData[0].maxMoney)) {
        uni.showToast({
          title:'最大值需大于最小值',
          icon:'error'
        })

        return
      }

      uni.setStorageSync('moneyData', this.moneyData)

      uni.showToast({
        title:'保存成功',
        icon:'success'
      })
    }
  }
}
</script>

<template>
  <view class="set-money">
    <view class="page-title">设置金额</view>

    <view class="money-list">
      <view class="money-item">
        <view class="list-title">数学计算</view>

        <view class="money">
          <view class="item">最大值：</view>
          <input v-model="moneyData[0].minMoney" type="number" placeholder="请输入最小值">
        </view>

        <view class="money">
          <view class="item">最大值：</view>
          <input v-model="moneyData[0].maxMoney" type="number" placeholder="请输入最大值">
        </view>
      </view>

      <view class="btn">
        <button type="primary" size="mini" @click="submit">确定</button>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.set-money {
  margin-top: 100rpx;

  .page-title {
    text-align: center;
    margin-bottom: 40rpx;
    font-size: 40rpx;
    font-weight: bold;
  }

  .money-list {
    padding: 0 40rpx 100rpx;

    .money-item {
      margin-bottom: 40rpx;

      .list-title {
        margin-bottom: 20rpx;
        font-size: 36rpx;
      }

      .money {
        display: flex;
        align-items: center;
        margin-bottom: 20rpx;

        .item {
        }

        input {
          border: 1px solid #cccccc;
          height: 60rpx;
          width: 300rpx;
          font-size: 30rpx;
          padding: 0 30rpx;
          border-radius: 12rpx;
        }
      }

      .btn {
        text-align: center;

        button {
          width: 180rpx;
          height: 60rpx;
          line-height: 60rpx;
        }
      }
    }
  }

}
</style>