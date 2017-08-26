(() => {
  const FacebookUsers = (
    Facebook,
    $q,
    Logger
  ) => {
    const FacebookUsers = {}

    FacebookUsers.getInfo = (ids) => {
      return Facebook.api('getUserInfo', [ids])
        .then(infos => {
          console.log(infos)
          Object.keys(infos).forEach(id => {
            infos[id].id = id
          })
          return $q.resolve(Array.isArray(ids) ? infos : infos[ids])
        })
    }

    return FacebookUsers
  }

  window.angular.module('Faceply')
    .service('FacebookUsers', [
      'Facebook',
      '$q',
      'Logger',
      FacebookUsers
    ])
})()
