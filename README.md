# abitti2-marvinjs

Dockerized MarvinJS

## Development

To pull the official image, please `docker login` to hub.chemaxon.com

Set environment variable `CHEMAXON_LICENSE_SERVER_KEY` to contain your Chemaxon license server key.

Then run the following commands:

```
npm run docker:build
npm run docker:run
```