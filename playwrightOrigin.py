from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
#pip install lxml
from bs4 import BeautifulSoup
import requests
import re
from langdetect import detect
from stopwordsiso import stopwords
from datasketch import MinHash, MinHashLSH, HyperLogLog, WeightedMinHashGenerator
from simhash import Simhash
import numpy as np
import uuid
from urllib.parse import urlparse
import time

site = "http://gov.si"

"""
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
"""


class Crawler:
    def __init__(self, url):
        self.url = url
        self.page_content = None
        self.accessed_time = None


    def crawl(self):
        with sync_playwright() as p:
            browser = p.chromium.launch()
            context = browser.new_context(user_agent="fri-ieps-TEST")
            context.set_default_timeout(5000)
            page = context.new_page()
            try:
                start_time = time.time()
                response = page.goto(self.url)
                end_time = time.time()
                if response.ok:
                    self.page_content = page.content()
                self.status_code = response.status
                self.accessed_time = end_time - start_time
            except PlaywrightTimeoutError:
                print("An exception occurred") 
                
            #if response.status() == 200:
                #page.wait_for_load_state('networkidle')  
            browser.close()

    def parse_sitemap(self, url_sitemap):
        #dobi urlje od sitmap xml datoteke
        urls = []

        #če je ni
        if url_sitemap is  None:
            return []

        # Fetch the sitemap XML file
        response = requests.get(url_sitemap)
        if response.status_code == 200:
            #preoblikujemo v leš
            soup = BeautifulSoup(response.content, 'xml')
            

        
            #išče <sitemap>, ki nakazuje na .xml datoteke
            sitemap = soup.find('sitemap')
            if sitemap is not None:
                
                
                for sitemap in soup.sitemapindex.find_all('sitemap'):
                    # Extract the URLs from the sitemap
                    loc = sitemap.loc.text
                    
                    #print(f'Location: {loc}')

                    #če so xml datoteke
                    if loc.endswith(".xml") or loc.endswith(".XML"):
                        urls.extend(self.parse_sitemap(loc))
                        
                #kliče sebe s parametrom, ki vsebuje ime xml datoteke z url-ji
            
            else:
                #datotka vsebuje url-je
                urlset = soup.find('urlset')
                if urlset is not None:
                    url = soup.find('url')
                    if url is not None:
                        urls.extend([element.text for element in soup.find_all('loc')])
        
    
        return urls


    def robots_context(self):
        result_dict = {}
        lines = self.page_content.split('\n')
        sitemaps = []
        for line in lines:
            if line.startswith('Sitemap:'):
                #včasih ni napisano nič za "Sitemap:"
                if len(line.split())>1: sitemaps.append(line.split()[1])
            
            elif (line.startswith('User-agent:') or line.startswith('UserAgent:')) and line.split()[1] == '*':
                disallows = []
                allows = []
                for agent in lines[lines.index(line)+1:]:
                    print(agent)
                    #če ni nič od naštetega v vrsici, nima smisla nadaljevati
                    if agent.strip() and  not agent.strip().startswith(('Disallow:', 'Allow:', '#')):
                        break
                    if agent.startswith('Disallow:'):
                        if len(agent.split())>1: disallows.append(agent.split()[1])        
                    if agent.startswith('Allow:'):
                        if len(agent.split())>1: allows.append(agent.split()[1]) 
                result_dict['User-agent'] = {'Disallow': disallows, 'Allow': allows}
            elif line.startswith('Crawl-delay:'):
                if len(line.split())>1: result_dict['Crawl-delay'] = line.split()[1]
            else:
                continue
        result_dict['Sitemap'] = sitemaps
        return result_dict
    
    def recognizeLang(self, text):
        """
        Pomožna funkcija, ki pretvori pravilen zapis jezika
        """
        detLang = detect(text)
        

        if detLang == 'zh-cn':
            lang = "zh"
        elif detLang == 'zh-tw':
            lang = "zh"
        else:
            lang = detLang
        return lang
    
    def get_page_text(self):
        soup = BeautifulSoup(self.page_content, 'html.parser')

        # kill all script and style elements
        for script in soup(["script", "style"]):
            script.extract()    # rip it out


        # get text
        #text = soup.get_text()
        
        raw_text = soup.get_text().strip().lower()
        # remove unwanted characters such as punctuation marks or special symbols
        raw_text = re.sub(r'[^\w\s]', '', raw_text)
        word_list = []
        for word in raw_text.split():
            word_list.append(word)
            
        # poišče jezik vnešenega teksta iz prvih 100 besed
        reduced_sent = " ".join(word_list[:100])
        lang = self.recognizeLang(reduced_sent)

        if lang == "th" or lang == "zh" or lang == "vi" or lang == "ja" or lang == "ko":
            #azijci ne delajo presledkov, zato je potrebno obravnavati vsako črko posebej
            asian_words = [c for w in word_list for c in w if not c in stopwords(lang)]
            regex = re.compile('[a-zA-Z]')
            filtered_words = [word for word in asian_words if not regex.search(word)]
        elif not lang == "other":    
            filtered_words = [w for w in word_list if not w in stopwords(lang)]    
        else:
            filtered_words = word_list

        return filtered_words
    
    def generate_minhash(self, text):
        m1 = MinHash()
        for s in text:
            m1.update(s.encode('utf8'))
        self.hashvalues = m1.hashvalues
        return self.hashvalues

    def is_page_similar(self, m1):
        return float(np.count_nonzero(self.hashvalues==m1)) / float(len(m1))
    

    def get_urls(self):
        links = []
        for link in soup.find_all('a'):
            raw_links = link.get('href')
            if raw_links and not raw_links.startswith('mailto:') and not raw_links.startswith('tel:'):
                if raw_links.startswith('http'):
                    self.href_url.append(raw_links)
                else:
                    self.href_other.append(raw_links)


    def get_domain(self, url):
        parsed_url = urlparse(url)
        domain = parsed_url.netloc
        if "www." in domain:
            domain = domain.replace("www.", "") # remove the "www." prefix if it exists

        return domain

    def get_site_data(self, url, sitemap_urls):
        page_guid = uuid.uuid4().hex
        domain = self.get_domain(url)
        robots_context = self.robots_context()
        sitemap_content = []
        for sitemap in sitemap_urls:  
            sitemap_content.append(self.parse_sitemap(sitemap))
        return {"page_id": page_guid, "domain":domain, "robots_context": robots_context, "sitemap_content": sitemap_content}



    def get_page_data(self, url):
        page_guid = uuid.uuid4().hex
        hash_value = self.generate_minhash(self.get_page_text())
        return {"page_guid": page_guid,
                "url": url,
                "html_content": self.page_content,
                "http_status_code": self.status_code,
                "accessed_time": self.accessed_time,
                "hash_value": hash_value}





        
if __name__ == "__main__":
    url1 = "https://openai.com/blog/chatgpt"
    pf1 = Crawler(url1)
    pf1.crawl()

    domain = pf1.get_domain(url1)
    dm1 = Crawler("https://" + domain + "/robots.txt")
    dm1.crawl()
    sitemap_url = dm1.robots_context()["Sitemap"]

    print(pf1.get_site_data(url1, sitemap_url))
    print(pf1.get_page_data(url1))


    url2 = "https://moz.com/learn/seo/duplicate-content"
    pf2 = Crawler(url2)
    pf2.crawl()
    hash2 = pf2.get_page_data(url2)["hash_value"]

    print(pf1.is_page_similar(hash2))

    """
    pf2 = Crawler("https://www.w3schools.com/python/python_try_except.asp")
    pf2.crawl()
    text2 = pf2.page_content
    text1 = pf2.page_content
    status_code = pf2.status_code
    accessed_time = pf2.accessed_time
    print(text2)
    """

    """
    m1 = pf1.generate_minhash(text1)
    m2 = pf2.generate_minhash(text2)
    print(pf1.is_page_similar(m2))
  
    s1 = set(text1)
    s2 = set(text2)
    actual_jaccard = float(len(s1.intersection(s2)))/float(len(s1.union(s2)))
    print(actual_jaccard)
    """

    """
    from simhash import Simhash
    hash1 = Simhash(text1)
    hash2 = Simhash(text2)
    print(hash1.distance(hash2))
    print(hash1)
    """

