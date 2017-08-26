(function () {
  const Loading = (
    $rootScope,
    $mdDialog
  ) => {
    const Loading = {}

    let loadingScope = null

    Loading.show = (prompt) => {
      $mdDialog.show({
        template: `
        <div layout="column" layout-align="center center" layout-padding>
          <md-progress-circular md-mode="indeterminate" layout-margin md-diameter="70"></md-progress-circular>
          <h4>${prompt}</h4>
        </div>`,
        escapeToClose: false,
        multiple: false
      })
    }

    Loading.showProgress = (prompt) => {
      $rootScope.loadingProgressValue = 1
      $mdDialog.show({
        controller: ($scope) => {
          $scope.loadingProgressValue = 1
          loadingScope = $scope
        },
        template: `
          <div layout="column" layout-align="center center" layout-padding>
            <md-progress-circular md-mode="determinate" layout-margin value="{{loadingProgressValue}}"></md-progress-circular>
            <h4>${prompt}</h4>
         </div>`,
        escapeToClose: false,
        multiple: false
      })
    }

    Loading.setProgress = (proc) => {
      if (loadingScope) loadingScope.loadingProgressValue = proc
    }

    Loading.hide = () => {
      $mdDialog.hide()
    }

    return Loading
  }

  window.angular.module('Faceply')
    .service('Loading', [
      '$rootScope',
      '$mdDialog',
      Loading
    ])
})()
