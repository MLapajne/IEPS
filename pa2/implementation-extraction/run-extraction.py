import sys
import regex
import xPath
import myroadrunner

html_rtv_audi = open('../input-extraction/rtvslo.si/Audi A6 50 TDI quattro_ nemir v premijskem razredu - RTVSLO.si.html').read()
html_rtv_volvo = open('../input-extraction/rtvslo.si/Volvo XC 40 D4 AWD momentum_ suvereno med najboljše v razredu - RTVSLO.si.html').read()


html_jewlery_a = open("../input-extraction/overstock.com/jewelry01.html", encoding='cp1252').read()
html_jewlery_b = open("../input-extraction/overstock.com/jewelry02.html", encoding='cp1252').read()

html_pepe = open("../input-extraction/bitcoin.com/Meme Coin PEPE's Market Cap Surpasses $1B with 896% Surge Over the Past Week – Altcoins Bitcoin News.html").read()
html_sec = open("../input-extraction/bitcoin.com/Former SEC Enforcement Chief Coinbase's Arguments 'a Surefire Loser' and Possibly Criminal – Featured Bitcoin News.html").read()

html_ljubezen = open("../input-extraction/zacimbe.si/BAM Mešanica Sladkorna ljubezen, 110g.html").read()
html_pica = open("../input-extraction/zacimbe.si/BAM Mešanica Pica & Pašta, 25g.html").read()

ALGORITHM = sys.argv[1]

if ALGORITHM == "A":
    print('Running algorithm using regular expressions')
    print(regex.page_rtv(html_rtv_audi))
    print(regex.page_rtv(html_rtv_volvo))
    print(regex.page_overstock(html_jewlery_a))
    print(regex.page_overstock(html_jewlery_b))
    print(regex.page_bitcoin(html_pepe))
    print(regex.page_bitcoin(html_sec))
    print(regex.page_zacimbe(html_ljubezen))
    print(regex.page_zacimbe(html_pica))


    # TODO custom page

elif ALGORITHM == "B":
    print('Running algorithm using XPath')
    print(xPath.page_rtv(html_rtv_audi))
    print(xPath.page_rtv(html_rtv_volvo))
    print(xPath.page_overstock(html_jewlery_a))
    print(xPath.page_overstock(html_jewlery_b))
    print(xPath.page_zacimbe(html_ljubezen))
    print(xPath.page_zacimbe(html_pica))
elif ALGORITHM == "C":
    print('Automatic Web extraction')
    print(myroadrunner.road_runner(html_rtv_audi, html_rtv_volvo))
    print(myroadrunner.road_runner(html_jewlery_a, html_jewlery_b))


