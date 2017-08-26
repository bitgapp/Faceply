(() => {
  const electronStorage = require('electron-json-storage')

  const Storage = (
    $q
  ) => {
    const Storage = {}

    Storage.get = (key) => {
      const q = $q.defer()
      electronStorage.get(key, (err, data) => {
        if (err) return q.reject(err)
        q.resolve(data) // will return {} if not exissts
      })
      return q.promise
    }

    Storage.getMany = (keys) => {
      const q = $q.defer()
      electronStorage.getMany(keys, (err, data) => {
        if (err) return q.reject(err)
        q.resolve(data)
      })
      return q.promise
    }

    Storage.getAll = () => {
      const q = $q.defer()
      electronStorage.getAll((err, data) => {
        if (err) return q.reject(err)
        q.resolve(data)
      })
      return q.promise
    }

    Storage.set = (json, key) => {
      const q = $q.defer()
      electronStorage.set(key, json, (err) => {
        if (err) return q.reject(err)
        q.resolve(null)
      })
      return q.promise
    }

    Storage.has = (key) => {
      const q = $q.defer()
      electronStorage.has(key, (err, has) => {
        if (err) return q.reject(err)
        q.resolve(has)
      })
      return q.promise
    }

    Storage.keys = () => {
      const q = $q.defer()
      electronStorage.keys((err, keys) => {
        if (err) return q.reject(err)
        q.resolve(keys)
      })
      return q.promise
    }

    Storage.remove = (key) => {
      const q = $q.defer()
      electronStorage.remove(key, (err) => {
        if (err) return q.reject(err)
        q.resolve(null)
      })
      return q.promise
    }

    Storage.clear = () => {
      const q = $q.defer()
      electronStorage.clear((err) => {
        if (err) return q.reject(err)
        q.resolve(null)
      })
      return q.promise
    }

    return Storage
  }

  window.angular.module('Faceply')
    .service('Storage', [
      '$q',
      Storage
    ])
})()
