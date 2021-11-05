# NextsearchBackend
How to run the NEXTSEARCH backend.

## Installation
Run `npm install` to install local dependencies.

## Run development server
Run `npm run dev`. The default port is 3000. 
If you want to change the port, do like so:
`$ PORT=XXX npm run dev`

## Run production server
Run `npm run prod`. The default port is 3000.
If you want to change the port, do like so:
`$ PORT=XXX npm run dev`

## Configurations
In the root folder you can find a .env file with all the necessary configurations. Don't touch the config files in the config folder. Change the .env file and put there your:
- Bing API Key
- Cloud Function URLS
- GCloud Token for authentication
- IBM Object Storage endpoint URL
- IBM Object Storage API Key
- IBM Object Storage Bucket name

## Endpoints
After starting the server, you're able to reach the following endpoints:

- `http://localhost:YOUR_PORT/search`
    - input parameters: query (string), bingApiKey (string)
    - return value: from the getKeywords Cloud Function


- `http://localhost:YOUR_PORT/results` 
    - input parameters: pendingUrls (string)
    - return value: results[], pendingUrls[]

## Switch to monolithic architecture
Switch branch from master to use-cases/local:
`git switch use-cases/local`