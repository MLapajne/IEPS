from langdetect import detect
from nltk.corpus import stopwords
from nltk.tokenize import RegexpTokenizer
from iso639 import languages

print(stopwords.fileids())

import nltk
print(languages.get(alpha2='et').name)

jeyiki = ['af', 'ar', 'bg', 'bn', 'ca', 'cs', 'cy', 'da', 'de', 'el', 'en', 'es', 'et', 'fa', 'fi', 'fr', 'gu', 'he', 'hi', 'hr', 'hu', 'id', 'it', 'ja', 'kn', 'ko', 'lt', 'lv', 'mk', 'ml', 'mr', 'ne', 'nl', 'no', 'pa', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'so', 'sq', 'sv', 'sw', 'ta', 'te', 'th', 'tl', 'tr', 'uk', 'ur', 'vi', 'zh-cn', 'zh-tw']

if detLang == 'el':
    lang = "Greek"
elif detLang == 'zh-cn':
    lang = "chinese"
elif detLang == 'zh-tw':
    lang = "chinese"

for lange in jeyiki:
    print(languages.get(alpha2=lange).name)