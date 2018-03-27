trueEX/truePTS Coding Exercise for UI Software Engineers
========================================================

1. Setup Instructions

Start off with the usual:

`npm install`

To run the data-streaming service, run the following command: 

`npm run start-streamer`

This will start up the streaming service on port 3030. Build the UI, and start it up with:

`npm run build`
`npm run start-prod`

The web application will then be available at http://localhost:8080
The core of the application is in the src/ folder (this is the only place you should need to make changes in). The front-end main file is src/client.js 

2. Requirements

* The data-streaming service sends data exactly every 200ms, with a random set of updates. This is way too high an update rate for users to be able to keep
 track of. Implement a throttling mechanism on the UI (using lodash.throttling does not count as implementing...) to only update entries in the table at most twice a second. 
  
* Even with updates being rendered less often, it is still difficult to keep track of number trends. Implement a visual mechanism whereby if a number in a cell increases,
 the foreground color of that number becomes green, if the number decreases make the foreground color red.  
 
* Implement a reconnection mechanism to handle streaming-service disconnects (you can kill and restart the data-streaming service to simulate this...)

* Document any assumptions you have made