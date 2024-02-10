import dnssd from 'dnssd'
import express from 'express'
import morgan from 'morgan'
import { createProxyMiddleware } from 'http-proxy-middleware'

interface AppParams {
  port: number
}

export default function createMarvinJSApp(args: AppParams) {
  const root = '/apps/marvinjs'

  const ad = new dnssd.Advertisement('_http._tcp', args.port, {
    name: 'MarvinJS',
    txt: { path: '/.well-known/appspecific/dev.abitti.json' }
  })

  const app = express()
  app.use(morgan('combined'))

  app.use('/.well-known/appspecific/dev.abitti.json', (req, res) =>
    res.json({
      marvinjs: {
        name: 'MarvinJS',
        path: `${root}/`,
        filetypes: [{ mime: 'chemical/x-chemaxon-marvinfile', glob: '*.mrv' }, { glob: '*.mrv' }]
      }
    })
  )

  app.use(
    root,
    createProxyMiddleware({
      target: 'http://localhost:8080/',
      pathRewrite: { '^/apps/marvinjs/': '' },
      onProxyRes: (proxyRes, _req, _res) => {
        if (proxyRes.statusCode === 302 && proxyRes.headers['location']) {
          const location = proxyRes.headers['location']
          console.log('location:', location)
          proxyRes.headers['location'] = `/apps/marvinjs/${location}`
        }
      }
    })
  )

  const server = app.listen(args.port)
  ad.start()
  server.on('close', () => ad.stop())
  return server
}
