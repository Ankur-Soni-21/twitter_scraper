# Project Setup Guide

## Setup

1. **Clone the Repository**: Begin by cloning this repository to your local machine.

    ```bash
    git clone <url>
    cd <repo>
    ```

2. **Install Dependencies**: Install the required npm packages.

    ```bash
    npm install
    ```

3. **Install ChromeDriver**: Download the stable version of ChromeDriver from [here](https://googlechromelabs.github.io/chrome-for-testing/).

4. **Install MongoDB Compass**: Download and install MongoDB Compass from [here](https://www.mongodb.com/try/download/community) to connect to the MongoDB database.

5. **Connect to MongoDB**:
    - Open MongoDB Compass.
    - Connect to `localhost:27017`.

6. **Configure Environment Variables**:
    - Create a `.env` file based on the `env.sample` file in the repository.
    - Add your Twitter credentials and ProxyMesh server credentials to the `.env` file.

## Usage

1. **Start the Server**:

    ```bash
    node server.js
    ```

2. **Run the Application**:
    - Open `index.html` on `localhost:5500` using the Live Server extension.
    - Click on the "Run Script" button to run the Selenium script.
