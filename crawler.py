import time
import requests
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright

from classes import Site, Page, Image
import urllib.robotparser
import datetime
from urllib.parse import urlparse, urlunsplit, urlsplit
from playwright.sync_api import Playwright, sync_playwright, Error
from urllib.parse import urlparse, urlunparse

# NOTE for testing hash, delete later
import string
import random

import psycopg2

GOV_DOMAIN = '.gov.si'
GROUP_NAME = "fri-wier-SET_GROUP_NAME"
INITIAL_SEED = ['https://gov.si', 'https://evem.gov.si', 'https://e-uprava.gov.si', 'https://e-prostor.gov.si']
# DOMAINS = ['gov.si', 'evem.gov.si', 'e-uprava.gov.si', 'e-prostor.gov.si']
DOMAINS = []
# INITIAL_SEED = ['https://www.e-prostor.gov.si']

FRONTIER = []

"""
            sitemaps = rp.site_maps()
            sitemap_content = []
            if sitemaps is not None:
                for sitemap_url in sitemaps:
                    if request_success(sitemap_url):
                        parsed_site_maps = parse_sitemap(sitemap_url)
                        sitemap_content.extend(parsed_site_maps)
            """

#####
# DB utility functions
#####

# insert page into frontier
def db_insert_page_into_frontier(domain, url):
    cur = None
    try:
        cur = conn.cursor()

        # check if there is already an existing url in the database or frontier
        cur.execute("SELECT id FROM crawldb.page WHERE url = %s", (url,))
        id_of_original = cur.fetchone()

        # if url is already in db/frontier, ignore it
        if (id_of_original is None):
            # get id of domain url
            cur.execute("SELECT id FROM crawldb.site WHERE domain= %s", (domain,))
            site_id_result = cur.fetchone()

            # check if there is no entry for this domain
            if(site_id_result is None):
                print("No domain stored with this url: " + url)
                return
                # site_id = db_insert_site_data(domain, '', 0, '') # TODO fix this in code
            else:
                site_id = site_id_result[0]

            cur.execute(
                "INSERT into crawldb.page (site_id, url, page_type_code) VALUES (%s, %s, 'FRONTIER')", (site_id, url))
            # print(cur.statusmessage)
        else:
            # print("\nExisting URL already in frontier/DB")
            pass
    except Exception as e:
        print("Error while inserting page into frontier: ", e)

    finally:
        if cur is not None:
            cur.close()

# insert data into site table
def db_insert_site_data(domain, robots_content, crawl_delay, sitemap_content):
    cur = None
    new_site_id = None
    try:
        cur = conn.cursor()

        # TODO do we need this?
        # cur.execute("SELECT FROM crawldb.site id where domain = %s", (domain,))
        # existing_site_id = cur.fetchone()
        # if existing_site_id is not None:
        #     print("Site already in DB: " + domain);
        #     return

        cur.execute("INSERT into crawldb.site (domain, robots_content, crawl_delay, sitemap_content) \
                    VALUES (%s, %s, %s, %s) RETURNING id", (domain, robots_content, crawl_delay, sitemap_content))
        print(cur.statusmessage)
        new_site_id = cur.fetchone()[0]
        cur.close()
        return new_site_id
    except Exception as e:
        print("Error while inserting site data: ", e)
    finally:
        if cur is not None:
            cur.close()

# when page is crawled, update table 'page' with obtained data
def db_update_page_data(url, page_type_code, html_content, content_hash, http_status_code, accessed_time, data_type_code=None): # TODO get data_type_code
    print("updating {}".format(url))
    cur = None
    try:
        cur = conn.cursor()

        # handles binary pages
        if page_type_code == 'BINARY':
            print("\nInserting values into page as BINARY")
            cur.execute("UPDATE crawldb.page SET page_type_code= %s, http_status_code= %s, accessed_time= %s \
                WHERE url= %s RETURNING id", (page_type_code, http_status_code, accessed_time, url))
            print(cur.statusmessage)
            
            # NOTE - this can cause an error if the page hasn't been inserted yet
            id_of_updated_row = cur.fetchone()[0]

            cur.execute("INSERT INTO crawldb.page_data (page_id, data_type_code) VALUES (%s, %s)", (id_of_updated_row, data_type_code))

        # handles HTML pages
        else:
            # check if there is a duplicate of content_hash
            cur.execute("SELECT id FROM crawldb.page WHERE content_hash = %s AND html_content IS NOT NULL",
                        (content_hash,))  # NOTE will we store the hash of duplicates or is there no need?
            original_site = cur.fetchone()

            # if duplicate exists
            if original_site is not None:
                page_type_code = 'DUPLICATE'
                original_site_id = original_site[0]

                # duplicates should have empty html_content column
                cur.execute("UPDATE crawldb.page SET page_type_code= %s, content_hash = %s, http_status_code= %s, accessed_time= %s \
                            WHERE url= %s RETURNING id", ('DUPLICATE', content_hash, http_status_code, accessed_time, url))
                print(cur.statusmessage)

                # NOTE - this can cause an error if the page hasn't been inserted yet
                id_of_updated_row = cur.fetchone()[0]

                # create link from duplicate pointing to 'original' page
                # column names: from_page -> id of duplicate, to_page -> id of original
                cur.execute("INSERT INTO crawldb.link (from_page, to_page) VALUES (%s, %s)",
                            (id_of_updated_row, original_site_id))
                # print(cur.statusmessage)

            # if there are no duplicates
            else:
                # print("\nInserting values into page as {}".format(page_type_code))
                cur.execute("UPDATE crawldb.page SET page_type_code= %s, html_content= %s, content_hash = %s, http_status_code= %s, accessed_time= %s \
                        WHERE url= %s", (page_type_code, html_content, content_hash, http_status_code, accessed_time, url))
                print(cur.statusmessage)

    except Exception as e:
        print("Error while updating page: ", e)

    finally:
        if cur is not None:
            cur.close()

# get url of the first page in frontier
# TODO handle error if it is None
def db_get_first_page_from_frontier():
    cur = None
    page = None
    
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT url FROM crawldb.page WHERE page_type_code = 'FRONTIER' ORDER BY id ASC LIMIT 1")
        result = cur.fetchone()
        
        if result is not None:
            page_url = result[0]
            print("FROM FRONTIER: " + page_url)
            page = Page(page_url, get_domain(page_url))
    
    except Exception as e:
        print("Error while getting first page from frontier: ", e)
    
    finally:
            if cur is not None:
                cur.close()
    return page


def has_robots_file(robots_url):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        # content = page.content()
        response = page.goto(robots_url)

        if response.status == 200:
            return True
        else:
            return False


def get_urls(page_url):
    links = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(page_url)
        soup = BeautifulSoup(page.content(), 'html.parser')
        for link in soup.find_all('a'):
            raw_link = link.get('href')
            if raw_link is not None and not raw_link.startswith('mailto:') and not raw_link.startswith(
                    'tel:') and 'Mailto' not in raw_link and raw_link not in INITIAL_SEED:
                if raw_link.startswith('http') or raw_link.startswith('https'):
                    canonicalized_url = canonicalize_url(raw_link)
                    if GOV_DOMAIN in canonicalized_url and canonicalized_url not in links and canonicalized_url not in INITIAL_SEED:
                        links.append(canonicalized_url)
                else:
                    full_link = page_url + raw_link
                    canonicalized_url = canonicalize_url(full_link)
                    if GOV_DOMAIN in canonicalized_url and canonicalized_url not in links and canonicalized_url not in INITIAL_SEED:
                        links.append(canonicalized_url)

        return links


def get_image_sources(url):
    with sync_playwright() as p:
        browser = p.chromium.launch()

        page = browser.new_page()
        page.goto(url)

        content = page.content()
        browser.close()

        soup = BeautifulSoup(content, 'html.parser')

        image_sources = [img['src'] for img in soup.find_all('img')]

        return image_sources


def get_domain(url):
    parsed_url = urlparse(url)
    domain = parsed_url.netloc
    if "www." in domain:
        # remove the "www." prefix if it exists
        domain = domain.replace("www.", "")

    return domain


def get_robots_content(robots):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        response = page.goto(robots)

        if response.ok:
            content = page.content()
            soup = BeautifulSoup(content, 'html.parser')
            pre = soup.find('pre')
            if pre is None:
                return ''
            return pre.text
        return ''


def parse_sitemap(url_sitemap):
    urlss = []

    if url_sitemap is None:
        return []

    response = requests.get(url_sitemap)
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'xml')
        sitemaps = soup.select("sitemap")
        if sitemaps:
            for sitemap in soup.select("loc"):
                # Extract the URLs from the sitemap
                loc = sitemap.text
                urlss.extend(parse_sitemap(loc))

        else:
            urlset = soup.select('url')
            if urlset is not None:
                for element in soup.select('loc'):
                    if request_success(element.text) and GOV_DOMAIN in element.text:
                        urlss.append(element.text)
                    else:
                        print('404')

    return urlss


def canonicalize_url(url):
    if url.endswith('/'):
        url = url[:-1]
    scheme, netloc, path, query, fragment = urlsplit(url)
    if not scheme:
        scheme = 'http'
    elif scheme == 'http' or scheme == 'https':
        pass
    else:
        return None
    netloc = netloc.replace('www.', '')
    path = path.replace('www.', '')
    if path.endswith('/'):
        path = path[:-1]
    query = ''
    fragment = ''
    return urlunsplit((scheme, netloc, path, query, fragment))


def add_urls_to_frontier(links):
    for url in links:
        url = canonicalize_url(url)

        if len(url) > 1 and url not in FRONTIER and url not in INITIAL_SEED:
            FRONTIER.append(url)


def get_html_content(page_url):
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page()

        try:
            page.goto(page_url)
            return page.content()
        except Error as e:
            return {"message": "Error accessing the page"}


def get_base_url(url):
    parsed_url = urlparse(url)

    base_url = parsed_url.scheme + '://' + parsed_url.netloc

    if base_url.endswith('/'):
        base_url = base_url[:-1]

    return base_url


def is_binary_file(url: str):
    response = requests.get(url)
    content_type = response.headers.get("content-type")

    if response.status_code == 200:
        if "application/pdf" in content_type and response.content[:4] == b"%PDF":
            return True
        elif "application/msword" in content_type or "application/vnd.openxmlformats-officedocument.wordprocessingml.document" in content_type:
            if response.content[:4] == b"\xD0\xCF\x11\xE0" or response.content[:4] == b"\x50\x4B\x03\x04":
                return True
            else:
                return False
        elif "application/vnd.ms-powerpoint" in content_type or "application/vnd.openxmlformats-officedocument.presentationml.presentation" in content_type:
            if response.content[:4] == b"\xD0\xCF\x11\xE0" or response.content[:4] == b"\x50\x4B\x03\x04":
                return True
            else:
                return False
        else:
            return False
    else:
        return False


def get_page_type_code(url):
    return 'BINARY' if url.endswith('.pdf') or url.endswith('.doc') or url.endswith('.docx') or url.endswith(
        '.ppt') or url.endswith('.pptx') else 'HTML'


def get_http_status_code(url):
    with sync_playwright() as playwright:
        try:
            browser = playwright.chromium.launch()
            page = browser.new_page()
            response = page.goto(url)
            http_status = response.status
            browser.close()
            return http_status
        except requests.exceptions.SSLError:
            return 400  # Bad Request
        except Exception as e:
            return 500


def request_success(url):
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page()

        try:
            response = page.goto(url)
            return response.ok
        except Error as e:
            return False


def page_allowed(url):
    domain_url = get_domain(url)
    rp = urllib.robotparser.RobotFileParser()
    rp.set_url('https://' + domain_url + '/robots.txt')
    rp.read()
    return rp.can_fetch(GROUP_NAME, url)


def insert_pages_into_frontier(pages):
    for page in pages:
        page_entry = Page(page, get_domain(page))

        if page_entry.domain not in DOMAINS:  # check if we have a new domain (Site)
            print('NEW DOMAIN', page_entry.domain)
            # robots_content, crawl_delay = get_robots_content_and_delay(
            #     page_entry.url)
            site = Site(page_entry.domain, "robots_content", '', 0)

            # db_insert_site_data(site.domain, site.robots_content,
            #                     site.crawl_delay, site.sitemap_content)

            db_insert_site_data(site.domain, "site.robots_content",
                                0, site.sitemap_content)
            
            DOMAINS.append(page_entry.domain)

        # FRONTIER.append(page_entry)
        db_insert_page_into_frontier(page_entry.domain, page_entry.url)



def insert_images_into_frontier(images):
    for image in images:
        image = Image()
        # TODO save image to db


def get_page_metadata(page_url):
    page_type_code = get_page_type_code(page_url)

    current_timestamp = time.time()
    current_datetime = datetime.datetime.fromtimestamp(current_timestamp)
    time_stamp = current_datetime.strftime("%Y-%m-%d %H:%M:%S")

    html_content = ''

    http_status_code = get_http_status_code(page_url)

    if page_type_code == 'HTML':
        html_content = get_html_content(page_url)

    return Page(page.url, get_domain(page_url), page_type_code, html_content, '', http_status_code,
                time_stamp)


def get_robots_content_and_delay(page_url):  # TODO dodat za sitemape
    robots = 'https://' + get_domain(page_url) + '/robots.txt'
    if has_robots_file(robots):
        rp = urllib.robotparser.RobotFileParser()
        rp.set_url(robots)
        rp.read()
        robots_content1 = get_robots_content(robots)
        crawl_delay1 = rp.crawl_delay(GROUP_NAME)
        if crawl_delay1 is None:
            crawl_delay1 = 0

        return robots_content1, crawl_delay1

    else:
        return '', 0

try:
    # start DB connection
    conn = psycopg2.connect(host="localhost", user="user",
                            password="SecretPassword")
    conn.autocommit = True
except Exception as e:
    print("Unable to connect to database: ", e)

i = 0
frontier_index = 0
while True:
    if i < len(INITIAL_SEED):
        curr_url = INITIAL_SEED[i]
        robots_url = curr_url + '/robots.txt'
        domain = get_domain(curr_url)
        pages = get_urls(curr_url)

        robots_content, crawl_delay = get_robots_content_and_delay(curr_url)

        if robots_content != '':
            site = Site(domain, robots_content, '',
                        crawl_delay)  # TODO add sitemaps
            # TODO save Site to db
            site = Site(domain, robots_content, '', crawl_delay)  # TODO add sitemaps
        else:
            site = Site(domain, '', '', 0)

        print("insert site: " + site.domain)
        # NOTE should we do this here?
        db_insert_site_data(site.domain, site.robots_content,
                            site.crawl_delay, site.sitemap_content)

        insert_pages_into_frontier(pages)
    else:
        print('\nStarted crawling frontier')
        # page = FRONTIER[frontier_index]

        page = db_get_first_page_from_frontier()
        print(page.url)

        domain = get_domain(page.url)

        if has_robots_file('https://' + domain + '/robots.txt'):
            if page_allowed(page.url):
                page_obj = get_page_metadata(page.url)

                # outputs a random string to simulate hash value - this is just for testing
                hash_test = ''.join(random.choices(string.ascii_lowercase +
                                                   string.digits, k=10))

                db_update_page_data(page_obj.url, page_obj.page_type_code, page_obj.html_content,
                                    hash_test, page_obj.http_status_code, page_obj.accessed_time)
                # print(page_obj.get_data())

                urls = get_urls(page.url)
                insert_pages_into_frontier(urls)

                # TODO save images to db (to se ni narjeno)
                # images = get_image_sources(page.url)

        else:
            page_obj = get_page_metadata(page.url)
            if page_obj.http_status_code != 500:

                # outputs a random string to simulate hash value - this is just for testing
                hash_test = ''.join(random.choices(string.ascii_lowercase +
                                                   string.digits, k=10))

                db_update_page_data(page_obj.url, page_obj.page_type_code, page_obj.html_content,
                                    hash_test, page_obj.http_status_code, page_obj.accessed_time)

                # print(page_obj.get_data())
                urls = get_urls(page.url)
                insert_pages_into_frontier(urls)

                # TODO save images to db
                images = get_image_sources(page.url)
            else:
                db_update_page_data(page_obj.url, page_obj.page_type_code, '',
                                    '', page_obj.http_status_code, page_obj.accessed_time)

        frontier_index += 1
        # print(len(FRONTIER))
    i += 1

# close DB connection - NOTE this is unreachable at the moment
conn.close()
