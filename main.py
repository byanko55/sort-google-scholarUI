from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

import requests
import pandas as pd
from bs4 import BeautifulSoup

GSCHOLAR_URL = 'https://scholar.google.com/scholar?start={}&num=20&q={}&hl=en&as_sdt=0,5'
STARTYEAR_URL = '&as_ylo={}'
ENDYEAR_URL = '&as_yhi={}'
ROBOT_KW=['unusual traffic from your computer network', 'not a robot']
MAX_PAPER = 100

app = FastAPI()

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def index(request:Request):
    return templates.TemplateResponse("index.html", {"request":request, "msg":"Go"})

@app.get('/search')
def search(keyword:str):
    session = requests.Session()
    
    links = []
    title = []
    citations = []
    year = []
    author = []
    publisher = []
    rank = [0]
    
    proxies = {
        'http': 'http://byanko77:Sortbycitation77@unblock.oxylabs.io:60000',
        'https': 'http://byanko77:Sortbycitation77@unblock.oxylabs.io:60000'
    }
    
    for n in range(0, MAX_PAPER, 20):
        url = GSCHOLAR_URL.format(str(n), keyword.replace(' ', '+'))
        page = session.get(url, proxies=proxies, verify=False)
        c = page.content
        
        if any(kw in c.decode('ISO-8859-1') for kw in ROBOT_KW):
            print("Robot checking detected, handling with selenium (if installed)")
        
        soup = BeautifulSoup(c, 'html.parser', from_encoding='utf-8')
        
        mydivs = soup.findAll("div", { "class" : "gs_or" })
        
        for div in mydivs:
            try:
                links.append(div.find('h3').find('a').get('href'))
            except: # catch *all* exceptions
                links.append('Look manually at: '+url)

            try:
                title.append(div.find('h3').find('a').text)
            except:
                title.append('Could not catch title')

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
                author.append("Author not found")

            try:
                publisher.append(get_publisher(div.find('div',{'class' : 'gs_a'}).text))
            except:
                publisher.append("Publisher not found")

            rank.append(rank[-1]+1)
            
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
        first_name, last_name = map(str, name.split(' '))
        first_name = '. '.join(i for i in first_name)
        full_name = first_name + ". " + last_name
        o_.append(full_name)
        
    out = ', '.join(name for name in o_)

    return out

def get_publisher(content):
    out = content.split("- ")[1]
    out = out.split(',')[0]
    
    return out