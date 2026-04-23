# MyMealTracker (CS 1530 Project)

To run backend:

- cd ./api
- load env
  (Get-Content .env | ForEach-Object { $var = $_ -split '=', 2; [System.Environment]::SetEnvironmentVariable($var[0], $var[1]) }; ./gradlew bootRunO)
- ./gradlew clean build (for windows)
- ./gradlew bootRun
- Go to localhost:8080/ping to test

To run frontend:

- cd into ./frontend/my-app
- start phone on android studio or xcode
- npm install
- wait for phone to fully boot
- npm run android OR npm run ios
