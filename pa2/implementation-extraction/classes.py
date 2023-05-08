from html.parser import HTMLParser


class Parser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.token_array = []

    def handle_starttag(self, tag, attrs):
        if tag not in ["strong", "br", "em", "i"]:
            self.token_array.append("<%s>" % tag)

    def handle_endtag(self, tag):
        if tag not in ["strong", "br", "em", "i"]:
            self.token_array.append("</%s>" % tag)

    def handle_data(self, data):
        if not data.isspace():
            self.token_array.append(data.strip())
