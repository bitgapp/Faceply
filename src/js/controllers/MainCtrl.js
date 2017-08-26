(function () {
  const MainCtrl = function (
    Facebook,
    $rootScope,
    Storage,
    Logger,
    $q,
    Loading,
    User,
    Groups,
    FacebookUsers,
    Threads,
    $mdDialog,
    $mdToast,
    Constants,
    Analytics
  ) {
    const mc = this

    mc.user = null
    mc.groups = []
    mc.selectedGroup = null
    mc.threads = []
    mc.users = {}
    mc.search = null
    mc.currentUserID = null
    const lastReplies = {}
    const threadPromoted = {}

    $rootScope.$on('loggedIn', () => {
      mc.currentUserID = User.getFacebookID()
      if (mc.currentUserID) {
        Analytics.pageView('/main').then(console.log, console.error)
        Loading.showProgress('Loading Data...')
        $q.all([
          getAllThreads(),
          getUserInfo()
        ])
          .then(User.isFirstFacebookLogin)
          .then(getUserGroups)
          .then(() => {
            startListening()
            getUserInfos()
            if (mc.groups.length > 0) mc.selectGroup(mc.groups[0])
            Loading.hide()
          }).catch(handleError)
      } else {
        handleError('Cant get User ID')
      }
    })

    const handleError = (err) => {
      console.error(err)
      Logger.userError(err)
    }

    const getAllThreads = () => {
      return Threads.getAll()
        .then(threads => {
          Loading.hide()
          console.log(threads)
          mc.threads = threads
          return $q.resolve(threads)
        }, $q.reject, Loading.setProgress)
    }

    const getUserInfo = () => {
      return FacebookUsers.getInfo(mc.currentUserID)
        .then(userInfo => {
          console.log(userInfo)
          mc.user = userInfo
          return $q.resolve(userInfo)
        })
    }

    const getUserGroups = (isFirstLogin) => {
      console.log(isFirstLogin)
      return (() => isFirstLogin ? Groups.createInitialGroups() : User.getGroups())()
        .then(groups => {
          mc.groups = groups
          console.log(groups)
          mc.saveUserGroups()
          return $q.resolve(groups)
        })
    }

    const startListening = () => {
      Facebook.startReceivingMessages((message) => {
        const threadID = message.threadID
        const group = mc.groups.find(group => (group.enabled && group.threads.includes(threadID)))
        if (group) {
          if (isNaN(group.replyTimeout) || group.replyTimeout < Constants.REPLY_TIMEOUT_MIN) group.replyTimeout = Constants.REPLY_TIMEOUT_MIN
          if (group.replyTimeout > Constants.REPLY_TIMEOUT_MAX) group.replyTimeout = Constants.REPLY_TIMEOUT_MAX
          if (lastReplies.hasOwnProperty(threadID)) {
            if ((new Date().getTime() - lastReplies[threadID]) < (group.replyTimeout * 1000)) return
          }
          lastReplies[threadID] = new Date().getTime()

          const thread = mc.threads.find(thread => thread.threadID === threadID)
          const chatName = thread.name

          Facebook.api('sendMessage', [group.replyMessage, threadID])
          if (!threadPromoted.hasOwnProperty(threadID)) {
            threadPromoted[threadID] = true
            Facebook.api('sendMessage', [Constants.REPLY_PROMOTION_PS, threadID])
            Analytics.event('App', 'Promotion', thread.isCanonical ? 'friend' : 'group', thread.participantIDs.length - 1)
          }

          Analytics.event('App', 'Reply', thread.isCanonical ? 'friend' : 'group', 1)

          if (chatName) {
            $mdToast.show(
              $mdToast.simple()
              .textContent(`Replied to: ${chatName}`)
              .position('bottom left')
              .hideDelay(2000)
            )
          }
        }
      })
    }

    const getUserInfos = () => {
      mc.threads.forEach(thread => {
        thread.participantIDs.forEach(participantID => {
          if (!mc.users.hasOwnProperty(participantID)) {
            FacebookUsers.getInfo(participantID)
              .then(userInfo => {
                mc.users[participantID] = userInfo
              })
          }
        })
      })
    }

    mc.saveUserGroups = () => {
      return User.saveGroups(mc.groups)
    }

    mc.selectGroup = (group) => {
      mc.groups.forEach(group => {
        group.selected = false
      })
      group.selected = true
      mc.selectedGroup = group
    }

    mc.addGroup = () => {
      $mdDialog.show(
        $mdDialog.prompt()
        .title('New Group')
        .textContent('Enter new Group name:')
        .placeholder('Group Name')
        .initialValue('New Group')
        .ok('Add')
        .cancel('Cancel')
      ).then(name => {
        if (name) {
          const newGroup = Groups.new()
          newGroup.name = name
          mc.groups.push(newGroup)
          mc.saveUserGroups()
        }
      })
    }

    mc.editSelectedGroupName = () => {
      $mdDialog.show(
        $mdDialog.prompt()
        .title('Edit Group')
        .textContent('Enter Groups new name:')
        .placeholder('Group Name')
        .initialValue(mc.selectedGroup.name)
        .ok('Save')
        .cancel('Cancel')
      ).then(name => {
        if (name) {
          mc.selectedGroup.name = name
          mc.saveUserGroups()
        }
      })
    }

    mc.deleteSelectedGroup = () => {
      $mdDialog.show(
        $mdDialog.confirm()
        .title('Delete Group')
        .textContent(`Are you sure you want to delete ${mc.selectedGroup.name}?`)
        .ok('Yes')
        .cancel('Cancel')
      ).then(() => {
        mc.groups.forEach((group, i) => {
          if (group.id === mc.selectedGroup.id) {
            mc.groups.splice(i, 1)
            if (mc.groups[i]) {
              mc.selectGroup(mc.groups[i])
            } else if (mc.groups[i - 1]) {
              mc.selectGroup(mc.groups[i - 1])
            } else if (mc.groups.length > 0) {
              mc.selectGroup(mc.groups[0])
            } else if (mc.groups.length === 0) {
              mc.selectedGroup = null
            }
          }
        })
        mc.saveUserGroups()
      })
    }

    mc.otherGroupIncludesThread = (thread) => {
      for (let i = 0; i < mc.groups.length; i++) {
        if (mc.groups[i].id === mc.selectedGroup.id) continue
        if (mc.groups[i].threads.includes(thread.threadID)) return true
      }
      return false
    }

    mc.addThreadToSelectedGroup = (thread) => {
      const indexOfThread = mc.selectedGroup.threads.indexOf(thread.threadID)
      if (indexOfThread > -1) {
        mc.selectedGroup.threads.splice(indexOfThread, 1)
        mc.saveUserGroups()
      } else if (mc.otherGroupIncludesThread(thread)) {
        $mdDialog.show(
          $mdDialog.confirm()
          .title('This Chat is added to another Group')
          .textContent(`Do you want to move this chat to this Group?`)
          .ok('Yes, Move')
          .cancel('Cancel')
        ).then(() => {
          const housingGroup = mc.groups.find(group => group.threads.includes(thread.threadID))
          if (housingGroup) {
            const indexInHousingGroup = housingGroup.threads.indexOf(thread.threadID)
            housingGroup.threads.splice(indexInHousingGroup, 1)
            mc.selectedGroup.threads.push(thread.threadID)
            mc.saveUserGroups()
          }
        }, console.error)
      } else {
        mc.selectedGroup.threads.push(thread.threadID)
        mc.saveUserGroups()
      }
    }

    mc.getThreadImage = (thread) => {
      return thread.imgSrc || thread.thumbSrc
    }

    mc.getUserImageById = (userID) => {
      return mc.users[userID].thumbSrc || 'img/fb_avatar.jpg'
    }

    mc.getThreadParticipantIDs = (thread) => {
      return thread.participantIDs.filter(id => id !== mc.currentUserID)
    }

    mc.getThreadName = (thread) => {
      if (thread.isCanonical) return thread.name

      let name = ''
      if (thread.name && thread.name !== '') name = thread.name + ' ('
      let ids = thread.participantIDs
        .filter(userID => (userID !== mc.currentUserID && mc.users.hasOwnProperty(userID)))
      name += ids.map(userID => mc.users[userID].name)
        .sort((a, b) => a > b ? 1 : -1)
        .join(', ')
      if (thread.name && thread.name !== '') name += ')'
      return name
    }

    mc.logout = () => {
      Facebook.logout()
    }
  }

  window.angular.module('Faceply')
    .controller('MainCtrl', [
      'Facebook',
      '$rootScope',
      'Storage',
      'Logger',
      '$q',
      'Loading',
      'User',
      'Groups',
      'FacebookUsers',
      'Threads',
      '$mdDialog',
      '$mdToast',
      'Constants',
      'Analytics',
      MainCtrl
    ])
})()
