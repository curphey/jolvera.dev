---
published: true
title: 'Deploy a Python serverless function on ZEIT Now'
excerpt: "Let's write an API endpoint using a Python serverless function that will give us DNS records in JSON format from a given domain."
date: '2020-03-16T05:35:07.322Z'
status: 'In Progress'
author:
  name: 'Juan Olvera'
  picture: '/assets/blog/authors/tim.jpeg'
ogImage:
  url: '/static/deploy-python-on-now.jpeg'
changeLog:
  2019-09-19: 'First draft'
---

Let's write an API endpoint using a Python serverless function that will give us DNS records in JSON format from a given domain. We will send a GET request with a query parameter named "domain", i.e.,

```
GET https://localhost:3000/api?domain="jolvera.dev"
```

The tools we are going to use are a ZEIT account, npm, now-cli and a browser. I will assume that you already have npm and a browser installed.

The API that we are going to write is actually how I started the prototype of [DNS check](https://dnscheck.app). DNS check was born out of the necessity to explain clients and co-workers what's happening with a domain when we make a DNS change. Tools already exist that provide DNS lookup information, but most of them aren't simple enough, in my opinion.

We only need two dependencies for this project, [Bottle](https://bottlepy.org/docs/dev/) and [dnspython](http://www.dnspython.org/).

## Create the Python function

The first step is to create a function that returns the DNS records (A, CNAME, MX, for example.) of a given domain name using dnspython.

```python
import dns.resolver

ids = [
    "A",
    "NS",
    "CNAME",
    "SOA",
    "MX",
    "TXT",
    "AAAA",
]

def resolve(domain: str):
    result = []
    for record in ids:
        try:
            answers = dns.resolver.query(domain, record)
            data = [{"record": record, "value": rdata.to_text()} 
                    for rdata in answers]
            for item in data:
                result.append(item)
        except Exception as e:
            print(e)
    return result

print(resolve('jolvera.dev'))
```

Before creating any files in our computer, [let's try this function in Repl.it](https://repl.it/@jolvera/DNS-records). If everything is okay you will get something like:

```js
[
    {
        'record': 'A',
        'value': '3.19.25.128'
    },
    {
        'record': 'A',
        'value': '3.19.23.166'
    },
    {
        'record': 'NS',
        'value': 'b.zeit-world.org.'
    },
    {
        'record': 'NS',
        'value': 'e.zeit-world.net.'
    },
    {
        'record': 'NS',
        'value': 'f.zeit-world.com.'
    },
    {
        'record': 'NS',
        'value': 'a.zeit-world.co.uk.'
    },
    {
        'record': 'MX',
        'value': '10aspmx1.migadu.com.'
    },
    {
        'record': 'TXT',
        'value': '"v=spf1 a mx include:spf.migadu.com ~all"'
    }
]
```

Try with different domains, make sure it works, then proceed to create the API endpoint.

## Convert the function to a Serverless function

The serverless platform we are going to use is ZEIT Now. They make serverless development extremely easy and projects deployments a joy. 

To follow this example, create an account at [zeit.co](http://zeit.co/) and install Now globally in your system by running `npm i -g now`, and with that you are ready to go.

### Folder structure

Create a folder and call it `dnscheck` then create another folder inside called `api`.

```bash
$ mkdir dnscheck
$ mkdir dnscheck/api
```

This folder structure is all you need. 

### Virtual environment

Python best practices say we need a virtual environment, so we don't install our dependencies globally in the system (Like what we did with `npm i -g now` but in the Python world).
In this example, I'm going to use `virtualenv`, but you can use [Poetry](https://poetry.eustace.io/) or [Pipenv](https://docs.pipenv.org/en/latest/) as well. I chose `virtualenv` here to keep things simple.
Inside the `dnscheck/api` folder, create a new virtual environment.

```bash
$ cd dnscheck/api
(dnscheck/api) $ virtualenv venv
```

Then, activate the virtual environment.

```bash
(dnscheck/api) $ ./venv/bin/activate
```

With this, we have our virtual environment ready to go, and we can start installing dependencies that are only available in our project. We start by installing `dnspython` and `bottle`.

```bash
(dnscheck/api) $ pip install bottle dnspython
```

Then we create a `requirements.txt` file that lists all the dependencies we are using. Now uses this to install the dependencies while it's deploying.

```bash
(dnscheck/api) $ pip freeze > requirements.txt
```

### API endpoint with Bottle

Inside the `api/` folder, create a file named [`index.py`](http://index.py/). Inside write the following code.

```python
from bottle import Bottle, request
import dns.resolver

app = Bottle()

ids = [
    "A",
    "NS",
    "CNAME",
    "SOA",
    "MX",
    "TXT",
    "AAAA",
]


@app.get('/api')
def api():
    domain = request.query.get('domain')
    result = resolve(domain)
    return dict(data=result)
    

def resolve(domain: str):
    result = []
    for record in ids:
        try:
            answers = dns.resolver.query(domain, record)
            data = [{"record": record, "value": rdata.to_text()} 
                    for rdata in answers]
            for item in data:
                result.append(item)
        except Exception as e:
            print(e)
    return result
```

This code listens for GET requests in `http://localhost:3000/api` and tries to grab a query parameter named `domain`, so to be able to get the data we have to send a get request to [http://localhost:3000/api?domain=jolvera.dev](http://localhost:3000/api?domain=jolvera.dev) or simply open the URL in the browser.

To test it locally, inside the `dnscheck/` folder run `now dev`,

```bash
(dnscheck/api) $ cd ..
(dnscheck) $ now dev
```

if everything is okay, you should get the development URL.

```bash
> Ready! Available at http://localhost:3000
```

If so, go to your browser and visit [http://localhost:3000/api?domain=jolvera.dev](http://localhost:3000/api?domain=jolvera.dev) and you should see a response in JSON like shown in the following screenshot.

![Screenshot of the Python function in the browser](/static/dnscheck-screenshot.png)

### Deploy to Now

Everything is ready to deploy our serverless function to Now and share it to the world!

Inside the `dnscheck/` folder run `now` 

```bash
(dnscheck) $ now
```

and If everything goes okay, we will get a URL like [https://dnscheck-example-2k7pyj3cr.now.sh/](https://dnscheck-example-2k7pyj3cr.now.sh/), in my case I got [https://dnscheck-post-example.jolvera.now.sh/](https://dnscheck-post-example.jolvera.now.sh/), and you can test my domain going to [https://dnscheck-post-example.jolvera.now.sh/api?domain=jolvera.dev](https://dnscheck-post-example.jolvera.now.sh/api?domain=jolvera.dev).

[See the project in action.](https://i.imgur.com/t7l26yB.gifv)

## Conclusion

We were able to prototype a small idea into a workable API and share it on the web with ease. What we did in this post was the premise of my project and the train of thought I had to get something working. After I got the example working, I kept trying new ideas on it and added domain validation, a Next.js frontend and more.

Being able to prototype an idea into an API with these few tools encourage me to try new things more often. Once you get a first working example you will get motivate to keep going and build lots of things.
You can check my finished project dnscheck.app in these two repositories:

- [DNS Check frontend](https://github.com/j0lv3r4/dnscheck-frontend)
- [DNS Check Serverless function](https://github.com/j0lv3r4/dnscheck)

Also published in:

- <a rel="syndication" class="u-syndication" href="https://dev.to/jolvera/deploy-a-python-serverless-function-on-zeit-now-22cf">DEV.to</a>

