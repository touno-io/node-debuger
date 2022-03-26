const debuger = require('../index')

const test = async () => {
  logger = debuger('test')
  logger.start('start message.')
  logger.log('log message.')
  logger.log({ data: 'aasdasd', config: { a: 'a', b: 'b' }, array: [ 'aaaa']})
  logger.info('info message.')
  logger.error(new Error('error message.'))

  try {
    throw new Error('Error')
  } catch (ex) {
    logger.error(ex)
  }
  try {
    throw new Error('Error')
  } catch (ex) {
    logger.error(ex)
  }
  logger.wait()

  let i = 0
  let id = setInterval(() => {
    logger.increment(10)
    i++
    if (i === 10) {
      logger.stop()
      logger.success('success message.')
      clearInterval(id)
      process.exit()
    }
  }, 100)
}

test()
