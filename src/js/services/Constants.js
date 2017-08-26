(() => {
  window.angular.module('Faceply')
  .constant('Constants', {
    MOCK_USER: {
      LOGIN: 'test',
      PASSWORD: 'pass',
      USER_ID: '123123123'
    },
    REPLY_TIMEOUT_MIN: 5,
    REPLY_TIMEOUT_MAX: 300,
    REPLY_PROMOTION_PS: '\nReplied using https://faceply.io',
    ANALYTICS_ID: 'UA-96287398-2'
  })
})()
