(() => {
  const Logger = (
    $mdDialog
  ) => {
    const Logger = {}

    Logger.log = (log) => console.log(log)
    Logger.error = (err) => console.error(err)

    Logger.userError = (err) => {
      Logger.error(err)
      $mdDialog.show(
        $mdDialog.alert()
        .clickOutsideToClose(true)
        .title('Error')
        .textContent(typeof err === 'object' ? err.error : err)
        .ok('Close')
      )
    }

    return Logger
  }
  window.angular.module('Faceply')
    .service('Logger', [
      '$mdDialog',
      Logger
    ])
})()
