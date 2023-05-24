import os
import sys
import time
from classes import Result
from bs4 import BeautifulSoup
from nltk import word_tokenize

# read query
query_words = []
for i in range(1, len(sys.argv)):
    query_words.append(sys.argv[i].lower())

start = time.time()
results = []
directory = '../PA3-data/'
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(".html"):
            file_path = os.path.join(root, file).replace("\\", "/")

            with open(file_path, "r", encoding='utf-8') as file_obj:
                html_content = file_obj.read()

            # Extract text from the HTML
            soup = BeautifulSoup(html_content, 'html.parser')
            page_text = soup.body.get_text()

            # Tokenize text
            page_tokenized = word_tokenize(page_text, language='slovene')

            frequency = 0
            snippet = ""
            document = ""
            for i in range(len(page_tokenized)):
                if page_tokenized[i].lower() in query_words:
                    frequency += 1
                    index = i
                    document = file_path.split('/')
                    document = document[2] + "/" + document[3]

                    for i in range(index - 4, index + 4):
                        snippet += page_tokenized[i] + ' '

                    snippet += '... '

            if frequency > 0:
                result = Result(frequency, document, snippet)
                results.append(result)


sorted = sorted(results, key=lambda r: r.frequencies, reverse=True)
end = time.time()

print("Results for a query:", "\""+" ".join(query_words)+"\"", "\n")
print("  Results found in", end - start, "ms.\n")
print("  Frequencies Document                                  Snippet")
print("  ----------- ----------------------------------------- -----------------------------------------------------------")

i = 0
for result in sorted:
    print(f"  {result.frequencies:<11} {result.document:<41} {result.snippet}")
    i += 1
    if i > 9:
        break
