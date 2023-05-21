
data = [
    {
        'Frequencies': 4,
        'Document': 'evem.gov.si/evem.gov.si.666.html',
        'Snippet': 'Sistem SPOT je eden boljši ... dosedanje delovanje SPOT ni zadovoljivo za ... je bila zaključena. Sistem ni deloval dobro ...'
    },
    {
        'Frequencies': 1,
        'Document': 'e-uprava.gov.si/e-uprava.gov.si.42.html',
        'Snippet': '... ministrstvo je nadgradilo sistem za učinkovitejšo uporabo.'
    }
]

time = 2
query = "niki lepga"


def printOut(query, time, data): 
    print("Results for a query:", "\""+query+"\"", "\n")
    print("  Results found in", time, "ms.\n")
    print("  Frequencies Document                                  Snippet")
    print("  ----------- ----------------------------------------- -----------------------------------------------------------")
    
    for entry in data:
        frequencies = entry['Frequencies']
        document = entry['Document']
        snippet = entry['Snippet']

        
        print(f"  {frequencies:<11} {document:<41} {snippet}")
        
   
printOut(query, time, data)