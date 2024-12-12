# Prerequisites for the demo
* Make sure you have Java 21 installed on your machine
* Postman (Optional) to check backend apis
* Android Studio (Optional) to run the demo on an android emulator

# Starting the Server
* Open Terminal
* Make sure you are in the demo folder
* run ./gradlew bootRun
* This will start the spring boot project on port 8080 of the localhost

# Docker (Optional)
* You can start the server using docker image as well
* Make sure docker is in the running state
* run the following commands
* docker build -t study-sync .
* docker run -d -p 8080:8080 --name my-springboot-container study-sync

# Navigating through the application
* Open the browser and visit http://localhost:8080
* This is a single page application
* Please allow notification permissions

# CRUD operations
* You can add new flashcards by using the + Add button
* The flashcards are displayed right away
* You can check the question and answers by flipping the flashcards
* This can be done by clicking on the flashcards
* You can navigate through different flashcards by using the next and back buttons
* You can delete a flashcard by clicking on the delete icon on the top right corner of a card

# Optional
* Import the postman collection flashcard.postman_collection.json into the Postman application
* You can check the apis directly to see the cards and delete them

# PWA 
* You can check the cache functionality by turning off the internet (This can be done by selecting the option in developer console of chrome as offline)
* The app will still work as expected
* You can create card and delete cards in the offline mode
* How ever the postman collection won't be showing latest state
* But as soon as you turn the internet on, the data will be synced to the backend and postman will reflect the same

# Reminder
* Make sure you have the notifications turned on
* Click on the bell icon
* You will be prompted to add a reminder timing
* As you enter the time. 
* A push notification will be trigger by the browser with the text "Time to study"

# Android Mobile Simulation (Optional) This will work with chrome browser
* On your browser go to chrome://inspect/#devices
* Make sure port forwarding is on. If not check the enable port forwarding box
* Go to virtual Device manager on you Android studio home screen
* Add a new device, any device of your choice - Eg. Pixel 8
* Choose a system image or download one
* Start the Android Virtual Device
* Visit the site localhost:8080
* You should see the application working on the simulator


