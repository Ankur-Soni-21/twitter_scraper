from pymongo import MongoClient
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import TimeoutException

import os
import time
import uuid
import requests
from datetime import datetime

load_dotenv()
service = Service(executable_path="chromedriver.exe")

chrome_options = webdriver.ChromeOptions()
chrome_options.add_argument('--proxy-server=%s' % os.environ.get('PROXY'))
driver = webdriver.Chrome(service=service, options=chrome_options)
driver.get("https://www.x.com")
driver.maximize_window()
wait = WebDriverWait(driver, 1000)


client = MongoClient('mongodb://localhost:27017/')
db = client['twitter_data']
collection = db['twitter_trends']

def check_for_refresh_button():
    try:
        refresh_button = driver.find_element(By.CSS_SELECTOR, "button.css-175oi2r")
        return refresh_button
    except NoSuchElementException:
        return None
    
def get_tags():
    try:
        # Find the specified section
        section = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, "div[aria-label='Timeline: Trending now']")))
    except TimeoutException:
        # If section is not present, refresh the page
        driver.refresh()
        # Wait for the page to load after refreshing
        time.sleep(5)
        # Retry finding the section
        section = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, "div[aria-label='Timeline: Trending now']")))
        
    # Introduce a delay before finding spans
    time.sleep(10)
    
    # Find all the parent div elements inside the section
    divs = section.find_elements(By.CSS_SELECTOR, "[style*='color: rgb(231, 233, 234)'][dir='ltr']")
    print('divs:',divs)
    
    tag_list = []
    # Iterate over each div to find the spans inside it
    for div in divs:
        # Find all the spans inside the current div
        spans = div.find_elements(By.CSS_SELECTOR, "span.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3")
        # Extract text from spans and append to tag_list
        tag_list.extend([span.text for span in spans if span.text != "What’s happening"])
        
    
    return tag_list


def sign_in():
    signInElement = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "a[href='/login'][role='link']")))
    signInElement.click()

    inputField = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[name='text']")))
    username = os.getenv('TWITTER_USERNAME')
    inputField.send_keys(username)

    nextButton = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[role='button'][style*='background-color: rgb(239, 243, 244)']")))
    nextButton.click()

    password_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[name='password']")))
    password_input.clear()
    password = os.getenv('TWITTER_PASSWORD')
    password_input.send_keys(password)

    login_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[role='button'][style*='background-color: rgb(239, 243, 244)']")))
    login_button.click()

    return

def handle_login():
    refresh_button = check_for_refresh_button()
    if refresh_button:
        refresh_button.click()
        # Wait for the login form to appear after refreshing
        sign_in()
    else:
        sign_in()

def insert_data(tag_list,ip_address):
    unique_id = str(uuid.uuid4())
    end_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data_to_insert = {
        'unique_id': unique_id,
        'trend1': tag_list[0] if tag_list else None,
        'trend2': tag_list[1] if len(tag_list) > 1 else None,
        'trend3': tag_list[2] if len(tag_list) > 2 else None,
        'trend4': tag_list[3] if len(tag_list) > 3 else None,
        'trend5': tag_list[4] if len(tag_list) > 4 else None,
        'end_time': end_time,
        'ip_address': ip_address
    }
    collection.insert_one(data_to_insert)
    return

def get_ip():
    proxies = {
        'http': os.getenv('PROXY'),
        'https': os.getenv('PROXY')
    }
    
    response = requests.get('http://ipinfo.io/ip', proxies=proxies)
    print(response.text)
    return response.text


if driver.find_elements(By.CSS_SELECTOR, "a[href='/logout'][role='link']"):
    tag_list = get_tags()
    ip_address = get_ip()
    insert_data(tag_list,ip_address)
    print('data',tag_list)
else:
    handle_login()
    tag_list = get_tags()
    ip_address = get_ip()
    insert_data(tag_list,ip_address)
    print('data:',tag_list)



time.sleep(10)

driver.quit()
