class Site:
    def __init__(self, domain, robots_content, sitemap_content):
        self.domain = domain
        self.robots_content = robots_content
        self.sitemap_content = sitemap_content

    def get_data(self):
        return {'domain': self.domain,
                'robots_content': self.robots_content, 'sitemap_content': self.sitemap_content}
