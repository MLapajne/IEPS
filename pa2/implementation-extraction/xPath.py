from lxml import etree
import unicodedata



def extract_normalized_text(html, xpath_expression):
    tree = etree.HTML(html)
    selected_elements = tree.xpath(xpath_expression)

    normalized_texts = []
    for element in selected_elements:
        normalized_text = ' '.join(unicodedata.normalize("NFKD", element).strip().split())
        normalized_texts.append(normalized_text)

    concatenated_text = ' '.join(normalized_texts)
    return concatenated_text



def page_rtv(html):
    
    title = '//*[@class="article-header"]//h1/text()'
    subtitle = '//*[@class="subtitle"]/text()'
    lead = '//*[@class="lead"]/text()'
    author = '//*[@class="author-name"]/text()'
    published_time = '//*[@class="publish-meta"]/text()'
    content = '//*[@class="article-body"]/*[@class="article"]//descendant::p/text()'

    json = {
        "Title": extract_normalized_text(html, title),
        "SubTitle": extract_normalized_text(html, subtitle),
        "Lead": extract_normalized_text(html, lead),
        "Author": extract_normalized_text(html, author),
        "PublishedTime": extract_normalized_text(html, published_time),
        "Content": extract_normalized_text(html, content),
    }
    return json


def page_overstock(html):
    title =  '//table[@cellpadding="2"]/tbody/tr[@bgcolor]/td[2]/a/b/text()'
    content = '//table[@cellpadding="2"]/tbody/tr[@bgcolor]/td[2]/table//span[@class="normal"]/text()'
    list_price = '//table[@cellpadding="2"]/tbody/tr[@bgcolor]/td[2]/table//s/text()'
    price = '//table[@cellpadding="2"]/tbody/tr[@bgcolor]/td[2]/table//span[@class="bigred"]/b/text()'
    saving = '//table[@cellpadding="2"]/tbody/tr[@bgcolor]/td[2]/table//span[@class="littleorange"]/text()'

    text = extract_normalized_text(html, saving)
    json = {
        "Title": extract_normalized_text(html, title),
        "Content": extract_normalized_text(html, content),
        "ListPrice": extract_normalized_text(html, list_price),
        "Price": extract_normalized_text(html, price),
        "Saving": text[0:text.find('(')],
        "SavingPercent": text[text.find('(') + 1: text.find(')')]
    }
    return json




def page_zacimbe(html):
    title = '//div[@class="product_content_box"]/h1/text()'
    content = '//div[@class="short"]/p[1]/text()'
    description = '//div[@class="card-body editor_text"]//text()'
    ingredients = '//div[@id="product_2"]/div[@class="card-body"]/div[@class="text editor_text"]/p/text()'
    storage = '//div[@id="product_2"]/div[@class="card-body"]/div[@class="text editor_text"]/text()'
    price = '//div[@class="price"]/text()'
    delivery = '//div[@class="additional_data"]/text()'
    postage = '//div[@class="additional_data"]/ul[@class="basic_list"]/li[1]/text()'
    weight = '//div[@class="additional_data"]/ul[@class="basic_list"]/li[2]/text()'
    dimensions = '//div[@class="additional_data"]/ul[@class="basic_list"]/li[3]/text()'

    json = {    
        "Title": extract_normalized_text(html, title),
        "Content": extract_normalized_text(html, content),
        "Description": extract_normalized_text(html, description),
        "Ingredients": extract_normalized_text(html, ingredients),
        "Storage": extract_normalized_text(html, storage),
        "Price": extract_normalized_text(html, price),
        "Postage": extract_normalized_text(html, postage),
        "Delivery": extract_normalized_text(html, delivery),
        "Weight": extract_normalized_text(html, weight),
        "Dimensions": extract_normalized_text(html, dimensions),
    }
    return json