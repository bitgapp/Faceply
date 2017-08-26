(() => {
  const User = (
    Facebook,
    Storage,
    $q,
    Utilities
  ) => {
    const User = {}

    User.getFacebookID = () => Facebook.api('getCurrentUserID')

    User.getID = () => {
      return Storage.get('user')
      .then(user => {
        if (!user.hasOwnProperty('ID')) {
          user.ID = Utilities.UUID()
          Storage.set(user, 'user')
        }

        return $q.resolve(user.ID)
      })
    }

    User.isFirstFacebookLogin = () => {
      const ID = `${User.getFacebookID()}`

      const handle = (exists) => {
        if (exists === true) {
          return $q.resolve(false)
        } else {
          Storage.set({
            fistLogin: new Date()
          }, ID)
          return $q.resolve(true)
        }
      }

      return Storage.has(ID)
      .then(handle, handle)
    }

    User.getGroups = () => {
      return Storage.get(`${User.getFacebookID()}-groups`)
    }

    User.saveGroups = (groups) => {
      if (!Array.isArray(groups)) return $q.reject('Could not set groups, entity must be an array')
      return Storage.set(groups, `${User.getFacebookID()}-groups`)
    }

    return User
  }

  window.angular.module('Faceply')
  .service('User', [
    'Facebook',
    'Storage',
    '$q',
    'Utilities',
    User
  ])
})()
