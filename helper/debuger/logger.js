const chalk = require('chalk')
const moment = require('moment')
const Time = require('./../time')
const { isDev } = require('../variable')

const groupSize = 6
const scopeSize = 8
const groupPadding = (msg, size, pad) => {
  return msg.length > size ? msg.substr(0, size) : msg[pad](size, ' ')
}

const logWindows = (scope, icon, title, color, msg) => {
  let msg2 = [ chalk.gray(moment().format('HH:mm:ss.SSS')), color(icon) ]
  msg2.push(color(groupPadding(title, groupSize, 'padStart')))
  if (scope) {
    msg2.push(groupPadding(scope, scopeSize, 'padEnd'))
    msg2.push(chalk.cyan('»'))
  }
  console.log(...(msg2.concat(msg)))
}

const logLinux = (scope, icon, msg) => {
  let msg2 = [ moment().format('YYYY-MM-DD HH:mm:ss.SSS'), (!icon ? '…' : icon) ]
  if (scope) msg2.push(`[${scope.toUpperCase()}]`)
  console.log(...(msg2.concat(msg)))
}

module.exports = scopeName => {
  let measure = null
  return {
    log (...msg) {
      if (!isDev) return
      let msg2 = [ chalk.gray(moment().format('HH:mm:ss.SSS')), chalk.gray.bold('…') ]
      msg2.push(measure ? groupPadding(measure.nanoseconds(), groupSize, 'padStart') : chalk.gray.bold(groupPadding('debug', groupSize, 'padStart')))
      if (scopeName) {
        msg2.push(groupPadding(scopeName, scopeSize, 'padEnd'))
        msg2.push(chalk.cyan('»'))
      }
      console.log(...(msg2.concat(msg)))
    },
    start (...msg) {
      measure = new Time()
      if (isDev) logWindows(scopeName, '○', 'start', chalk.cyan.bold, msg); else logLinux(scopeName, '○', msg)
    },
    success (...msg) {
      if (measure) msg.push(`(${measure.total()})`)
      if (isDev) logWindows(scopeName, '●', 'success', chalk.green.bold, msg); else logLinux(scopeName, '●', msg)
      measure = null
    },
    warning (...msg) {
      if (isDev) logWindows(scopeName, '▲', 'warning', chalk.yellow.bold, msg); else logLinux(scopeName, '▲', msg)
      measure = null
    },
    info (...msg) {
      if (isDev) logWindows(scopeName, '╍', 'info', chalk.blue.bold, msg); else logLinux(scopeName, null, msg)
    },
    async error (ex) {
      if (!ex) return
      if (ex instanceof Error) {
        if (isDev) {
          const Youch = require('youch')
          let output = await new Youch(ex, {}).toJSON()
          console.log(require('youch-terminal')(output))
        } else {
          let excep = /at.*?\((.*?)\)/i.exec(ex.stack) || []
          logLinux(scopeName, 'х', [ ex.message.indexOf('Error:') === 0 ? ex.message.replace('Error:', 'ERROR-Message:') : `ERROR-Message: ${ex.message}` ])
          logLinux(scopeName, 'х', [ `ERROR-File: ${excep[1] ? excep[1] : 'N/A'}`, ex.message ])
          require('../raven').error(ex)
        }
      } else {
        let msg = [ ex.toString() ]
        if (measure) msg.push(`(${measure.total()})`)
        if (isDev) logWindows(scopeName, 'х', 'error', chalk.red.bold, msg); else logLinux(scopeName, 'х', msg)
      }
    }
  }
}
