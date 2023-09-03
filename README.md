# Social Network

A small social media project build with MERN stack.


## Live Demo

This project is deployed on render.com. To see the app working, go to [link](https://social-network-mern-4qoh.onrender.com/)

## Required Installations

* __Node.js:__ [download link](https://nodejs.org)


## Getting Started 

1. Clone or download this repository

    ```
    git clone https://github.com/ghostx61/Social-network-with-react.git
    ```

2.  Create a cloudinary account [here](https://cloudinary.com). Cloudinary will be used to store images.

3.  Create a Mongodb atlas account [here]([https://cloudinary.com](https://www.mongodb.com/products/platform/cloud)). Mongodb atlas will host our mongodb database.

4. Create a file `.env` in the backend folder and set environment variables as shown below.
 
   ```
   ENVIRONMENT=dev
   CLOUDINARY_CLOUD_NAME=<your cloudinary account name goes here>
   CLOUDINARY_API_KEY=<your cloudinary api key goes here>
   CLOUDINARY_API_SECRET=<your api secret key goes here>
   DATABASE_URL=<your mongodb url goes here>
   JWTSECRET=<add a random long string as secret>
    ```
   
5. Create a file `.env` in the frontend folder and set environment variables as shown below.
   ```
    REACT_APP_API_URL=http://localhost:3100/api
    ```
  
6. Run below commands in terminal:
   - install backend dependencies : `npm run install-server`
   - install frontend dependencies : `npm run install-client`
   - build frontend : `npm run build-client`
   - start server: `npm run start-server`
   - 

7. The project is now running on your machine on port 3100. Open this link in your browser: http://localhost:3100  
