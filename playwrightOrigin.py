from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import requests

site = "http://gov.si"


class Site:
    def __init__(self, id, domain, robots_content, sitemap_content):
        self.id = id
        self.domain = domain
        self.robots_content = robots_content
        self.sitemap_content = sitemap_content
    def get_data(self):
        return {'id': self.id, 'domain': self.domain,
                'robots_content': self.robots_content, 'sitemap_content': self.sitemap_content}


class SiteData:
    def __init__(self, id, site_id, page_type_code, url, html_content, http_status_code, accessed_time):
        self.id = id
        self.site_id = site_id
        self.page_type_code = page_type_code
        self.url = url
        self.html_content = html_content
        self.http_status_code = http_status_code
        self.accessed_time = accessed_time
        
    def get_data(self):
        return {'id': self.id, 'site_id': self.site_id, 'page_type_code': self.page_type_code, 'url': self.url, 'html_content': self.html_content, 'http_status_code': self.http_status_code, 'accessed_time': self.accessed_time}


class Spider:
    def __init__(self, url):
        self.url = url
        self.visited_urls = set()
        self.visitedDomain_urls = set()
    def crawl(self, url):
        #if url in self.visited_urls:
            #return
        pass

spider = Spider('https://www.example.com')
#urls = spider.crawl()
#print(urls)




##playwright
from playwright.sync_api import sync_playwright

site = "http://gov.si"
def run(playwright):
    hrefs = []
    chromium = playwright.chromium # or "firefox" or "webkit".
    browser = chromium.launch()
    #nastavlen context za robots.txt
    context = browser.new_context(user_agent="fri-ieps-TEST")
    page = context.new_page()
    page.goto(site)
    #počaka da se naloži stran
    page.wait_for_load_state('networkidle')

    links = page.query_selector_all('a')

    #Playwright in Python to get all links from a website and save complete links with http  
    for link in links:
        raw_links = link.get_attribute('href')
        if raw_links and not raw_links.startswith('mailto:') and not raw_links.startswith('tel:'):
            if raw_links.startswith('http'):
                hrefs.append(raw_links)
            else:
                hrefs.append(site + raw_links)
    print(hrefs)
    # other actions...
    browser.close()

with sync_playwright() as playwright:
        run(playwright)