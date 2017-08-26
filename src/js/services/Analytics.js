import Analytics from 'electron-google-analytics'

(() => {
  const AnalyticsService = (
    Constants,
    User
  ) => {
    const AnalyticsService = {}

    const analytics = new Analytics(Constants.ANALYTICS_ID)
    const domain = 'faceply://app'

    AnalyticsService.pageView = (page) => {
      return User.getID()
        .then(userID => {
          analytics.pageview(domain, page, page, userID)
        })
    }

    AnalyticsService.event = (category, action, label, value) => {
      return User.getID()
        .then(userID => {
          analytics.event(category, action, {
            evLabel: label,
            evValue: value,
            clientID: userID
          })
        })
    }

    return AnalyticsService
  }
  window.angular.module('Faceply')
    .service('Analytics', [
      'Constants',
      'User',
      AnalyticsService
    ])
})()
