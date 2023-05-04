import sys
import regex

html_rtv_audi = open('../input-extraction/rtvslo.si/Audi A6 50 TDI quattro_ nemir v premijskem razredu - RTVSLO.si.html').read()
html_rtv_volvo = open('../input-extraction/rtvslo.si/Volvo XC 40 D4 AWD momentum_ suvereno med najboljše v razredu - RTVSLO.si.html').read()

ALGORITHM = sys.argv[1]

if ALGORITHM == "A":
    print('Running algorithm using regular expressions')
    print(regex.page_audi(html_rtv_audi))

elif ALGORITHM == "B":
    print('Running algorithm using XPath')
elif ALGORITHM == "C":
    print('Automatic Web extraction')
