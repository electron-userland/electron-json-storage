const t = require('tap')
const platforms = ['win32', 'darwin', 'linux']
const process_ = global.process
for (const platform of platforms) {
  t.test(platform, t => {
    global.process = { ...process_, platform }
    t.equal(process.platform, platform)
    t.matchSnapshot(t.mock('../signals.js'))
    global.process = process_
    t.end()
  })
}
