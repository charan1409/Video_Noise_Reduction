This website is for removing noise from video by giving google drive URL of that video.

GETTING STARTED
  After cloning the project open in any IDE
  And open two seperate terminals
  In each terminal, cd into the client and server folders respectively.
  In both folders, run npm install to install the required dependencies.
  In both terminals, run npm start to start the client and server.
  
CONFIGURATION
  Create an .env file in server folder
  And provide the details for mongodb and google api key like this
  MONGO_DB = 'YOUR MONGODB LINK HERE'
  GOOGLE_DRIVE_API_KEY = 'YOUR API KEY HERE'
  And also make sure that you have installed ffmpeg and redis in your system
  And the redis should running
  
That's it you can work with the project.
