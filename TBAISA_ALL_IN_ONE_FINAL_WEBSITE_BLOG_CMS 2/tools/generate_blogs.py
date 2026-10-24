#!/usr/bin/env python3
'''Pages CMS markdown -> SEO HTML blog pages for a static Hostinger website.
Run: python tools/generate_blogs.py (requires tools/requirements.txt)
'''
from __future__ import annotations
import datetime as dt
import html
import json
from pathlib import Path
import re
from urllib.parse import quote
import xml.etree.ElementTree as ET
import yaml
import mistune

ROOT = Path(__file__).resolve().parent.parent
SITE = 'https://tbaisaimpexp.com'
POSTS = ROOT / '_posts'
BLOG = ROOT / 'blog'
DEFAULT_IMAGE = '/images/global-export-logistics.webp'


def h(value: object) -> str:
    return html.escape(str(value if value is not None else ''), quote=True)


def slugify(value: str) -> str:
    value = re.sub(r'[^a-z0-9]+', '-', value.lower()).strip('-')
    return value[:100] or 'article'


def url_image(path: str) -> str:
    path = str(path or DEFAULT_IMAGE).strip()
    if path.startswith('https://'):
        return path
    if path.startswith('http://'):
        return path
    return path if path.startswith('/') else '/' + path


def absolute_image(path: str) -> str:
    path = url_image(path)
    return path if path.startswith('http') else SITE + quote(path, safe='/-._~')


def parse_post(path: Path):
    raw = path.read_text(encoding='utf-8').replace('\r\n', '\n')
    match = re.match(r'\A---\s*\n(.*?)\n---\s*\n(.*)\Z', raw, flags=re.S)
    if not match:
        raise ValueError(f'{path.name}: YAML frontmatter missing')
    data = yaml.safe_load(match.group(1)) or {}
    if not isinstance(data, dict):
        raise ValueError(f'{path.name}: invalid YAML frontmatter')
    if data.get('published') is False:
        return None
    title = str(data.get('title') or '').strip()
    if not title:
        raise ValueError(f'{path.name}: title is required')
    description = str(data.get('description') or '').strip()
    raw_date = data.get('date') or dt.date.today()
    if isinstance(raw_date, dt.datetime):
        raw_date=raw_date.date()
    if isinstance(raw_date, dt.date):
        date=raw_date
    else:
        date=dt.date.fromisoformat(str(raw_date)[:10])
    return {
        'filename': path.name,
        'slug': slugify(path.stem),
        'title': title,
        'description': description,
        'date': date,
        'category': str(data.get('category') or 'Export Insights'),
        'image': str(data.get('featured_image') or DEFAULT_IMAGE),
        'body': match.group(2).strip(),
    }


def card(post):
    url=f"blog/{quote(post['slug'])}/"
    image=url_image(post['image'])
    desc=(post['description'] or post['title'])
    wordcount=len(post['body'].split())
    read_time=max(1, round(wordcount/200))
    return (f'<article class="insight-card reveal">'
            f'<a class="insight-card-media" href="{url}" aria-label="Read: {h(post["title"])}">'
            f'<img src="{h(image)}" alt="{h(post["title"])}" loading="lazy" width="720" height="450">'
            f'<span class="insight-tag">{h(post["category"])}</span></a>'
            f'<div class="insight-card-body"><div class="insight-meta">'
            f'<span>{h(post["date"].strftime("%d %b %Y"))}</span><span aria-hidden="true">•</span>'
            f'<span>{read_time} min read</span></div><h3><a href="{url}">{h(post["title"])}</a></h3>'
            f'<p>{h(desc)}</p><a class="insight-read-more" href="{url}">Read article <span aria-hidden="true">↗</span></a>'
            f'</div></article>')


def replace_block(page: Path, marker: str, content: str):
    start=f'<!-- GENERATED_{marker}_START -->'
    end=f'<!-- GENERATED_{marker}_END -->'
    data=page.read_text(encoding='utf-8')
    if start not in data or end not in data:
        raise RuntimeError(f'Marker {marker} missing in {page}')
    data=re.sub(re.escape(start)+r'.*?'+re.escape(end),
                lambda _: start+'\n'+content+'\n'+end, data, flags=re.S)
    page.write_text(data, encoding='utf8')


def render_post(post, header, footer):
    url=f'{SITE}/blog/{post["slug"]}/'
    image=url_image(post['image'])
    desc=post['description'] or post['title']
    body=mistune.create_markdown(plugins=['table','strikethrough','url'])(post['body'])
    body=re.sub(r'(<h[23]>)', r'<span class="sr-only">Section: </span>\1', body) if False else body
    schema={
        '@context':'https://schema.org','@type':'BlogPosting','headline':post['title'],
        'datePublished':post['date'].isoformat(),'dateModified':post['date'].isoformat(),
        'description':desc, 'image':[absolute_image(post['image'])],
        'author':{'@type':'Organization','name':'TBAISA Import Export'},
        'publisher':{'@type':'Organization','name':'TBAISA Import Export',
                     'logo':{'@type':'ImageObject','url':f'{SITE}/images/logo-800.png'}},
        'mainEntityOfPage':url,
    }
    ld_json=json.dumps(schema,ensure_ascii=False).replace('<','\\u003c')
    head=(f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<base href="/">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#0B1D3A">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css"><link rel="icon" type="image/png" href="images/favicon-32.png">
<title>{h(post['title'])} | TBAISA Import Export</title>
<meta name="description" content="{h(desc)}">
<link rel="canonical" href="{h(url)}"><meta property="og:type" content="article">
<meta property="og:site_name" content="TBAISA Import Export">
<meta property="og:title" content="{h(post['title'])}"><meta property="og:description" content="{h(desc)}">
<meta property="og:url" content="{h(url)}"><meta property="og:image" content="{h(absolute_image(post['image']))}">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{ld_json}</script>
</head><body>''')
    main=(f'''<main id="main">
<section class="article-hero"><div class="container narrow"><nav class="breadcrumb" aria-label="Breadcrumb">
<a href="index.html">Home</a><span aria-hidden="true">›</span><a href="blog.html">Blog</a><span aria-hidden="true">›</span><span aria-current="page">Article</span></nav>
<span class="eyebrow">{h(post['category'])} · {post['date'].strftime('%d %b %Y')}</span>
<h1>{h(post['title'])}</h1><p class="lead">{h(desc)}</p></div></section>
<section class="article-wrap" aria-label="Article content"><div class="container narrow">
<div class="article-cover"><img src="{h(image)}" alt="{h(post['title'])}" loading="eager" width="1100" height="580"></div>
<article class="article-body"><div class="article-content"><div class="blog-prose">{body}</div>
<div class="article-disclaimer"><strong>Note:</strong> Product specifications, trade regulations and required documents vary by destination. Verify the latest requirements before ordering.</div>
<div class="article-contact"><div><span class="eyebrow light">Need a Bulk Quotation?</span><h2>Discuss your product requirements with TBAISA.</h2>
<p>Share commodity, target grade, packing, volume and destination for a tailored discussion.</p></div>
<a class="btn btn-primary" href="contact.html">Contact Export Team ↗</a></div>
</div></article></div></section>
<section class="section alt"><div class="container"><a class="btn btn-outline" href="blog.html">← View All Articles</a></div></section>
</main>''')
    # header has content between <body> and <main>; footer includes </main> onward originally
    return head+header+'\n'+main+'\n'+footer


def update_sitemap(posts):
    path=ROOT/'sitemap.xml'
    text=path.read_text(encoding='utf8')
    text=re.sub(r'\s*<!-- GENERATED_SITEMAP_START -->.*?<!-- GENERATED_SITEMAP_END -->', '',text,flags=re.S)
    lines=['  <!-- GENERATED_SITEMAP_START -->']
    for p in posts:
        lines.extend([f'  <url><loc>{SITE}/blog/{h(p["slug"])}/</loc>',
                      f'    <lastmod>{p["date"].isoformat()}</lastmod><priority>0.6</priority></url>'])
    lines.append('  <!-- GENERATED_SITEMAP_END -->')
    text=text.replace('</urlset>','\n'+'\n'.join(lines)+'\n</urlset>')
    path.write_text(text,encoding='utf8')


def main():
    files=sorted(POSTS.glob('*.md'))
    posts=[p for f in files if (p:=parse_post(f))]
    posts.sort(key=lambda item:(item['date'],item['filename']),reverse=True)
    if len({p['slug'] for p in posts}) != len(posts):
        raise ValueError('Two published blog posts have the same URL slug. Rename one Markdown filename.')
    sample=ROOT/'how-to-source-indian-spices-in-bulk.html'
    source=sample.read_text(encoding='utf8')
    header=source.split('<body>',1)[1].split('<main id="main">',1)[0]
    footer=source.split('</main>',1)[1]  # contains footer, scripts and closing body tags
    BLOG.mkdir(exist_ok=True)
    for child in BLOG.iterdir():
        if child.is_dir() and (child/'index.html').exists():
            # directory under blog/ is reserved for generated post pages
            (child/'index.html').unlink()
            child.rmdir()
    for post in posts:
        dest=BLOG/post['slug']
        dest.mkdir(parents=True,exist_ok=True)
        (dest/'index.html').write_text(render_post(post,header,footer),encoding='utf8')
    replace_block(ROOT/'blog.html','BLOG_CARDS','\n'.join(card(post) for post in posts))
    defaults=(ROOT/'tools/home_default_cards.html').read_text(encoding='utf8')
    default_cards=re.findall(r'<article class="insight-card reveal">.*?</article>', defaults,flags=re.S)
    home_cards=[card(p) for p in posts[:3]]+default_cards[:max(0,3-len(posts))]
    replace_block(ROOT/'index.html','HOME_CARDS','\n'.join(home_cards))
    update_sitemap(posts)
    print(f'Generated {len(posts)} published blog pages. Existing three static posts preserved.')

if __name__=='__main__':
    main()
