(() => {
  const fb = require('facebook-chat-api')
  let api = null

  const Facebook = (
    $q,
    $timeout,
    $rootScope,
    Storage,
    Logger,
    Constants,
    FacebookMockAPI
  ) => {
    const Facebook = {}

    Facebook.loggedIn = () => {
      $rootScope.loggedIn = !!api
      return $rootScope.loggedIn
    }

    Facebook.login = (login, password) => {
      const q = $q.defer()

      if (login === Constants.MOCK_USER.LOGIN && password === Constants.MOCK_USER.PASSWORD) {
        api = FacebookMockAPI
        return $q.resolve()
      }

      fb({
        email: login,
        password: password,
        forceLogin: true
      }, (err, FB_API) => {
        $timeout(() => {
          if (!err) {
            api = FB_API
            if (Facebook.loggedIn()) {
              q.resolve()
            } else {
              q.reject()
            }
          } else {
            q.reject(err)
          }
        }, 0)
      })
      return q.promise
    }

    Facebook.startReceivingMessages = (cb) => {
      api.listen((err, message) => {
        $timeout(() => {
          if (err) return Logger.error(err)
          cb(message)
        }, 0)
      })
    }

    Facebook.api = (functionName, args) => {
      const q = $q.defer()

      if (Facebook.loggedIn()) {
        if (typeof functionName !== 'string') return $q.reject('Facebook API: Function name must be a String')
        if (!api.hasOwnProperty(functionName)) return $q.reject(`Facebook API: Function named: ${functionName} is not implemented`)
        args = Array.isArray(args) ? args : []

        args.push((err, data) => {
          $timeout(() => {
            if (!err) {
              q.resolve(data)
            } else {
              q.reject(err)
            }
          }, 0)
        })

        const result = api[functionName].apply(null, args)
        if (result) return result
      } else {
        q.reject('Logged out')
      }
      return q.promise
    }

    Facebook.logout = () => {
      $rootScope.loggedIn = false
      api = null
    }

    return Facebook
  }

  window.angular.module('Faceply')
    .service('Facebook', [
      '$q',
      '$timeout',
      '$rootScope',
      'Storage',
      'Logger',
      'Constants',
      'FacebookMockAPI',
      Facebook
    ])
})()
