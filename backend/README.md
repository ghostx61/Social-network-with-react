# Social Network

A small social media project 


## Live Demo

This project is deployed on heroku. To see the app working, go to https://glacial-spire-21909.herokuapp.com

## Required Installations

* __Node.js:__ [download link](https://nodejs.org)
* __MongoDB:__ [download link](https://www.mongodb.com/download-center/community)


## Getting Started 

1. Clone or download this repository

    ```
    git clone https://github.com/ghostx61/Social_Network.git
    ```

2.  Create a cloudinary account [here](https://cloudinary.com). Cloudinary will be used to store images.

3. Create an `.env` file in the project directory.

4. Open the `.env` file and add your cloudinary `Api key` and `Api Secret key` as shown below.
 
   ```
   CLOUDINARY_API_KEY=<your api key goes here>
   CLOUDINARY_API_SECRET=<your api secret key goes here>
    ```

5. Open terminal and navigate to the bin folder of mongodb folder, and run command `mongod`. This will start the mongoDB server.

6. Open a new terminal and navigate to the project folder and run command `node app.js`. 

7. The project is now running on your machine on port 3000. Open this link in your browser: http://localhost:3000  