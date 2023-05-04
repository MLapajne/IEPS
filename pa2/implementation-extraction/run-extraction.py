import sys
import regex

html_rtv_audi = open('../input-extraction/rtvslo.si/Audi A6 50 TDI quattro_ nemir v premijskem razredu - RTVSLO.si.html').read()
html_rtv_volvo = open('../input-extraction/rtvslo.si/Volvo XC 40 D4 AWD momentum_ suvereno med najboljše v razredu - RTVSLO.si.html').read()

html_jewlery_a = open("../input-extraction/overstock.com/jewelry01.html", encoding='cp1252').read()
html_jewlery_b = open("../input-extraction/overstock.com/jewelry02.html", encoding='cp1252').read()

ALGORITHM = sys.argv[1]

if ALGORITHM == "A":
    print('Running algorithm using regular expressions')
    print(regex.page_rtv(html_rtv_audi))
    print(regex.page_rtv(html_rtv_volvo))
    print(regex.page_overstock(html_jewlery_a))
    print(regex.page_overstock(html_jewlery_b))
    # TODO custom page

elif ALGORITHM == "B":
    print('Running algorithm using XPath')
elif ALGORITHM == "C":
    print('Automatic Web extraction')
