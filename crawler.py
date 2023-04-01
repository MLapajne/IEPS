import time
import requests
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright

from classes import Site, Page
import urllib.robotparser
import datetime
from urllib.parse import urlparse, urlunsplit, urlsplit
from playwright.sync_api import Playwright, sync_playwright, Error
from urllib.parse import urlparse, urlunparse

GOV_DOMAIN = '.gov.si'
GROUP_NAME = "fri-wier-SET_GROUP_NAME"
INITIAL_SEED = ['https://gov.si', 'https://evem.gov.si', 'https://e-uprava.gov.si', 'https://www.e-prostor.gov.si']
# INITIAL_SEED = ['https://www.e-prostor.gov.si']

FRONTIER = []
disallowed_pages = []


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


def get_domain(url):
    parsed_url = urlparse(url)
    domain = parsed_url.netloc
    if "www." in domain:
        domain = domain.replace("www.", "")  # remove the "www." prefix if it exists

    return domain


def get_robots_content(robots_url):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        response = page.goto(robots_url)

        if response.ok:
            content = page.content()
            soup = BeautifulSoup(content, 'html.parser')
            pre = soup.find('pre')
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
        FRONTIER.append(page_entry)
        # TODO insert_page_into_frontier(domain, url)


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

i = 0
frontier_index = 0
while True:
    if i < len(INITIAL_SEED):
        curr_url = INITIAL_SEED[i]
        robots_url = curr_url + '/robots.txt'
        print('Current url: ', curr_url)
        domain = get_domain(curr_url)
        pages = get_urls(curr_url)

        if has_robots_file(robots_url):
            rp = urllib.robotparser.RobotFileParser()
            rp.set_url(robots_url)
            rp.read()
            delay = rp.crawl_delay(GROUP_NAME)
            robots_content = get_robots_content(robots_url)

            crawl_delay = rp.crawl_delay(GROUP_NAME)
            if crawl_delay is None:
                crawl_delay = 0
                """
                sitemaps = rp.site_maps()
                sitemap_content = []
                if sitemaps is not None:
                    for sitemap_url in sitemaps:
                        if request_success(sitemap_url):
                            parsed_site_maps = parse_sitemap(sitemap_url)
                            sitemap_content.extend(parsed_site_maps)
                """
            # TODO save Site to db
            site = Site(domain, robots_content, '', crawl_delay)  # TODO add sitemaps
        else:
            # TODO save Site to db
            site = Site(domain, '', '', 0)

        insert_pages_into_frontier(pages)
    else:
        print('Start crawling frontier')
        # dobimo stran iz frontirja, dobimo content in nastavimo na HTML v db, DOBIMO LINKE in jih damo v frontier
        page = FRONTIER[frontier_index]
        print(page.url)
        domain = get_domain(page.url)
        if has_robots_file('https://' + get_domain(page.url) + '/robots.txt'):
            print('ROBOTS')
            if page_allowed(page.url):

                page_obj = get_page_metadata(page.url)
                # TODO update page in db
                print(page_obj.get_data())
                urls = get_urls(page.url)
                # TODO save urls to FRONTIER
                insert_pages_into_frontier(urls)

        else:
            print('NO ROBOTS')
            page_obj = get_page_metadata(page.url)
            if page_obj.http_status_code != 500:
                print(page_obj.get_data())
                urls = get_urls(page.url)
                insert_pages_into_frontier(urls)

        frontier_index += 1
        print(len(FRONTIER))
    i += 1



