class Site:
    def __init__(self, domain, robots_content, sitemap_content, crawl_delay):
        self.domain = domain
        self.robots_content = robots_content
        self.sitemap_content = sitemap_content
        self.crawl_delay = crawl_delay

    def get_data(self):
        return {'domain': self.domain,
                'robots_content': self.robots_content,
                'sitemap_content': self.sitemap_content,
                'crawl_delay': self.crawl_delay}


class Page:
    def __init__(self, url, domain, page_type_code='FRONTIER', html_content=None, content_hash='', http_status_code=100, accessed_time=''):
        self.page_type_code = page_type_code
        self.url = url
        self.html_content = html_content
        self.content_hash = content_hash
        self.http_status_code = http_status_code
        self.accessed_time = accessed_time
        self.domain = domain

    def get_data(self):
        return {'page_type_code': self.page_type_code,
                'url': self.url,
                'html_content': self.html_content,
                'content_hash': self.content_hash,
                'http_status_code': self.http_status_code,
                'accessed_time': self.accessed_time,
                'domain': self.domain
                }
