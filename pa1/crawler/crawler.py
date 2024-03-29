import hashlib
import threading
from ssl import SSLError
import time
import mimetypes
from concurrent.futures import ThreadPoolExecutor

import requests
import socket
import os
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright

from classes import Site, Page, Image
import urllib.robotparser
import datetime
from urllib.parse import urlparse, urlunsplit, urlsplit
from playwright.sync_api import Playwright, sync_playwright, Error
from urllib.parse import urlparse, urlunparse

mimetypes.init()
import psycopg2

GOV_DOMAIN = 'gov.si'
GROUP_NAME = "fri-wier-SET_GROUP_NAME"
INITIAL_SEED = ['https://gov.si', 'https://evem.gov.si', 'https://e-uprava.gov.si', 'https://e-prostor.gov.si']
# DOMAINS = ['gov.si', 'evem.gov.si', 'e-uprava.gov.si', 'e-prostor.gov.si']
# IPS = ['84.39.211.243', '84.39.222.27', '84.39.223.247', '84.39.211.222']

DOMAINS = []
IPS = []

IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg']
LAST_CRAWL_TIMES_DOMAINS = {domain: 0 for domain in DOMAINS}  # dictionary for storing wait times for domains
LAST_CRAWL_TIMES_IPS = {ip: 0 for ip in IPS}  # dictionary for storing wait times for ips

FRONTIER = []


#####
# DB utility functions
#####

# Returns all domains and ips saved in DB
def db_get_domains_ips():
    cur = None
    domains = []
    ips = []

    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT domain, ip FROM crawldb.site")
        result = cur.fetchall()

        if result is not None:
            for row in result:
                domains.append(row[0])
                ips.append(row[1])

        return domains, ips

    except Exception as e:
        print("Error while getting first page from frontier: ", e)

    finally:
        if cur is not None:
            cur.close()


# Resets all rows with page_type_code 'CRAWLING' back to 'FRONTIER'
def db_reset_crawling():
    cur = None
    try:
        cur = conn.cursor()
        cur.execute("UPDATE crawldb.page SET page_type_code='FRONTIER' WHERE page_type_code='CRAWLING'")
        print("Reset crawling ", cur.statusmessage)
        cur.close()
    except Exception as e:
        print("Error while reseting crawling status: ", e)
    finally:
        if cur is not None:
            cur.close()


# Inserts page into frontier
def db_insert_page_into_frontier(domain, url, from_page=None):
    cur = None
    try:
        cur = conn.cursor()

        # check if there is already an existing url in the database or frontier
        cur.execute("SELECT id FROM crawldb.page WHERE url = %s", (url,))
        id_of_original = cur.fetchone()

        if (id_of_original is None):
            # get id of domain url
            cur.execute("SELECT id FROM crawldb.site WHERE domain= %s", (domain,))
            site_id_result = cur.fetchone()

            # check if there is no entry for this domain
            if (site_id_result is None):
                print("No domain stored with this url: " + url)
                return
            else:
                site_id = site_id_result[0]

            cur.execute(
                "INSERT into crawldb.page (site_id, url, page_type_code) VALUES (%s, %s, 'FRONTIER') RETURNING id",
                (site_id, url))
            to_page_id_result = cur.fetchone()

            if from_page is not None and to_page_id_result is not None:
                to_page_id = to_page_id_result[0]

                cur.execute("SELECT id FROM crawldb.page WHERE url= %s", (from_page,))
                from_page_id_result = cur.fetchone()
                if from_page_id_result is not None:
                    from_page_id = from_page_id_result[0]
                    cur.execute(
                        "INSERT into crawldb.crawl_links (from_page, to_page) VALUES (%s, %s)",
                        (from_page_id, to_page_id))
    except Exception as e:
        print("Error while inserting page into frontier: ", e)

    finally:
        if cur is not None:
            cur.close()


# Returns frontier length
def db_get_frontier_length():
    cur = None
    pages_length = 0
    frontier_length = 0
    try:
        cur = conn.cursor()

        cur.execute("SELECT COUNT(*) FROM crawldb.page")
        result_pages = cur.fetchone()

        if result_pages is not None:
            pages_length = result_pages[0]

        cur.execute("SELECT COUNT(*) FROM crawldb.page WHERE page_type_code = 'FRONTIER'")
        result_frontier = cur.fetchone()

        if result_frontier is not None:
            frontier_length = result_frontier[0]

        return pages_length, frontier_length

    except Exception as e:
        print("Error while inserting page into frontier: ", e)

    finally:
        if cur is not None:
            cur.close()


# Inserts data into table 'site'
def db_insert_site_data(domain, robots_content, crawl_delay, sitemap_content, ip_address):
    cur = None
    new_site_id = None
    try:
        cur = conn.cursor()

        cur.execute("INSERT into crawldb.site (domain, robots_content, crawl_delay, sitemap_content, ip) \
                    VALUES (%s, %s, %s, %s, %s) RETURNING id",
                    (domain, robots_content, crawl_delay, sitemap_content, ip_address))
        print("Site ", cur.statusmessage)
        new_site_id = cur.fetchone()[0]
        cur.close()
        return new_site_id
    except Exception as e:
        print("Error while inserting site data: ", e)
    finally:
        if cur is not None:
            cur.close()


# Updates table 'page' with provided data, also handles duplicates and binary pages
def db_update_page_data(url, page_type_code, html_content, content_hash, http_status_code, accessed_time,
                        data_type_code=None):
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

            id_of_updated_row = cur.fetchone()[0]

            cur.execute("INSERT INTO crawldb.page_data (page_id, data_type_code) VALUES (%s, %s)",
                        (id_of_updated_row, data_type_code))

        # handles HTML pages
        else:
            # check if there is a duplicate of content_hash
            cur.execute("SELECT id FROM crawldb.page WHERE content_hash = %s AND html_content IS NOT NULL",
                        (content_hash,))
            original_site = cur.fetchone()

            # if duplicate exists
            if original_site is not None:
                page_type_code = 'DUPLICATE'
                original_site_id = original_site[0]

                # duplicates should have empty html_content column
                cur.execute("UPDATE crawldb.page SET page_type_code= %s, content_hash = %s, http_status_code= %s, accessed_time= %s \
                            WHERE url= %s RETURNING id",
                            ('DUPLICATE', content_hash, http_status_code, accessed_time, url))
                print(cur.statusmessage)
                id_of_updated_row = cur.fetchone()[0]

                # create link from duplicate pointing to 'original' page
                # column names: from_page -> id of duplicate, to_page -> id of original
                cur.execute("INSERT INTO crawldb.link (from_page, to_page) VALUES (%s, %s)",
                            (id_of_updated_row, original_site_id))

            # if there are no duplicates
            else:
                cur.execute("UPDATE crawldb.page SET page_type_code= %s, html_content= %s, content_hash = %s, http_status_code= %s, accessed_time= %s \
                        WHERE url= %s",
                            (page_type_code, html_content, content_hash, http_status_code, accessed_time, url))
                print(cur.statusmessage)

    except Exception as e:
        print("Error while updating page: ", e)

    finally:
        if cur is not None:
            cur.close()


# Returns url of the first page in frontier
def db_get_first_page_from_frontier():
    cur = None
    page = None

    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, url FROM crawldb.page WHERE page_type_code = 'FRONTIER' ORDER BY id ASC LIMIT 1")
        result = cur.fetchone()

        if result is not None:
            page_id = result[0]
            page_url = result[1]
            print("FROM FRONTIER: " + page_url)
            page = Page(page_url, get_domain(page_url))

            cur.execute("UPDATE crawldb.page SET page_type_code= 'CRAWLING' WHERE id= %s", (page_id,))
            return page

    except Exception as e:
        print("Error while getting first page from frontier: ", e)

    finally:
        if cur is not None:
            cur.close()


# Inserts data into table 'image'
def db_insert_image_data(url, filename, content_type, accessed_time):
    cur = None
    try:
        cur = conn.cursor()
        cur.execute("SELECT id FROM crawldb.page WHERE url = %s", (url,))

        page_id = cur.fetchone()[0]
        cur.execute(
            "INSERT INTO crawldb.image (page_id, filename, content_type, accessed_time) VALUES (%s, %s, %s, %s)",
            (page_id, filename, content_type, accessed_time))

        cur.close()
    except Exception as e:
        print("Error while inserting image data: ", e)
    finally:
        if cur is not None:
            cur.close()


# Calculate hash of html content using MD5
def hash_html(html_content):
    return hashlib.md5(html_content.encode('utf-8')).hexdigest()


# Check if page has robot.txt
def has_robots_file(robots_url):
    try:
        with sync_playwright() as p:
            try:
                browser = p.chromium.launch()
                page = browser.new_page()
                response = page.goto(robots_url)

                if response.status == 200:
                    return True
                else:
                    return False

            except SSLError:
                return False
    except Exception as e:
        print("has_robots_file exception: ", e)
        return False


# Get all urls from anchor tags, check if url contains .gov.si, canonalize url
def get_urls(page_url):
    onclick_urls = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(page_url)
        content = page.content()
        soup = BeautifulSoup(content, 'html.parser')
        onclick_urls = get_onclick_links(content, page_url)
        for link in soup.find_all('a'):
            raw_link = link.get('href')
            if raw_link is not None and not raw_link.startswith('mailto:') and not raw_link.startswith(
                    'tel:') and 'Mailto' not in raw_link and raw_link not in INITIAL_SEED:
                if raw_link.startswith('http') or raw_link.startswith('https'):
                    canonicalized_url = canonicalize_url(raw_link)
                    if GOV_DOMAIN in canonicalized_url and canonicalized_url not in onclick_urls and canonicalized_url not in INITIAL_SEED:
                        onclick_urls.append(canonicalized_url)
                else:
                    full_link = page_url + raw_link
                    canonicalized_url = canonicalize_url(full_link)
                    if GOV_DOMAIN in canonicalized_url and canonicalized_url not in onclick_urls and canonicalized_url not in INITIAL_SEED:
                        onclick_urls.append(canonicalized_url)

        return onclick_urls


# Function extracts all onclick event urls
def get_onclick_links(text, page_url):
    urls = []

    soup = BeautifulSoup(text, 'html.parser')

    for script in soup(["script", "style"]):
        script.extract()
    for el in soup.select("[onClick], [onclick]"):
        url = None
        if el.has_attr("onclick") or el.has_attr("onClick"):
            parameter = el.get("onclick", '') + el.get("onClick", '')
            if "location.href" in parameter or "document.location" in parameter:
                url_start_index = parameter.find("'") + 1
                url_end_index = parameter.find("'", url_start_index)
                if url_start_index != -1 or url_end_index != -1:
                    url = parameter[url_start_index:url_end_index]
                    if url.startswith('http') or url.startswith('https'):
                        canonicalized_url = canonicalize_url(url)
                        if GOV_DOMAIN in canonicalized_url and canonicalized_url not in urls and canonicalized_url not in INITIAL_SEED:
                            urls.append(canonicalized_url)
                    else:
                        full_link = page_url + url
                        canonicalized_url = canonicalize_url(full_link)
                        if GOV_DOMAIN in canonicalized_url and canonicalized_url not in urls and canonicalized_url not in INITIAL_SEED:
                            urls.append(canonicalized_url)
    return urls


# Function for extracting all images (for html tag <img>) from a page
def get_image_sources(url):
    with sync_playwright() as p:
        browser = p.chromium.launch()

        page = browser.new_page()
        page.goto(url)

        content = page.content()
        browser.close()

        soup = BeautifulSoup(content, 'html.parser')

        image_sources = []
        for img in soup.find_all('img'):
            try:
                image_sources.append(img['src'])
            except KeyError:
                pass

        return image_sources


# Function returns domain of a url, it also removes www. from the url
def get_domain(url):
    parsed_url = urlparse(url)
    domain = parsed_url.netloc
    if "www." in domain:
        domain = domain.replace("www.", "")  # remove the "www." prefix if it exists

    return domain


# Function returns all robots content
def get_robots_content(robots):
    try:
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
    except Exception as e:
        print("Error accessing robots content: ", e)
        return ''


# Recursive function for getting all sitemap urls from a given url of a sitemap
def parse_sitemap(url_sitemap):
    urlss = []

    if url_sitemap is None:
        return []

    response = requests.get(url_sitemap)
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'lxml')
        site_maps = soup.select("sitemap")
        if site_maps:
            for sitemap in soup.select("loc"):
                loc = sitemap.text
                urlss.extend(parse_sitemap(loc))

        else:
            urlset = soup.select('url')
            if urlset is not None:
                for element in soup.select('loc'):
                    if GOV_DOMAIN in element.text:
                        urlss.append(element.text)

    return urlss


# Function canonicalizes url - removes all get parameters (/?id=12), removes trailing slash, removes www
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


# Function adds given urls to frontier
def add_urls_to_frontier(links):
    for url in links:
        url = canonicalize_url(url)

        if len(url) > 1 and url not in FRONTIER and url not in INITIAL_SEED:
            FRONTIER.append(url)


# Function returns all html content of a given page url
def get_html_content(page_url):
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page()

        try:
            page.goto(page_url)
            return page.content()
        except Error:
            return "<html><head></head><body></body></html>"


# Function returns page_type_code of a url - BINARY if the page is pdf, doc, docx, ppt, or pptx, or HTML otherwise
def get_page_type_code(url):
    return 'BINARY' if url.endswith('.pdf') or url.endswith('.doc') or url.endswith('.docx') or url.endswith(
        '.ppt') or url.endswith('.pptx') else 'HTML'


# Returns page_type of given url
def get_data_type_code(url):
    if url.endswith('.pdf'):
        return 'PDF'
    elif url.endswith('.doc'):
        return 'DOC'
    elif url.endswith('.docx'):
        return 'DOCX'
    elif url.endswith('.ppt'):
        return 'PPT'
    elif url.endswith('.pptx'):
        return 'PPTX'
    return None


# Returns http response status code, here we are also checking for SSLError
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


# Checks if a request for a url is successful
def request_success(url):
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page()

        try:
            response = page.goto(url)
            return response.ok
        except Error as e:
            return False


# Checks if page is allowed depending on the robots.txt.
# We are using robotparser library for getting robots.txt data
def page_allowed(url):
    domain_url = get_domain(url)
    rp = urllib.robotparser.RobotFileParser()
    rp.set_url('https://' + domain_url + '/robots.txt')
    rp.read()
    return rp.can_fetch(GROUP_NAME, url)


# Saves new domain (Site) to database
def add_new_domain(page_url):
    domain_url = get_domain(page_url)
    print('NEW DOMAIN', domain_url)
    robots_content, crawl_delay, sitemaps = get_robots_content_data(page_url,
                                                                    True)
    site = Site(domain_url, robots_content, ' '.join(sitemaps), crawl_delay)

    DOMAINS.append(domain_url)
    try:
        ip = socket.gethostbyname(domain_url)
    except Exception as e:
        print("Error when getting domain ip: ", e)
        ip = ''
    IPS.append(ip)
    LAST_CRAWL_TIMES_DOMAINS[domain_url] = 0
    LAST_CRAWL_TIMES_IPS[ip] = 0

    db_insert_site_data(site.domain, site.robots_content,
                        site.crawl_delay, site.sitemap_content, ip)

    insert_pages_into_frontier(sitemaps)


# Checks for new domains and calls DB function
def insert_pages_into_frontier(pages, from_page=None):
    for page in pages:
        page_entry = Page(page, get_domain(page))

        if page_entry.domain not in DOMAINS and GOV_DOMAIN in page_entry.domain:  # check if we have a new domain (Site)
            add_new_domain(page_entry.url)

        db_insert_page_into_frontier(page_entry.domain, page_entry.url, from_page)


# Obtains image data and calls DB function
def insert_image_data(images, url):
    for image in images:
        img_obj = get_image_metadata(image)
        db_insert_image_data(url, img_obj.filename, img_obj.content_type, img_obj.accessed_time)


# Extracts data of a page: page type code, timestamp of access, html content, http status code
# and returns a Page object
def get_page_metadata(page_url):
    page_type_code = get_page_type_code(page_url)

    current_timestamp = time.time()
    current_datetime = datetime.datetime.fromtimestamp(current_timestamp)
    time_stamp = current_datetime.strftime("%Y-%m-%d %H:%M:%S")

    html_content = ''
    data_type_code = ''

    http_status_code = get_http_status_code(page_url)

    if page_type_code == 'HTML':
        html_content = get_html_content(page_url)

    content_hash = hash_html(html_content)

    if page_type_code == 'BINARY':
        data_type_code = get_data_type_code(page_url)

    return Page(page_url, get_domain(page_url), page_type_code, html_content, content_hash, http_status_code,
                time_stamp, data_type_code)


# Returns filename from url
def get_image_filename(url):
    filename = os.path.basename(url)
    return filename


# Returns image extension
def get_image_type(image_url):
    image_parse = image_url.split('.')
    if len(image_parse) == 1:
        return ''
    return image_url.split('.')[len(image_parse) - 1]


# Extracts filename, file extension, content type using mimetypes library and time_stamp
def get_image_metadata(image_url):
    filename = get_image_filename(image_url)
    current_timestamp = time.time()
    current_datetime = datetime.datetime.fromtimestamp(current_timestamp)
    time_stamp = current_datetime.strftime("%Y-%m-%d %H:%M:%S")

    file_extension = '.' + get_image_type(image_url)
    content_type = ''
    if file_extension in IMAGE_EXTENSIONS:
        content_type = mimetypes.types_map[file_extension]

    return Image(filename, content_type, '', time_stamp)


# Extracts crawl_delay, content of robots file and sitemaps (using parse_sitemaps()),
# here we also have to check if a page has sitemaps
def get_robots_content_data(page_url, parse_sitemaps):
    try:
        robots = 'https://' + get_domain(page_url) + '/robots.txt'
        if has_robots_file(robots):
            rp = urllib.robotparser.RobotFileParser()
            rp.set_url(robots)
            rp.read()
            robots_content1 = get_robots_content(robots)
            crawl_delay1 = rp.crawl_delay(GROUP_NAME)

            if crawl_delay1 is None:
                crawl_delay1 = 0

            site_maps = rp.site_maps()
            if parse_sitemaps:
                sitemap_content = []
                if site_maps is not None:
                    for sitemap_url in site_maps:
                        if request_success(sitemap_url):
                            parsed_site_maps = parse_sitemap(sitemap_url)
                            sitemap_content.extend(parsed_site_maps)

                return robots_content1, crawl_delay1, sitemap_content

            return robots_content1, crawl_delay1, ''

        else:
            return '', 0, ''
    except Exception as e:
        print("Error getting robots content: ", e)
        return '', 0, ''


# Start database connection
try:
    conn = psycopg2.connect(host="localhost", user="user",
                            password="SecretPassword")
    conn.autocommit = True
except Exception as e:
    print("Unable to connect to database: ", e)


# This function checks if we have to wait for a domain or IP,
# it checks a global dictionary that stores last access times
def wait_for_access(page_url):
    domain = get_domain(page_url)

    try:
        ip = socket.gethostbyname(domain)
    except Exception as e:
        print("Error getting host ip: ", e)
        ip = ''

    last_crawl_time = LAST_CRAWL_TIMES_DOMAINS[domain]
    time_since_last_crawl = time.time() - last_crawl_time
    if time_since_last_crawl < 5:
        time.sleep(5 - time_since_last_crawl)
        return
    else:
        last_crawl_time = LAST_CRAWL_TIMES_IPS[ip]
        time_since_last_crawl = time.time() - last_crawl_time
        if time_since_last_crawl < 5:
            time.sleep(5 - time_since_last_crawl)

    LAST_CRAWL_TIMES_DOMAINS[domain] = time.time()
    LAST_CRAWL_TIMES_IPS[ip] = time.time()


# Checks if seed urls were already added into frontier
def db_seed_urls_in_frontier(seed_urls):
    cur = None
    try:
        cur = conn.cursor()

        for url in seed_urls:
            cur.execute("SELECT EXISTS(SELECT 1 FROM crawldb.page WHERE url = %s)", (url,))
            result = cur.fetchone()[0]
            if not result:
                return False
        return True

    except Exception as e:
        print("Problem checking if seed urls are already in frontier: ", e)

    finally:
        if cur is not None:
            cur.close()


# Function crawls initial seed urls and get robots content
def crawl_initial_seed(curr_url):
    domain = get_domain(curr_url)
    pages = get_urls(curr_url)

    robots_content, crawl_delay, sitemaps = get_robots_content_data(curr_url, True)

    if robots_content != '':
        site = Site(domain, robots_content, ' '.join(sitemaps), crawl_delay)
    else:
        site = Site(domain, '', '', 0)

    insert_pages_into_frontier(pages, curr_url)


# Function for crawling frontier pages
def crawl_page():
    page = db_get_first_page_from_frontier()

    print(page.url)

    domain = get_domain(page.url)
    if domain not in DOMAINS and GOV_DOMAIN in domain:  # check if we have a new domain (Site)
        add_new_domain(domain)

    if has_robots_file('https://' + domain + '/robots.txt'):  # if a page has robots file, we have to check it
        if page_allowed(page.url):
            _, crawl_delay, _ = get_robots_content_data(page.url, False)
            if crawl_delay != 0:  # check if there is crawl_delay in robots.txt
                time.sleep(crawl_delay)
            else:  # if there is no crawl_delay, check if we have to wait before accessing a domain or IP
                wait_for_access(page.url)

            page_obj = get_page_metadata(page.url)
            urls = get_urls(page.url)
            images = get_image_sources(page.url)

            db_update_page_data(page_obj.url, page_obj.page_type_code, page_obj.html_content,
                                page_obj.content_hash, page_obj.http_status_code, page_obj.accessed_time,
                                page_obj.data_type_code)

            insert_pages_into_frontier(urls, page.url)
            insert_image_data(images, page.url)

    else:
        wait_for_access(page.url)

        page_obj = get_page_metadata(page.url)
        if page_obj.http_status_code != 500:
            db_update_page_data(page_obj.url, page_obj.page_type_code, page_obj.html_content,
                                page_obj.content_hash, page_obj.http_status_code, page_obj.accessed_time,
                                page_obj.data_type_code)

            urls = get_urls(page.url)
            images = get_image_sources(page.url)
            insert_pages_into_frontier(urls, page.url)
            insert_image_data(images, page.url)
        else:
            db_update_page_data(page_obj.url, page_obj.page_type_code, '',
                                '', page_obj.http_status_code, page_obj.accessed_time, page_obj.data_type_code)


# Get domains and IPs from DB
DOMAINS, IPS = db_get_domains_ips()
LAST_CRAWL_TIMES_DOMAINS = {domain: 0 for domain in DOMAINS}
LAST_CRAWL_TIMES_IPS = {ip: 0 for ip in IPS}

# Resets all pages with status CRAWLING back to FRONTIER
print("Resetting crawling status")
db_reset_crawling()

# If seed urls were not yet added to frontier, start by adding them
if not db_seed_urls_in_frontier(INITIAL_SEED):
    print("Inserting seed urls into frontier")
    insert_pages_into_frontier(INITIAL_SEED)

# Crawl frontier pages
while True:
    crawl_page()

# close DB connection
conn.close()