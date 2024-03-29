from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

import datetime
import requests
import pandas as pd
from time import sleep
from bs4 import BeautifulSoup

app = FastAPI()

GSCHOLAR_URL = 'https://scholar.google.com/scholar?start={}&q={}&hl=en&as_sdt=0,5&as_ylo={}&as_yhi={}'
ROBOT_KW=['unusual traffic from your computer network', 'not a robot']
MAX_PAPER = 100
PROGRESS = 0
PROXY = None

""" 
    Erase the `#` in below code block, 
    if you want to send crawling requests via a proxy server.
"""
# PROXY = {
#     'http': 'http://PROXYIP:PROXYPORT',
#     'https': 'http://PROXYIP:PROXYPORT'
# }

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def index(request:Request):
    return templates.TemplateResponse("index.html", {"request":request, "msg":"Go"})

@app.get('/captcha')
def captcha():
    res = {'val': PROGRESS}
    return res

@app.get('/search')
def search(keyword:str, start:str, end:str):
    global PROGRESS
    session = requests.Session()
    
    start = 1900 if start == "" else int(start)
    end = datetime.date.today().year if end == "" else int(end)
    
    links = []
    title = []
    citations = []
    year = []
    author = []
    publisher = []
    rank = [0]
    
    for n in range(0, MAX_PAPER, 10):
        PROGRESS = n
        url = GSCHOLAR_URL.format(str(n), keyword.replace(' ', '+'), start, end)
        
        if PROXY != None:
            page = session.get(url, proxies=PROXY, verify=False)
        else :
            page = session.get(url, verify=False)

        c = page.content
        
        if any(kw in c.decode('ISO-8859-1') for kw in ROBOT_KW):
            print("Robot checking detected")
            return {'url':url, 'content':c, 'error':True }
        
        soup = BeautifulSoup(c, 'html.parser', from_encoding='utf-8')
        
        mydivs = soup.findAll("div", { "class" : "gs_or" })
        
        for div in mydivs:
            try:
                _l = div.find('h3').find('a').get('href')
                _t = div.find('h3').find('a').text
                links.append(_l)
                title.append(_t)
            except: # catch *all* exceptions
                continue

            try:
                citations.append(get_citations(str(div.format_string)))
            except:
                citations.append(0)

            try:
                year.append(get_year(div.find('div',{'class' : 'gs_a'}).text))
            except:
                year.append(0)

            try:
                author.append(get_author(div.find('div',{'class' : 'gs_a'}).text))
            except:
                title.append('Authors not found')

            try:
                publisher.append(get_publisher(div.find('div',{'class' : 'gs_a'}).text))
            except:
                publisher.append("Publisher not found")

            rank.append(rank[-1]+1)

        # Delay (Without delay, you may highly encounter the Robot checking)
        sleep(0.5)
            
    data = pd.DataFrame(list(zip(author, title, citations, year, publisher, links)), index = rank[1:],
                        columns=['Author', 'Title', 'Citations', 'Year', 'Publisher', 'Source'])
    data.index.name = 'Rank'
    data = data.replace(r'\r+|\n+|\t+','', regex=True)
    
    data_ranked = data.sort_values(by='Citations', ascending=False)
    
    res = []
    
    for _, row in data_ranked.iterrows():
        res.append(dict(row))
    
    return res

def get_citations(content):
    out = 0

    for char in range(0,len(content)):
        if content[char:char+9] == 'Cited by ':
            init = char+9

            for end in range(init+1,init+6):
                if content[end] == '<':
                    break

            out = content[init:end]

    return int(out)

def get_year(content):
    for char in range(0,len(content)):
        if content[char] == '-':
            out = content[char-5:char-1]

    if not out.isdigit():
        out = 0

    return int(out)

def get_author(content):
    for char in range(0, len(content)):
        if content[char] == '-':
            raw = content[:char-1]
            break

    authors = raw.split(", ")
    o_ = []

    for name in authors:
        full_name = list(map(str, name.split(' ')))

        if len(full_name) == 1:
            o_.append(full_name[0])
            continue

        first_name, last_name = full_name[0], full_name[-1]
        first_name = '. '.join(i for i in first_name)
        full_name = first_name + ". " + last_name
        o_.append(full_name)
        
    out = ', '.join(name for name in o_)

    return out

def get_publisher(content):
    infos = content.split("- ")
    out = infos[1].split(',')

    if len(out) == 2 and '…' not in out[0]:
        return out[0]
    
    return infos[2]