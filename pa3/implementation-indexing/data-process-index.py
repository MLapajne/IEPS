from bs4 import BeautifulSoup
import string
from nltk import word_tokenize
import stopwords
from classes import Document, WordData
import re
import os
import sqlite3


def filter_tokens(tokens):
    filtered_tokens = []
    for token in tokens:
        token_lower = token.lower().strip()

        cleaned_token = re.sub(r'\W+', '', token_lower)
        if cleaned_token and token_lower not in string.punctuation and token_lower not in stopwords.stop_words_slovene:
            filtered_tokens.append(cleaned_token)

    return filtered_tokens


def db_insert_word(word):
    c.execute('''
        INSERT OR IGNORE INTO IndexWord VALUES 
            (?);
    ''', (word,))


def db_insert_posting(word, document_name, freq, indexes):
    c.execute('''
        INSERT INTO Posting VALUES 
            (?, ?, ?, ?);
    ''', (word, document_name, freq, indexes))


def create_index():
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

                # Filter the tokenized text - remove punctuation and stopwords
                filtered_tokens = filter_tokens(page_tokenized)
                preprocessed_document = Document(file, page_text)

                # Find indexes of all words in text
                for word in filtered_tokens:
                    if word not in preprocessed_document.words:
                        db_insert_word(word)

                        # Get indexes of word occurrences
                        indexes = [str(index) for index, value in enumerate(page_tokenized) if re.sub(r'\W+', '', value.lower().strip()) == word]
                        preprocessed_document.words[word] = WordData(len(indexes), ','.join(indexes))
                        print("WORD: " + word + " OCCURS: " + str(len(indexes)) + " INDEXES: " + ','.join(indexes),
                              "FILE: " + file)
                        db_insert_posting(word, file_path.replace('../PA3-data/', ''), len(indexes), ','.join(indexes))

                conn.commit()


# Connect to db
conn = sqlite3.connect('inverted-index.db')
c = conn.cursor()

create_index()
conn.commit()
conn.close()

# db_insert_word('test1')
# db_insert_posting('test1', 'test/test1', 5, '(1, 5, 7)')