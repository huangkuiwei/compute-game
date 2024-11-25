<script>
import { mapState } from 'vuex';

export default {
  name: 'math',

  data() {
    return {
      totalMoney: 0,
      money: 0,
      countdown: 20,
      freezeCountdown: false,
      expression: '',
      value: '',
    }
  },

  computed: {
    ...mapState('app', ['deviceUuid']),
  },

  onShow() {
    this.getTotalMoney()
    this.expression = this.generateExpression()
  },

  watch: {
    countdown: {
      handler(value) {
        setTimeout(() => {
          if (value > 0 && !this.freezeCountdown) {
            let countdown = this.countdown - 1;

            if (countdown < 0) {
              this.countdown = 0;
            } else {
              this.countdown--;
            }
          } else if (value <= 0) {
            this.$refs.timerErrorRef.open()
          }
        }, 1000);
      },

      immediate: true,
    }
  },

  methods: {
    getTotalMoney() {
      uni.showLoading({
        title: '请稍等...'
      })

      uni.request({
        url: `http://110.40.131.58:5000/api/app-bind-pwd/myhomeprice/${this.deviceUuid}`,
        method: 'POST',
        header:{
          Authorization: `Bearer ${uni.getStorageSync('token')}`
        },
        success: (response) => {
          this.totalMoney = +response.data.data
        },
        complete: () => {
          uni.hideLoading()
        }
      })
    },

    generateExpression() {
      // 随机生成两个1到99之间的整数
      let num1, num2;

      // 定义可用的运算符及其对应的符号
      const operators = ['+', '-', 'x', '÷'];
      const operatorSymbols = ['+', '-', '*', '/'];

      // 随机选择一个运算符
      const index = Math.floor(Math.random() * operators.length);
      const operator = operators[index];
      const operatorSymbol = operatorSymbols[index];

      // 根据运算符生成第一个数
      if (operator === '÷') {
        // 确保 num1 能被 num2 整除
        num2 = Math.floor(Math.random() * 99) + 1; // 1到99
        const quotient = Math.floor(Math.random() * (99 / num2)) + 1; // 确保 num1 在1到99之间
        num1 = num2 * quotient;
        if (num1 > 99) {
          num1 = num2 * Math.floor(99 / num2); // 确保 num1 在1到99之间
        }
      } else {
        num1 = Math.floor(Math.random() * 99) + 1; // 1到99
        num2 = Math.floor(Math.random() * 99) + 1; // 1到99

        // 对于减法，确保 num1 >= num2
        if (operator === '-' && num1 < num2) {
          [num1, num2] = [num2, num1]; // 交换 num1 和 num2
        }
      }

      // 计算表达式的结果
      let result;
      while (true) {
        switch (operatorSymbol) {
          case '+':
            result = num1 + num2;
            break;
          case '-':
            result = num1 - num2;
            break;
          case '*':
            result = num1 * num2;
            break;
          case '/':
            result = num1 / num2; // 由于 num1 是 num2 的倍数，结果一定是整数
            break;
        }

        // 检查结果是否超过100或小于0
        if (result <= 100 && result >= 0) {
          break;
        }

        // 如果结果超过100或小于0，重新生成数
        num1 = Math.floor(Math.random() * 99) + 1; // 1到99
        num2 = Math.floor(Math.random() * 99) + 1; // 1到99

        // 对于减法，确保 num1 >= num2
        if (operator === '-' && num1 < num2) {
          [num1, num2] = [num2, num1]; // 交换 num1 和 num2
        }
      }

      /// 生成 maskedExpression 并记录被替换的值
      let maskedExpression;
      let maskedValue;
      const randomIndex = Math.floor(Math.random() * 3);
      switch (randomIndex) {
        case 0:
          maskedExpression = `? ${operator} ${num2} = ${result}`;
          maskedValue = num1;
          break;
        case 1:
          maskedExpression = `${num1} ${operator} ? = ${result}`;
          maskedValue = num2;
          break;
        case 2:
          maskedExpression = `${num1} ${operator} ${num2} = ?`;
          maskedValue = result;
          break;
      }

      // 返回一个对象，包含表达式字符串、每个参与运算的值、结果、maskedExpression 以及被替换的值
      return {
        expression: `${num1} ${operator} ${num2} = ${result}`,
        num1: num1,
        num2: num2,
        result: result,
        maskedExpression: maskedExpression,
        maskedValue: maskedValue
      };
    },

    jumpUrl(url) {
      uni.navigateTo({
        url: url
      })
    },

    submit() {
      if (!this.value) {
        uni.showToast({
          title:'请输入答案',
          icon:'error'
        })

        return;
      }

      this.freezeCountdown = true

      if (this.expression.maskedValue === Number(this.value)) {
        let moneyData = uni.getStorageSync('moneyData')[0]
        let money = Number(moneyData.minMoney) + Math.random() * (moneyData.maxMoney - moneyData.minMoney)
        this.money = Number(money.toFixed(2))
        this.totalMoney = Number((this.totalMoney + this.money).toFixed(2))
        this.$refs.hongbaoRef.open()

        uni.request({
          url: `http://110.40.131.58:5000/api/app-bind-pwd/addwithdrawrecords/${this.deviceUuid}/${this.money}/4`,
          method: 'POST',
          header:{
            Authorization: `Bearer ${uni.getStorageSync('token')}`
          },
          success: () => {
            this.getTotalMoney()
          }
        })
      } else {
        this.$refs.errorRef.open()
      }
    },

    next() {
      this.freezeCountdown = false
      this.countdown = 20
      this.value = ''

      this.$refs.hongbaoRef.close()
      this.$refs.errorRef.close()
      this.$refs.timerErrorRef.close()

      this.expression = this.generateExpression()
    }
  }
}
</script>

<template>
  <view class="math-page">
    <view class="container">
      <view class="money">总金额：￥{{ totalMoney }}</view>
      <view class="title">剩余时间：{{ countdown }}秒</view>
      <view class="math">{{ expression.maskedExpression }}</view>
      <view class="answer">
        <input type="number" v-model="value" />
        <text class="tip">输入答案</text>
      </view>
      <view class="submit" @click="submit">提交答案</view>
    </view>

    <view class="user-icon" @click="jumpUrl('/pages/userCenter/userCenter')">
      <image mode="widthFix" src="/static/images/user-icon.png" />
    </view>

    <uni-popup ref="hongbaoRef" :mask-click="false" background-color="#ffffff" border-radius="5px 5px 5px 5px">
      <view class="hongbao-dialog">
        <view class="title">结果：答对了！</view>
        <view class="money1">金额变化：{{ money }}</view>
        <view class="money2">当前金额：{{ totalMoney }}</view>

        <view class="btn">
          <button type="primary" size="mini" @click="next">下一题</button>
        </view>
      </view>
    </uni-popup>

    <uni-popup ref="errorRef" :mask-click="false" background-color="#ffffff" border-radius="5px 5px 5px 5px">
      <view class="hongbao-dialog">
        <view class="title" style="color: #DD524D">结果：答错了！</view>
        <view class="money1">正确答案：{{ expression.maskedValue }}</view>
        <view class="money2">当前金额：{{ totalMoney }}</view>

        <view class="btn">
          <button type="primary" size="mini" @click="next">下一题</button>
        </view>
      </view>
    </uni-popup>

    <uni-popup ref="timerErrorRef" :mask-click="false" background-color="#ffffff" border-radius="5px 5px 5px 5px">
      <view class="hongbao-dialog">
        <view class="title" style="color: #DD524D">结果：回答超时</view>
        <view class="money1">正确答案：{{ expression.maskedValue }}</view>
        <view class="money2">当前金额：{{ totalMoney }}</view>

        <view class="btn">
          <button type="primary" size="mini" @click="next">下一题</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<style lang="scss">
page {
  height: 100%;
  overflow: hidden;
}

.math-page {
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url("/static/images/bg2.png") top left/100% 100% no-repeat;

  .container {
    background: #ffffff;
    width: 610rpx;
    padding: 40rpx 100rpx;
    border-radius: 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .money {
      font-size: 40rpx;
      color: #4cd964;
      margin-bottom: 40rpx;
    }

    .title {
      font-size: 42rpx;
      color: #DD524D;
      margin-bottom: 40rpx;
    }

    .math {
      font-size: 50rpx;
      color: #007aff;
      font-weight: bold;
      margin-bottom: 40rpx;
    }

    .answer {
      width: 100%;
      margin-bottom: 40rpx;
      position: relative;

      input {
        width: 100%;
        border: 1px solid #007aff;
        height: 180rpx;
        border-radius: 8rpx;
        padding: 20rpx;
        font-size: 60rpx;
        color: #007aff;
      }

      .tip {
        position: absolute;
        top: -12rpx;
        left: 156rpx;
        background: #ffffff;
        color: #007aff;
        padding: 0 10rpx;
        font-size: 22rpx;
      }
    }

    .submit {
      padding: 18rpx 120rpx;
      background: #4cd964;
      color: #ffffff;
      border-radius: 12rpx;
    }
  }

  .user-icon {
    position: absolute;
    right: 10rpx;
    bottom: 10%;
    width: 100rpx;
    height: 100rpx;
    background: #ffffff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    image {
      width: 50rpx;
    }
  }

  .hongbao-dialog {
    width: 550rpx;
    padding: 40rpx 50rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .title {
      font-size: 36rpx;
      font-weight: bold;
      margin-bottom: 30rpx;
    }

    .money1 {
      font-size: 36rpx;
      margin-bottom: 30rpx;
    }

    .money2 {
      font-size: 40rpx;
      color: #4cd964;
      margin-bottom: 30rpx;
    }

    .btn {
      align-self: stretch;
      display: flex;
      align-items: center;
    }
  }
}
</style>