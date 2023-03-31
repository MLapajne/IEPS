import asyncio
import time

import requests
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright

from classes import Site
import urllib.robotparser
import datetime
from urllib.parse import urlparse
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
            if raw_link and GOV_DOMAIN in raw_link.split('?')[0]:
                if raw_link.startswith('http') or raw_link.startswith('https'):
                    links.append(raw_link)
                else:
                    links.append(page_url + raw_link)

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
                    if GOV_DOMAIN in element.text:
                        urlss.append(element.text)

    return urlss


def normalize_url(url):
    if url.endswith('/'):
        url = url[:-1]

    if url.startswith('http://www.'):
        url = 'http://' + url[11:]
    elif url.startswith('https://www.'):
        url = 'https://' + url[12:]

    return url


def clean_url(url):
    if url.endswith('/'):
        url = url[:-1]
    scheme, netloc, path, params, query, fragment = urlparse(url)
    if not scheme:
        scheme = 'http'
    elif scheme == 'http' or scheme == 'https':
        pass
    else:
        return None
    netloc = netloc.replace('www.', '')
    path = path.replace('www.', '')
    fragment = ''
    return urlunparse((scheme, netloc, path, params, query, fragment))


def add_urls_to_frontier(links):
    for url in links:
        url = normalize_url(url)

        if len(url) > 1 and url not in FRONTIER and url not in INITIAL_SEED:
            FRONTIER.append(url)


def get_page_metadata(page_url):
    if is_binary_file(page_url):
        current_timestamp = time.time()
        current_datetime = datetime.datetime.fromtimestamp(current_timestamp)
        return {
            "url": page_url,
            "html_content": None,
            "page_type_code": 'BINARY',
            "accessed_time": current_datetime.strftime("%Y-%m-%d %H:%M:%S")
        }
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page()

        try:
            response = page.goto(page_url)
            response_headers = response.headers
            content_type = response_headers.get("content-type")
            # return URL, PAGE_TYPE_CODE, HTML_CONTENT, HTTP_STATUS_CODE, ACCESSED_TIME
            if 'html' in content_type:
                content_type = 'HTML'
            # return (page_url, response.status, content_type)
            current_timestamp = time.time()
            current_datetime = datetime.datetime.fromtimestamp(current_timestamp)
            return {"url": page_url,
                    "html_content": page.content(),
                    "page_type_code": content_type,
                    "accessed_time": current_datetime.strftime("%Y-%m-%d %H:%M:%S")
                    }
        except Error as e:
            return {"message": "Error accessing the page"}


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


def request_success(url):
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page()

        try:
            response = page.goto(url)
            return response.ok
        except Error as e:
            return False

"""
# crawl initial seed
for curr_url in INITIAL_SEED:
    robots_url = curr_url + '/robots.txt'
    # TODO store disallowed pages
    # has_robots = has_robots_file(curr_url + "/robots.txt")
    urls = get_urls(curr_url)
    add_urls_to_frontier(urls)

    rp = urllib.robotparser.RobotFileParser()
    rp.set_url(robots_url)
    rp.read()
    delay = rp.crawl_delay(GROUP_NAME)

    # COMMENT THIS

    sitemaps = rp.site_maps()
    sitemap_content = []
    if sitemaps is not None:
        for sitemap_url in sitemaps:
            if request_success(sitemap_url):
                parsed_site_maps = parse_sitemap(sitemap_url)
                sitemap_content.extend(parsed_site_maps)

        add_urls_to_frontier(sitemap_content)

print(FRONTIER)
print(len(FRONTIER))
"""

TEMP_FRONTIER = ['https://gov.si/zbirke/projekti-in-programi/ukrepi-za-omilitev-draginje/ukrepi-za-omilitev-draginje'
                 '-za-ranljive-skupine-in-druzine/#e170096', 'https://spot.gov.si',
                 'https://e-uprava.gov.si/drzava-in-druzba/e-demokracija.html',
                 'https://spot.gov.si/spot/sicas/uporabnik/prijava.evem',
                 'https://spot.gov.si/spot/cert/uporabnik/prijava.evem',
                 'https://spot.gov.si/sl/portal-in-tocke-spot/o-portalu-spot/portal-spot-skozi-stevilke/dodaj-tema'
                 '-230120121530', 'http://gov.si', 'https://stopbirokraciji.gov.si',
                 'https://ipi.eprostor.gov.si/jv', 'https://prostor3.gov.si/javni-arhiv/login.jsp?jezik=sl',
                 'https://ipi.eprostor.gov.si/ov', 'https://ipi.eprostor.gov.si/rv', 'https://prostor-s.gov.si/preg',
                 'https://ipi.eprostor.gov.si/jgp', 'https://egp.gu.gov.si/egp', 'https://eprostor.gov.si/ETN-JV',
                 'https://etn.gu.gov.si/ETN4', 'https://eprostor.gov.si/EV_EMV',
                 'https://e-uprava.gov.si/javne-evidence/katastrski-postopki.html',
                 'https://kataster.eprostor.gov.si/kn', 'https://prostor3.gov.si/ozkgji/index.jsp',
                 'https://gis.gov.si/ezkn', 'https://eprostor.gov.si/imps/srv/slv/catalog.search#/home',
                 'https://e-uprava.gov.si/podrocja/nepremicnine-in-okolje/geodetski-podatki/potrdilo-iz-zbirk'
                 '-geodetskih-podatkov.html',
                 'https://e-uprava.gov.si/podrocja/nepremicnine-in-okolje/parcele/dolocitev-obmocja-stavbne-pravice'
                 '-in-obmocja-sluznosti.html',
                 'https://e-uprava.gov.si/podrocja/nepremicnine-in-okolje/nepremicnine-stavbe/dolocitev'
                 '-prestevilcenje-ukinitev-hisne-stevilke.html',
                 'https://e-uprava.gov.si/podrocja/nepremicnine-in-okolje/nepremicnine-stavbe/izbris-stavbe-dela'
                 '-stavbe.html', 'https://e-uprava.gov.si/podrocja/nepremicnine-in-okolje/parcele/izracun-povrsine'
                                 '.html', 'https://e-uprava.gov.si/podrocja/nepremicnine-in-okolje/parcele/izravnava'
                                          '-meje.html',
                 'https://e-uprava.gov.si/podrocja/nepremicnine-in-okolje/parcele/lokacijska-izboljsava.html',
                 'https://e-uprava.gov.si/podrocja/nepremicnine-in-okolje/nepremicnine-stavbe/izdaja-mnenja-o'
                 '-lastnostih-nepremicnin.html',
                 'https://e-uprava.gov.si/podrocja/nepremicnine-in-okolje/parcele/nova-izmera.html',
                 'https://e-uprava.gov.si/podrocja/nepremicnine-in-okolje/parcele/oznacitev-meje-parcele.html',
                 'https://e-uprava.gov.si/podrocja/nepremicnine-in-okolje/parcele/parcelacija.html',
                 'https://e-uprava.gov.si/podrocja/nepremicnine-in-okolje/parcele/pogodbena-komasacija.html',
                 'https://e-uprava.gov.si/podrocja/nepremicnine-in-okolje/nepremicnine-stavbe/prizidava-prostora.html'
                 '', 'https://e-uprava.gov.si/podrocja/nepremicnine-in-okolje/parcele/sprememba-bonitete-zemljisca0'
                     '.html', 'https://e-uprava.gov.si/podrocja/nepremicnine-in-okolje/nepremicnine-stavbe/spremembe'
                              '-podatkov-o-stavbi-in-delih-stavbe-ki-se-spreminjajo-z-zahtevo-brez-elaborata.html',
                 'https://e-uprava.gov.si/podrocja/nepremicnine-in-okolje/nepremicnine-stavbe/sprememba-sestavine'
                 '-dela-stavbe.html', 'https://e-uprava.gov.si/podrocja/nepremicnine-in-okolje/parcele/ureditev-meje'
                                      '-parcele.html',
                 'https://e-uprava.gov.si/podrocja/nepremicnine-in-okolje/nepremicnine-stavbe/uskladitev-podatkov-v'
                 '-katastru-nepremicnin.html',
                 'https://e-uprava.gov.si/podrocja/nepremicnine-in-okolje/nepremicnine-stavbe/vpis-sprememb-podatkov'
                 '-o-stavbi-in-delu-stavbe.html',
                 'https://e-uprava.gov.si/podrocja/nepremicnine-in-okolje/nepremicnine-stavbe/vpis-stavbe-in-delov'
                 '-stavb.html', 'https://e-uprava.gov.si/podrocja/nepremicnine-in-okolje/nepremicnine-stavbe'
                                '/zdruzitev-in-delitev-stavbe-ali-dela-stavbe.html',
                 'https://gov.si/zbirke/storitve/dolocitev-spremenjenih-mej-obcin',
                 'https://gov.si/zbirke/storitve/informacije-s-podrocja-mnozicnega-vrednotenja',
                 'https://gov.si/zbirke/storitve/spreminjanje-podatkov-registra-prostorskih-enot',
                 'https://gov.si/zbirke/storitve/upravna-komasacija',
                 'https://gov.si/zbirke/storitve/vpis-podatkov-v-kataster-nepremicnin-na-podlagi-pravnomocnih-sodnih'
                 '-odlocb-ali-drugih-aktov-s-katerimi-se-konca-postopek-alternativnega-resevanja-sporov',
                 'https://gov.si/zbirke/storitve/vpis-upravljavca-v-kataster-nepremicnin',
                 'https://e-prostor.gov.si/rss.aplikacije',
                 'https://arhiv.mm.gov.si/gurs/JV_video_jan2023/JV_predstavitveni_video_1080p.mp4',
                 'https://si-trust.gov.si/sl/si-pass',
                 'https://e-uprava.gov.si/pomoc-kontakt/pomoc-pri-uporabi.html', 'https://e-prostor.gov.si/projekt']

# print(parse_sitemap('https://www.e-prostor.gov.si/sitemap.xml'))
# print(parse_sitemap('https://www.gov.si/sitemap.xml'))
# print(parse_sitemap('https://e-uprava.gov.si/sitemaps/sitemap.xml'))
print(clean_url('https://www.freecodecamp.org/news/how-to-consume-rest-apis-in-react/'))
