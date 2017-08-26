(function () {
  const app = window.angular.module('Faceply', [

    'ngMaterial'
  ])

  app.config([
    '$locationProvider',
    '$mdThemingProvider',
    function (
      $locationProvider,
      $mdThemingProvider
    ) {
      $mdThemingProvider.theme('default')
        .primaryPalette('blue')
        .accentPalette('green')
        .warnPalette('red')
      // .dark()

      $locationProvider.hashPrefix('')
    }
  ])

  app.run(['$rootScope', function ($rootScope) {
    $rootScope.loggedIn = false
    $rootScope.loading = false
    $rootScope.loadingText = 'Loading'
  }])
})()
