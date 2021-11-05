# NextsearchFrontend

Keep it mind that you need to have a running backend service in parallel.

## Install
Run `npm install -g @angular/cli` to make ng globally available.
Run `npm install` to install project dependencies.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/` to see the frontend in your browser.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Measure
Type any search query and start the lookup. Open your developer tools and have a look for results[] in the console or in the network tab (occurs on both). In this array you can find the executionTime, showing the needed time for each Cloud Function.