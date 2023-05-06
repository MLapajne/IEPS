from bs4 import BeautifulSoup, Comment
from classes import Parser

# Open files
with open(
        '../input-extraction/rtvslo.si/Audi A6 50 TDI quattro_ nemir v premijskem razredu - RTVSLO.si.html',
        'r', encoding='utf-8') as f:  # is utf-8 encoding ok?
    rtv_audi = f.read()

with open(
        '../input-extraction/rtvslo.si/Volvo XC 40 D4 AWD momentum_ suvereno med najboljše v razredu - RTVSLO.si.html',
        'r', encoding='utf-8') as f:  # is utf-8 encoding ok?
    rtv_volvo = f.read()

TEST_HTML_1 = '<html>Books of: <b>John Smith</b><ul><li><i>Title:</i> DB Primer</li><li><i>Title:</i> Comp. Sys.</li></ul></html>'

TEST_HTML_2 = '<html>Books of: <b>John Smith</b><ul><li><i>Title:</i> DB Primer</li><li><i>Title:</i> Comp. Sys.</li><li><i>Title:</i> Javascript</li></ul></html>'


# removes comments and tag attributes and runs prettify() on the html
def preprocess_html(html_string):
    soup = BeautifulSoup(html_string, 'html.parser')

    # removes attributes - not sure if this is ok
    for tag in soup.find_all(True):
        tag.attrs = {}

    # removes comments
    comments = soup.findAll(text=lambda text: isinstance(text, Comment))
    for comment in comments:
        comment.extract()

    return soup.prettify()


def tokenize_html(html):
    parser = Parser()
    parser.feed(html)
    parser.close()
    return parser.token_array


def roadrunner(html_1, html_2):
    wrapper = ""

    tokenized_1 = tokenize_html(html_1)
    tokenized_2 = tokenize_html(html_2)

    print(tokenized_1)
    print(tokenized_2)

    for i in range(len(tokenized_1)):
        if tokenized_1[i] == tokenized_2[i]:
            wrapper += tokenized_1[i]
        else:
            print("Terminal tag 1: " + tokenized_1[i-1])
            print("Terminal tag 2: " + tokenized_2[i-1])
            print("Potential start tag 1: " + tokenized_1[i])
            print("Potential start tag 2: " + tokenized_2[i])
            print("\n\n")

            # TODO search for occurences of both terminal tags


    print(wrapper)


processed_html_1 = preprocess_html(TEST_HTML_1)
processed_html_2 = preprocess_html(TEST_HTML_2)
roadrunner(processed_html_1, processed_html_2)
