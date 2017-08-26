(() => {
  const Groups = (
    Storage,
    Threads,
    $q,
    Utilities
  ) => {
    const Groups = {}

    Groups.createInitialGroups = () => {
      return Threads.getAll()
        .then((threads) => {
          const groups = []
          const multiUserThreads = threads.filter(thread => !thread.isCanonical)
          const singleUserThreads = threads.filter(thread => thread.isCanonical)

          const multiUserThreadsGroup = Groups.new()
          multiUserThreadsGroup.name = 'All Group Chats'
          multiUserThreadsGroup.replyMessage = 'Hey there everyone, I am busy at the moment. I will join the chat a bit later.'
          multiUserThreadsGroup.threads = multiUserThreads.map(thread => thread.threadID)

          const singleUserThreadsGroup = Groups.new()
          singleUserThreadsGroup.name = 'All Friends'
          singleUserThreadsGroup.threads = singleUserThreads.map(thread => thread.threadID)

          groups.push(singleUserThreadsGroup)
          groups.push(multiUserThreadsGroup)

          return $q.resolve(groups)
        })
    }

    Groups.new = () => {
      const defaultGroup = {
        enabled: false,
        name: 'New Group',
        replyMessage: 'Hi, I am busy at the moment. I will reply to you later. Thanks',
        replyTimeout: 60,
        threads: []
      }

      const group = Object.assign({}, defaultGroup)
      group.id = Utilities.UUID()
      return group
    }

    return Groups
  }

  window.angular.module('Faceply')
    .service('Groups', [
      'Storage',
      'Threads',
      '$q',
      'Utilities',
      Groups
    ])
})()
