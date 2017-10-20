/*

Slash Webtasks: Extend Slack with Node.js, powered by Auth0 Webtasks (https://webtask.io)
For documentation, go to https://github.com/auth0/slash
You can find us on Slack at https://webtask.slack.com (join via http://chat.webtask.io)

*/

const baseUrl = 'https://name-of-your-slack.slack.com/api/'

const slackApi = {
  channels: baseUrl + 'channels.info',
  users: baseUrl + 'users.info'
}

const querystring = require('querystring')
const axios = require('axios')

module.exports = (ctx, cb) => {
  // TIPS:
  // 1. Input and output: https://github.com/auth0/slash#inputs-and-outputsresponse_urlresponse_url
  // 2. Response formatting: https://api.slack.com/docs/messages/builder
  // 3. Secrets you configure using the key icon are available on `ctx.secrets`

    cb(null, { text: `Hello, Let me calculate who should pair program...beep boop!` })

    const token = ctx.data['pairbot-secret']
    const channel = ctx.body.channel_id

    getSlackInfo(slackApi.channels, {token, channel})
    .then(res => getChanelUsers(res.data))
    .then(chanelMembers => Promise.all(
      chanelMembers.map( member => getSlackInfo(slackApi.users, {user: member, token}))
    ))
    .then(res => generateMessage(res))
    .then(message => axios.post(ctx.body.response_url, { text: message, response_type: 'in_channel' }))
    .catch(err =>console.log('Error:', err))
}

function getSlackInfo(url, data) {
  if (!url)
    return Promise.reject('No url passed!')

  // Slack API only takes x-www-form-urlencoded calls
  // This is a hack to get them.
  return axios.post(
    url,
    querystring.stringify(data),
    {headers: {"Content-Type": "application/x-www-form-urlencoded" }}
  )
}

function getChanelUsers(channelInfo) {
  const members = channelInfo.channel.members
  const len = members.length
  return [ members[getRandom(len)], members[getRandom(len)] ]
}

function generateMessage(users) {
  return users.map( user => '@' + user.data.user.name).join(' and ')
}

function getRandom(length) {
  return Math.floor(Math.random() * length)
}
