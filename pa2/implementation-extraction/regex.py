import re
import json
import html2text
def page_rtv(html):
    title_reg = r"<h1>(.*)</h1>"
    title = re.compile(title_reg)

    subtitle_reg = r'<div class="subtitle">(.*)</div>'
    subtitle = re.compile(subtitle_reg)

    lead_reg = r'<p class="lead">(.*)</p>'
    lead = re.compile(lead_reg)

    author_re = r'<div class="author-name">(.*)</div>'
    author = re.compile(author_re)

    published_time_re = r'<div class="publish-meta">\n\t\t(.*)<br>'
    published_time = re.compile(published_time_re)

    content_re = r'<div *?class="article-body">(.*?)<div class="gallery">'
    content = re.compile(content_re, re.DOTALL)

    json = {
        "Title": re.findall(title, html)[0],
        "SubTitle": re.findall(subtitle, html)[0],
        "Lead": re.findall(lead, html)[0],
        "Author": re.findall(author, html)[0],
        "PublishedTime": re.findall(published_time, html)[0],
        "Content": re.findall(content, html)[0]
    }
    return json

def page_overstock(html):
    title_re = r'</table></td><td valign="top"> \n<a href="[^\"]*"><b>(.*?)</b>'
    title = re.compile(title_re)

    content_re = r'<span class="normal">([^<]*)<'
    content = re.compile(content_re)

    list_price_re = r'<s>([^<]*)</s>'
    list_price = re.compile(list_price_re)

    price_re = r'<span class="bigred"><b>([^<]*)</b></span>'
    price = re.compile(price_re)

    saving_re = r'<span class="littleorange">([^\s]*)\s[^<]*</span>'
    saving = re.compile(saving_re)

    saving_percent_re = r'<span class="littleorange">[^\(]*\(([^<]*)\)</span>'
    saving_percent = re.compile(saving_percent_re)

    json = {
        "Title": re.findall(title, html)[0],
        "Content": re.findall(content, html)[0],
        "ListPrice": re.findall(list_price, html)[0],
        "Price": re.findall(price, html)[0],
        "Saving": re.findall(saving, html)[0],
        "SavingPercent": re.findall(saving_percent, html)[0]
    }
    return json

def page_insert_name(html):
    # TODO
    json = {

    }

    return json