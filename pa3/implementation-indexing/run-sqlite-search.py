import sqlite3
import sys
import time
from classes import Result
from bs4 import BeautifulSoup
from nltk import word_tokenize

conn = sqlite3.connect('inverted-index.db')

query_words = []
for i in range(1, len(sys.argv)):
    query_words.append(sys.argv[i].lower())

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

results = []

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

        for i in range(index-4, index + 4):
            snippet += page_tokenized[i] + ' '

        snippet += '... '

    result = Result(row[1], row[0], snippet)
    results.append(result)

end = time.time()

print("Results for a query:", "\""+" ".join(query_words)+"\"", "\n")
print("  Results found in", end - start, "ms.\n")
print("  Frequencies Document                                  Snippet")
print("  ----------- ----------------------------------------- -----------------------------------------------------------")

for result in results:
    print(f"  {result.frequencies:<11} {result.document:<41} {result.snippet}")
conn.close()
