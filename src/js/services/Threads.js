(() => {
  const Threads = (
    Facebook,
    $q,
    FacebookUsers,
    Storage,
    User
  ) => {
    const Threads = {}
    let threadCache = null

    Threads.getAll = () => {
      const q = $q.defer()
      if (threadCache) {
        const threads = []
        Object.keys(threadCache).forEach(threadID => threads.push(threadCache[threadID]))
        q.resolve(threads)
      } else {
        Facebook.api('getThreadList', [0, 1000])
          .then(threads => {
            threads = threads.filter(thread => (thread.canReply && User.getFacebookID() !== thread.threadID))
            threadCache = {}
            let threadsComplete = 0
            const promises = threads.map(thread => {
              threadCache[thread.threadID] = thread
              if (thread.isCanonical) {
                return FacebookUsers.getInfo(thread.threadID)
                .then(userInfo => {
                  threadCache[thread.threadID] = Object.assign(threadCache[thread.threadID], userInfo)
                  threadsComplete++
                  q.notify(threadsComplete * 100 / threads.length)
                  return $q.when()
                }, $q.when)
              }
              return $q.when()
            })

            $q.all(promises)
              .then(Threads.getAll)
              .then(q.resolve, q.reject)
          }, q.reject)
      }
      return q.promise
    }

    return Threads
  }
  window.angular.module('Faceply')
    .service('Threads', [
      'Facebook',
      '$q',
      'FacebookUsers',
      'Storage',
      'User',
      Threads
    ])
})()
