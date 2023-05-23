class Document:
    def __init__(self, name, text_content):
        self.name = name
        self.text_content = text_content
        self.words = {}


class WordData:
    def __init__(self, freq, indexes):
        self.freq = freq
        self.indexes = indexes


class Result:
    def __init__(self, frequencies, document, snippet):
        self.frequencies = frequencies
        self.document = document
        self.snippet = snippet
