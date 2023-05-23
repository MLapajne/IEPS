import os
import sqlite3
import sys
import time
from bs4 import BeautifulSoup
from nltk import word_tokenize

conn = sqlite3.connect('inverted-index.db')

query_words = []
for i in range(1, len(sys.argv)):
    query_words.append(sys.argv[i])

placeholders = ','.join(['?'] * len(query_words))

c = conn.cursor()
start = time.time()

query = f'''
    SELECT p.documentName AS docName, SUM(frequency) AS freq, GROUP_CONCAT(indexes) AS idxs
    FROM Posting p
    WHERE
        p.word IN ({placeholders})
    GROUP BY p.documentName
    ORDER BY freq DESC;
'''
cursor = c.execute(query, query_words)
end = time.time()

print("Results for a query:", "\""+" ".join(query_words)+"\"", "\n")
print("  Results found in", end - start, "ms.\n")
print("  Frequencies Document                                  Snippet")
print("  ----------- ----------------------------------------- -----------------------------------------------------------")

for row in cursor:
    indexes = row[2].split(',')
    document = row[0]

    file_path = '../PA3-data/' + document

    with open(file_path, "r", encoding='utf-8') as file_obj:
        html_content = file_obj.read()

    # Extract text from the HTML
    soup = BeautifulSoup(html_content, 'html.parser')
    page_text = soup.get_text()

    page_tokenized = word_tokenize(page_text, language='slovene')

    snippet = "..."
    for index_str in indexes:
        index = int(index_str)
        query_word = page_tokenized[index]
        if query_word[0].isupper():
            for i in range(index, index+4):
                snippet += page_tokenized[i] + ' '

            snippet += '... '
        else:
            snippet += '...'
            for i in range(index-4, index + 4):
                snippet += page_tokenized[i] + ' '

            snippet += '... '

    print(f"  {row[1]:<11} {row[0]:<41} {snippet}")

conn.close()
