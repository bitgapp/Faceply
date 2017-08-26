(() => {
  const FacebookMockAPI = (
    $q,
    Constants,
    $interval,
    $timeout
  ) => {
    const FacebookMockAPI = {}

    const users = {
      '345234523452': {
        name: 'Bill Gates',
        thumbSrc: 'https://pbs.twimg.com/profile_images/889736688624312321/xVAFH9ZH_400x400.jpg'
      },
      '739392342543': {
        name: 'Elon Musk',
        thumbSrc: 'https://pbs.twimg.com/profile_images/782474226020200448/zDo-gAo0_400x400.jpg'
      },
      '132989046432': {
        name: 'Jonathan Ive',
        thumbSrc: 'http://www.socialgazelle.com/wp-content/uploads/2012/05/jonathan-ive.jpg'
      },
      '293762938791': {
        name: 'Sundar Pichai',
        thumbSrc: 'https://pbs.twimg.com/profile_images/864282616597405701/M-FEJMZ0_400x400.jpg'
      }
    }

    users[Constants.MOCK_USER.USER_ID] = {
      name: 'Mark Zuckerberg',
      thumbSrc: 'https://scontent-lhr3-1.xx.fbcdn.net/v/t34.0-1/p320x320/16176889_112685309244626_578204711_n.jpg?oh=96ad261e148aba31d2e1f5231db52bc1&oe=59A0F867'
    }

    const threads = []
    Object.keys(users).forEach(userID => {
      threads.push({
        threadID: userID,
        name: users[userID].name,
        participantIDs: [userID, Constants.MOCK_USER.USER_ID],
        imageSrc: null,
        isCanonical: true,
        canReply: true
      })
    })

    const userCombosDone = {}

    Object.keys(users)
      .filter(userID => userID !== Constants.MOCK_USER.USER_ID)
      .forEach(user1ID => {
        Object.keys(users)
          .filter(user2ID => user1ID !== user2ID)
          .forEach(user2ID => {
            if (!userCombosDone.hasOwnProperty(`${user1ID}#${user2ID}`)) {
              threads.push({
                threadID: Constants.MOCK_USER.USER_ID + user1ID + user2ID,
                name: null,
                participantIDs: [Constants.MOCK_USER.USER_ID, user1ID, user2ID],
                imageSrc: null,
                isCanonical: false,
                canReply: true
              })

              userCombosDone[`${user1ID}#${user2ID}`] = true
              userCombosDone[`${user2ID}#${user1ID}`] = true
            }
          })
      })

    FacebookMockAPI.getCurrentUserID = () => Constants.MOCK_USER.USER_ID

    FacebookMockAPI.getThreadList = () => {
      const q = $q.defer()
      $timeout(() => {
        q.resolve(threads)
      }, 1000)
      return q.promise
    }

    FacebookMockAPI.getUserInfo = (ids) => {
      const result = {}
      if (Array.isArray(ids)) {
        ids.forEach(id => {
          result[id] = users[id]
        })
      } else {
        result[ids] = users[ids]
      }

      return $q.resolve(result)
    }

    FacebookMockAPI.listen = (cb) => {
      $interval(() => {
        const thread = threads[Math.floor(Math.random() * threads.length)]
        cb(null, {
          threadID: thread.threadID,
          body: 'Message from Random Thread'
        })
      }, 5000)
    }

    FacebookMockAPI.sendMessage = (message, threadID) => $q.resolve()

    FacebookMockAPI.markAsRead = (threadID) => $q.resolve()

    return FacebookMockAPI
  }
  window.angular.module('Faceply')
    .service('FacebookMockAPI', [
      '$q',
      'Constants',
      '$interval',
      '$timeout',
      FacebookMockAPI
    ])
})()
