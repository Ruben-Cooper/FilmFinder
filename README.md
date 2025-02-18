
# 🎬 FilmFinder: Full-Stack Movie Search App

FilmFinder is a full-stack web application that allows users to search for movies, view details, and manage their favorite films. Built using React for the frontend and Node.js with Express.js for the backend, it features JWT authentication and a MySQL database. The application is designed with a RESTful API and has been deployed on an Azure VM with a production-ready configuration.

Note: The SQL dump provided is movie information web scraped from IMDB.

## Features

-   **Movie Search:** Search for movies by title and/or release year.
    
-   **Infinite Scrolling:** Seamlessly load more movies as you scroll.
    
-   **Movie Details:** View detailed information about each movie.
    
-   **User Authentication:** Secure registration and login using JWT.
    
-   **Responsive Design:** Optimized for desktop and mobile devices.
    

## Dependencies

-   **Frontend:** Listed in the `package.json` file in the root directory.
    
-   **Backend:** Listed in the `package.json` file in the `backend` directory.
    

## Installation

1.  **Clone the repository:**
    
    ```
    git clone https://github.com/your-username/filmfinder.git
    ```
    
2.  **Install dependencies for both frontend and backend:**
    
    ```
    # Frontend
    npm install
    
    # Backend
    cd backend
    npm install
    ```
    

## Configuration

### Backend

1.  **Set up your MySQL database:**
    
    -   Create a new database named `filmfinder`.
        
    -   Import the provided SQL dump or set up the database tables as specified in the backend task sheet.
        
2.  **Configure environment variables:**
    
    -   Create a `.env` file in the `backend` folder with the following variables:
        
        env
        
        ```
        DB_HOST=your_database_host
        DB_USER=your_database_user
        DB_PASSWORD=your_database_password
        DB_NAME=filmfinder
        JWT_SECRET=your_jwt_secret
        
        ```
        
3.  **Start the backend server:**
    
    
    ```
    node ./bin/www
    ```

4. **Backend Self-Signed Key:**

    The backend uses a generic self-signed key for SSL. If you wish to use your own SSL certificates, replace the default key and certificate files located in the backend directory.
    

### Frontend

1.  **Update the API URL:**
    
    -   In your frontend code (e.g., in `src/utils/api.js`), update the API URLs to point to your backend server. For example:
        

        
        ```
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        ```
        
    -   Replace `'http://localhost:3000'` with your backend server's URL if it's deployed remotely.
        
2.  **Start the frontend server:**
    
    ```
    npm start
    ```
    

## Usage

1.  **Register or log in to your account.**
    
2.  **Search for movies by title and/or release year.**
    
3.  **View detailed information about each movie.**
    
4.  **Enjoy infinite scrolling through the movie list.**
    

## Deployment

### Backend Deployment on Azure VM

1.  **Set up the Azure VM:**
    
    -   Install Node.js and MySQL on the VM.
        
    -   Clone the repository and navigate to the backend folder.
        
    -   Install dependencies and set up the environment variables as described in the configuration section.
        
2.  **Configure Firewall and Ports:**
    
    -   Open the necessary ports (e.g., port 3000) in the Azure VM's network security group to allow incoming traffic.
        
3.  **Start the backend server using a process manager (e.g., PM2):**
    

    ```
    npm install -g pm2
    pm2 start ./bin/www
    ```
    

### Frontend Deployment

1.  **Build the frontend for production:**
   
    
    ```
    npm run build
    ```
    
2.  **Deploy the** `build` **folder to a static hosting service:**
    
    -   Use services like Netlify, Vercel, or GitHub Pages.
        
    -   Follow the specific instructions provided by the hosting service.
