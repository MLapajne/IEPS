from html.parser import HTMLParser


class Parser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.token_array = []

    def handle_starttag(self, tag, attrs):
        self.token_array.append("<%s>" % tag)

    def handle_endtag(self, tag):
        self.token_array.append("</%s>" % tag)

    def handle_data(self, data):
        if not data.isspace():
            self.token_array.append(data.strip()) # IS USING STRIP HERE OK ?
