import * as http from 'http'
import * as fs from 'fs'
import * as p from 'path'
import * as url from 'url'

const server = http.createServer()
const publicPath = p.resolve(__dirname, 'public')
const cacheAge = 3600 * 24 * 365

server.on('request', (request: http.IncomingMessage, response: http.ServerResponse) => {
  const { url: path, method } = request
  console.log(method)
  if (method != 'GET') {
    response.statusCode = 200
    response.end('this is a fake response')
    return
  }
  const { pathname } = url.parse(path)
  const fileName = pathname.substr(1)
  fs.readFile(p.resolve(publicPath, fileName), (err, data) => {
    console.log(err)
    if (err) {
      switch (err.errno) {
        case -4058:
          response.statusCode = 404
          fs.readFile(p.resolve(publicPath, '404.html'), (err, data) => {
            response.end(data)
          })
          break;
        case -4068:
          response.statusCode = 405
          response.end('No right to visit dir')
          break;
        default:
          response.statusCode = 500
          response.end('Server busy')
      }
    } else {
      response.setHeader('Cache-Control', `public, max-age=${cacheAge}`)
      response.end(data)
    }
  })
})

server.listen(8888)