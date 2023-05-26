# Programming assignment 3

The goal of this assignment is to extract the textual context from the submitted HTML files, pre-process this data and store it in an index structure. The index allows efficient searching and querying of the textual content extracted from the HTML files.

## Project set up

If you want a fresh database first delete inverted-index.db, then run script db_init.py (python db_init.py). Once the database is setup, create an index by 
running python data-process-index.py.

## Running search algorithms

Go to folder implementation-index and execute python run-sqlite-search.py <search query> (example: python run-sqlite-search.py social services) to run sqlite search. You can run naive search by executing python run-naive-search.py (example: python run-naive-search.py social services). NOTE: both scripts always expect to receive at least one argument
