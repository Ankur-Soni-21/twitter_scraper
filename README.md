# Twitter Scraper

## Note

The `server.py`, `index.html`, and `twitter_scraper.js` files are placeholders and are not correctly connected. The Flask server and frontend components are not fully implemented due to lack of knowledge of Flask.


## Overview

The `twitter_scraper` script is designed to scrape trending topics from Twitter using Selenium. It automates the process of logging into Twitter, extracting trending topics, and storing the data in a MongoDB database. This README provides instructions on setting up and running the script effectively.

## Setup

1. **Clone the Repository**: Begin by cloning this repository to your local machine.

    ```bash
    git clone https://github.com/your-username/twitter_scraper.git
    ```

2. **Create a `.env` file**: Create a `.env` file in the project root directory to store sensitive information such as your Twitter username, password, and proxy settings. Replace `xxxxxx` and `h$xxxxx` with your actual Twitter credentials and `host:port` with your proxy information.

    ```dotenv
    TWITTER_USERNAME=xxxxxx
    TWITTER_PASSWORD=h$xxxxx
    PROXY=host:port
    ```

3. **Install Dependencies**: Install the required Python packages using `pip`.

    ```bash
    pip install -r requirements.txt
    ```

4. **Download Chrome WebDriver**: Download the Chrome WebDriver appropriate for your Chrome browser version and place it in the project folder.

## Usage

Run the `twitter_scraper.py` script to execute the scraping process. Ensure that your Chrome browser is installed and the WebDriver is correctly configured.

```bash
python twitter_scraper.py
