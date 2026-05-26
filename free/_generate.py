#!/usr/bin/env python3
"""Generate the 5 free-asset landing pages from a shared template.

Run from this directory:  python3 _generate.py
"""
from pathlib import Path

HERE = Path(__file__).parent
ROOT = HERE.parent  # landing-page/

# Lead magnets, keyed by slug (URL trigger)
ASSETS = [
    {
        "slug": "tools",
        "trigger": "TOOLS",
        "title": "The Trapped Tradie Escape Plan",
        "kicker": "14-page plan for getting off the tools in 90 days",
        "blurb": (
            "Same plan I used after 10 years on the tools. Same one I've given "
            "500+ tradies who went on to close for £10K+ a month."
        ),
        "pdf": "01-trapped-tradie-escape-plan.pdf",
    },
    {
        "slug": "script",
        "trigger": "SCRIPT",
        "title": "The Cowboy Close Script",
        "kicker": "The call script my team uses to close £5K to £15K offers",
        "blurb": (
            "Word for word. Openers, tonality, every common objection, the close. "
            "Same script my closers are running to do £25K+ months."
        ),
        "pdf": "02-cowboy-close-script.pdf",
    },
    {
        "slug": "dms",
        "trigger": "DMS",
        "title": "20 Cold DMs That Book Sales Calls",
        "kicker": "20 cold DMs that get my students hired as closers",
        "blurb": (
            "Twenty DM templates that book interviews with founders doing "
            "£30K to £300K a month. Open the doc, edit the name, send."
        ),
        "pdf": "03-cold-dms-that-book-calls.pdf",
    },
    {
        "slug": "os",
        "trigger": "OS",
        "title": "The £10K Closer Operating System",
        "kicker": "The daily system behind every £10K+ closer in my group",
        "blurb": (
            "Morning routine, call prep, pipeline tracking, follow-up cadence, "
            "weekly review. Built from what the top 10% in the group actually do."
        ),
        "pdf": "04-10k-closer-operating-system.pdf",
    },
    {
        "slug": "training",
        "trigger": "TRAINING",
        "title": "The Wolf of South East Asia 5-Day Training",
        "kicker": "5 days of training to get you from zero to first close",
        "blurb": (
            "Five emails, one a day. Same playbook that's taken students from "
            "broke to £25K a month."
        ),
        "pdf": "05-wolf-5-day-training.pdf",
    },
]

# YouTube testimonial IDs reused from the VSL page
VIDEOS = [
    ("XavZmSk0s_Q", "From $0 to first close in 49 days"),
    ("Xo2rYCwxiSc", "From $10/hour to $300 in 29 minutes"),
    ("t-jzlSff5AE", "Stuck at $2k/month, now doing $30k/month"),
    ("TiW65tOWSII", "$1,000 in a single day with zero experience"),
    ("L0E8Hrlw6CI", "Hired in 3 weeks"),
    ("eqhnlQT6BWE", "Spent his last money on mentorship and it 6x'd his income"),
]

# Screenshot wins, pulled from the existing /wins/ folder. Caption shown on hover.
WINS = [
    ("41k-virginia.png", "Virginia, $41k cash in"),
    ("kaspar-first-sale.png", "Kaspars, First high-ticket sale"),
    ("juno-role.png", "Juno, Closing role secured"),
    ("jiri-deal-closed.png", "Jiří, Deal closed"),
    ("jake-setting-role.png", "Jake, New role alert"),
    ("jaxon-role-landed.png", "Jaxon, Landed a closing role"),
    ("jsb-interview.png", "JSB, Interviews on interviews"),
    ("jake-linkedin.png", "Jake, LinkedIn working"),
    ("ianna-20k.png", "Ianna, $20k deal"),
    ("felipe-1st-month.png", "Felipe, 1st month as a closer"),
    ("felipe-closes.png", "Felipe, Keep grinding"),
    ("darian-setting-role.png", "Darian, First role"),
    ("andreas-role.png", "Andreas, Commission sales role"),
    ("alex-role.png", "Alex, Role secured"),
    ("zach-double-deal.png", "Zach, Double deal Friday"),
    ("mads-%24%24%24.png", "Madeleine, BOOM"),
    ("jack-new-role.png", "Jack, From imposter to closer"),
    ("virgin-18k.png", "Virginia, $18k"),
    ("felipe-1st-week.png", "Felipe, 1st week"),
    ("felipe-2000cc.png", "Felipe, $2,000 cc"),
    ("felipe-2800cc.jpg", "Felipe, $2,800 cc"),
    ("felipe-3300aussie.jpg", "Felipe, $3,300 AUD"),
    ("felipe-5600aud.png", "Felipe, $5,600 AUD"),
    ("felipe-37pct.jpg", "Felipe, 37% close rate"),
    ("jon-1m3-deal.jpg", "Jon, £1.3M deal closed"),
    ("zach-huge-role.png", "Zach, Huge role"),
    ("tj-5k-cad.png", "TJ, $5k CAD"),
    ("reece-bonus.png", "Reece, Bonus"),
    ("marion-0-30k.png", "Marion, 0 to 30k"),
    ("xander-job.png", "Xander, Job landed"),
]

TYPEFORM_ID = "VaWVcSCm"


def render(asset):
    title = asset["title"]
    kicker = asset["kicker"]
    blurb = asset["blurb"]
    pdf = asset["pdf"]
    trigger = asset["trigger"]

    video_html = "\n".join(
        f'''        <div class="vid-card">
          <div class="vid-aspect"><iframe src="https://www.youtube.com/embed/{vid}" title="{vtitle}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
          <div class="vid-caption">{vtitle}</div>
        </div>'''
        for vid, vtitle in VIDEOS
    )

    win_html = "\n".join(
        f'        <a class="win-tile" href="../../wins/{fname}" target="_blank" rel="noopener"><img src="../../wins/{fname}" alt="{caption}" loading="lazy" /><span class="win-cap">{caption}</span></a>'
        for fname, caption in WINS
    )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} · Free Download · Cowboy Closers</title>
  <meta name="description" content="{kicker}" />
  <link rel="icon" type="image/png" href="../../favicon.png" />
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    :root {{
      --bg: #ffffff;
      --bg-alt: #f4f6fb;
      --bg-deep: #000000;
      --ink: #000000;
      --mid: #1a1a1a;
      --muted: #555555;
      --rust: #2563eb;
      --line: #e5e7eb;
      --max-w: 1080px;
    }}
    html {{ scroll-behavior: smooth; }}
    body {{
      background: var(--bg);
      color: var(--ink);
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-weight: bold;
      font-size: 17px;
      line-height: 1.7;
      -webkit-font-smoothing: antialiased;
    }}
    a {{ color: var(--rust); }}

    /* nav */
    nav {{
      padding: 22px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--line);
      position: sticky;
      top: 0;
      background: rgba(255,255,255,0.94);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      z-index: 100;
    }}
    .logo {{
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-weight: 900;
      font-size: 22px;
      letter-spacing: -0.02em;
      color: var(--ink);
      text-decoration: none;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .logo-mark {{ width: 32px; height: 32px; object-fit: contain; }}
    .nav-cta {{
      background: var(--ink);
      color: var(--bg);
      font-weight: 700;
      font-size: 11px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      padding: 13px 24px;
      border-radius: 1px;
      text-decoration: none;
      transition: background 0.25s, transform 0.2s;
    }}
    .nav-cta:hover {{ background: var(--rust); transform: translateY(-1px); }}

    .container {{ max-width: var(--max-w); margin: 0 auto; padding: 0 32px; }}
    section {{ padding: 90px 0; }}

    .eyebrow {{
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.32em;
      text-transform: uppercase;
      color: var(--rust);
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }}
    .eyebrow::before {{ content: ''; width: 32px; height: 1px; background: var(--rust); }}

    h1.hero-h1 {{
      font-weight: 900;
      font-size: clamp(32px, 4.8vw, 60px);
      line-height: 1.04;
      letter-spacing: -0.02em;
      text-transform: uppercase;
      margin-bottom: 18px;
    }}
    h2.editorial {{
      font-weight: 900;
      font-size: clamp(34px, 4.6vw, 52px);
      line-height: 1.05;
      letter-spacing: -0.03em;
      margin-bottom: 14px;
    }}
    .kicker {{
      font-size: 18px;
      color: var(--mid);
      max-width: 640px;
      margin-bottom: 14px;
      line-height: 1.5;
    }}
    .blurb {{
      font-size: 16px;
      color: var(--muted);
      max-width: 640px;
      line-height: 1.7;
      margin-bottom: 32px;
      font-weight: 500;
    }}

    .hero {{ padding: 64px 0 48px; text-align: center; }}
    .hero .container > * {{ margin-left: auto; margin-right: auto; }}
    .hero .eyebrow {{ justify-content: center; }}

    .cta-row {{ display: flex; justify-content: center; gap: 14px; flex-wrap: wrap; margin-bottom: 40px; }}
    .primary-cta {{
      background: var(--ink);
      color: var(--bg);
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      padding: 18px 38px;
      border-radius: 1px;
      text-decoration: none;
      transition: background 0.25s, transform 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }}
    .primary-cta:hover {{ background: var(--rust); transform: translateY(-1px); }}
    .secondary-cta {{
      background: transparent;
      color: var(--ink);
      border: 1.5px solid var(--ink);
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      padding: 16.5px 32px;
      border-radius: 1px;
      text-decoration: none;
      transition: background 0.25s, color 0.25s;
    }}
    .secondary-cta:hover {{ background: var(--ink); color: var(--bg); }}

    /* PDF cover */
    .pdf-cover {{
      max-width: 520px;
      margin: 0 auto;
      background: var(--ink);
      color: var(--bg);
      padding: 56px 40px;
      border: 1px solid var(--ink);
      text-align: left;
      position: relative;
    }}
    .pdf-cover .pdf-eyebrow {{
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.32em;
      color: var(--rust);
      text-transform: uppercase;
      margin-bottom: 18px;
    }}
    .pdf-cover .pdf-title {{
      font-size: 28px;
      line-height: 1.1;
      font-weight: 900;
      letter-spacing: -0.015em;
      text-transform: uppercase;
      margin-bottom: 28px;
    }}
    .pdf-cover .pdf-meta {{
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.18em;
      color: #9aa3b1;
      text-transform: uppercase;
      border-top: 1px solid #2a2a2a;
      padding-top: 18px;
      display: flex;
      justify-content: space-between;
    }}
    .pdf-row {{ display: flex; justify-content: center; gap: 14px; flex-wrap: wrap; margin-top: 22px; }}
    .pdf-row .secondary-cta {{ font-size: 11px; padding: 14px 24px; }}

    /* alt section */
    .alt {{ background: var(--bg-alt); }}

    /* video grid */
    .vid-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 22px; margin-top: 40px; }}
    .vid-card {{ background: var(--bg); border: 1px solid var(--line); }}
    .vid-aspect {{ position: relative; padding-bottom: 56.25%; background: #000; }}
    .vid-aspect iframe {{ position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }}
    .vid-caption {{ padding: 14px 18px; font-size: 14px; font-weight: 700; color: var(--ink); }}

    /* wins grid */
    .wins-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; margin-top: 40px; }}
    .win-tile {{ position: relative; display: block; aspect-ratio: 4/3; background: #f0f0f0; overflow: hidden; border: 1px solid var(--line); }}
    .win-tile img {{ width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }}
    .win-tile:hover img {{ transform: scale(1.04); }}
    .win-cap {{
      position: absolute; left: 0; right: 0; bottom: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0));
      color: #fff; font-size: 11px; font-weight: 700;
      letter-spacing: 0.08em; padding: 22px 12px 10px;
      opacity: 0; transition: opacity 0.25s;
    }}
    .win-tile:hover .win-cap {{ opacity: 1; }}

    /* typeform */
    .apply-wrap {{ max-width: 760px; margin: 36px auto 0; }}
    .tf-embed {{ width: 100%; height: 640px; border: 0; }}

    /* section heads centered */
    .section-head {{ text-align: center; max-width: 720px; margin: 0 auto; }}
    .section-head .eyebrow {{ justify-content: center; }}

    /* footer */
    footer {{
      background: var(--bg-deep);
      color: #aaa;
      padding: 50px 0 40px;
      font-size: 12px;
      letter-spacing: 0.08em;
      text-align: center;
    }}
    footer a {{ color: #fff; text-decoration: none; }}
    .footer-brand {{ font-weight: 900; font-size: 18px; color: #fff; text-transform: uppercase; display: inline-block; margin-bottom: 10px; }}

    @media (max-width: 640px) {{
      section {{ padding: 64px 0; }}
      nav {{ padding: 18px 22px; }}
      .container {{ padding: 0 22px; }}
      .pdf-aspect {{ padding-bottom: 140%; }}
    }}
  </style>
</head>
<body>
  <nav>
    <a href="/new" class="logo">
      <img src="../../favicon.png" class="logo-mark" alt="" />
      Cowboy Closers
    </a>
    <a href="#apply" class="nav-cta">Apply Now</a>
  </nav>

  <!-- HERO + DOWNLOAD -->
  <section class="hero">
    <div class="container">
      <div class="eyebrow">Free Download · {trigger}</div>
      <h1 class="hero-h1">{title}</h1>
      <p class="kicker">{kicker}</p>
      <p class="blurb">{blurb}</p>
      <div class="cta-row">
        <a href="/free/pdfs/{pdf}" download class="primary-cta">Download the PDF</a>
        <a href="#apply" class="secondary-cta">Apply for a call</a>
      </div>
      <div class="pdf-cover">
        <div class="pdf-eyebrow">PDF · {trigger}</div>
        <div class="pdf-title">{title}</div>
        <div class="pdf-row">
          <a href="/free/pdfs/{pdf}" target="_blank" rel="noopener" class="primary-cta" style="background:var(--rust);color:var(--bg);">Open PDF</a>
          <a href="/free/pdfs/{pdf}" download class="secondary-cta" style="color:var(--bg);border-color:var(--bg);">Download</a>
        </div>
        <div class="pdf-meta">
          <span>{trigger}.pdf</span>
          <span>Free</span>
        </div>
      </div>
    </div>
  </section>

  <!-- APPLY (TYPEFORM) -->
  <section id="apply" class="alt">
    <div class="container">
      <div class="section-head">
        <div class="eyebrow">Apply</div>
        <h2 class="editorial">Want help <em>landing a closer role?</em></h2>
        <p class="blurb" style="margin: 0 auto 0;">Fill out the application. If you're a fit we'll jump on a call this week.</p>
      </div>
      <div class="apply-wrap">
        <iframe class="tf-embed" src="https://form.typeform.com/to/{TYPEFORM_ID}?typeform-embed=embed-widget" title="Apply for Cowboy Closers"></iframe>
      </div>
    </div>
  </section>

  <!-- VIDEO TESTIMONIALS -->
  <section>
    <div class="container">
      <div class="section-head">
        <div class="eyebrow">Students</div>
        <h2 class="editorial">In their own words</h2>
      </div>
      <div class="vid-grid">
{video_html}
      </div>
    </div>
  </section>

  <!-- PHOTO WINS -->
  <section class="alt">
    <div class="container">
      <div class="section-head">
        <div class="eyebrow">Wins</div>
        <h2 class="editorial">From the group chat</h2>
        <p class="blurb" style="margin: 0 auto 0;">Every screenshot is a real student.</p>
      </div>
      <div class="wins-grid">
{win_html}
      </div>
    </div>
  </section>

  <footer>
    <div class="container">
      <div class="footer-brand">Cowboy Closers</div>
      <div>© Cowboy Closers · <a href="/privacy-policy">Privacy</a> · <a href="/terms">Terms</a></div>
    </div>
  </footer>
</body>
</html>
"""


def render_index():
    card_html = "\n".join(
        f'''        <a class="asset-card" href="/free/{a["slug"]}">
          <div class="asset-num">0{i+1}</div>
          <div class="asset-trigger">Trigger: {a["trigger"]}</div>
          <h3 class="asset-title">{a["title"]}</h3>
          <p class="asset-kicker">{a["kicker"]}</p>
          <span class="asset-cta">Open →</span>
        </a>'''
        for i, a in enumerate(ASSETS)
    )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Free Resources · Cowboy Closers</title>
  <meta name="description" content="Five free playbooks to help you land a closing role and hit £10K/month from a laptop." />
  <link rel="icon" type="image/png" href="../favicon.png" />
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    :root {{
      --bg: #ffffff;
      --bg-alt: #f4f6fb;
      --bg-deep: #000000;
      --ink: #000000;
      --mid: #1a1a1a;
      --muted: #555555;
      --rust: #2563eb;
      --line: #e5e7eb;
      --max-w: 1080px;
    }}
    html {{ scroll-behavior: smooth; }}
    body {{
      background: var(--bg);
      color: var(--ink);
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-weight: bold;
      font-size: 17px;
      line-height: 1.7;
      -webkit-font-smoothing: antialiased;
    }}
    a {{ color: var(--rust); }}

    nav {{
      padding: 22px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--line);
      position: sticky;
      top: 0;
      background: rgba(255,255,255,0.94);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      z-index: 100;
    }}
    .logo {{
      font-weight: 900;
      font-size: 22px;
      letter-spacing: -0.02em;
      color: var(--ink);
      text-decoration: none;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .logo-mark {{ width: 32px; height: 32px; object-fit: contain; }}
    .nav-cta {{
      background: var(--ink);
      color: var(--bg);
      font-weight: 700;
      font-size: 11px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      padding: 13px 24px;
      border-radius: 1px;
      text-decoration: none;
      transition: background 0.25s, transform 0.2s;
    }}
    .nav-cta:hover {{ background: var(--rust); transform: translateY(-1px); }}

    .container {{ max-width: var(--max-w); margin: 0 auto; padding: 0 32px; }}
    section {{ padding: 90px 0; }}

    .eyebrow {{
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.32em;
      text-transform: uppercase;
      color: var(--rust);
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }}
    .eyebrow::before {{ content: ''; width: 32px; height: 1px; background: var(--rust); }}

    .hero {{ padding: 80px 0 40px; text-align: center; }}
    .hero .eyebrow {{ justify-content: center; }}
    h1.hero-h1 {{
      font-weight: 900;
      font-size: clamp(36px, 5.4vw, 68px);
      line-height: 1.02;
      letter-spacing: -0.025em;
      text-transform: uppercase;
      margin-bottom: 18px;
    }}
    h1 em {{ font-style: italic; font-weight: 400; color: var(--rust); }}
    .hero-sub {{
      font-size: 18px;
      color: var(--mid);
      line-height: 1.55;
      max-width: 620px;
      margin: 0 auto;
      font-weight: 500;
    }}

    /* asset grid */
    .asset-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 22px;
      margin-top: 56px;
    }}
    .asset-card {{
      background: var(--bg);
      border: 1.5px solid var(--ink);
      padding: 32px 28px;
      text-decoration: none;
      color: var(--ink);
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: background 0.25s, transform 0.25s, color 0.25s;
      position: relative;
    }}
    .asset-card:hover {{ background: var(--ink); color: var(--bg); transform: translateY(-3px); }}
    .asset-card:hover .asset-trigger,
    .asset-card:hover .asset-kicker,
    .asset-card:hover .asset-num,
    .asset-card:hover .asset-cta {{ color: var(--bg); }}
    .asset-card:hover .asset-cta {{ color: var(--bg); }}
    .asset-num {{
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.24em;
      color: var(--muted);
      text-transform: uppercase;
    }}
    .asset-trigger {{
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.2em;
      color: var(--rust);
      text-transform: uppercase;
    }}
    .asset-title {{
      font-size: 22px;
      font-weight: 900;
      line-height: 1.15;
      letter-spacing: -0.015em;
      text-transform: uppercase;
      margin-top: 4px;
    }}
    .asset-kicker {{
      font-size: 14px;
      color: var(--muted);
      line-height: 1.5;
      font-weight: 500;
      flex-grow: 1;
    }}
    .asset-cta {{
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--rust);
      margin-top: 8px;
    }}

    /* apply section */
    .alt {{ background: var(--bg-alt); }}
    .section-head {{ text-align: center; max-width: 720px; margin: 0 auto; }}
    .section-head .eyebrow {{ justify-content: center; }}
    h2.editorial {{
      font-weight: 900;
      font-size: clamp(34px, 4.6vw, 52px);
      line-height: 1.05;
      letter-spacing: -0.03em;
      margin-bottom: 14px;
    }}
    h2 em {{ font-style: italic; font-weight: 400; color: var(--rust); }}
    .blurb {{
      font-size: 16px;
      color: var(--muted);
      max-width: 640px;
      line-height: 1.7;
      font-weight: 500;
    }}
    .apply-wrap {{ max-width: 760px; margin: 36px auto 0; }}
    .tf-embed {{ width: 100%; height: 640px; border: 0; }}

    footer {{
      background: var(--bg-deep);
      color: #aaa;
      padding: 50px 0 40px;
      font-size: 12px;
      letter-spacing: 0.08em;
      text-align: center;
    }}
    footer a {{ color: #fff; text-decoration: none; }}
    .footer-brand {{ font-weight: 900; font-size: 18px; color: #fff; text-transform: uppercase; display: inline-block; margin-bottom: 10px; }}

    @media (max-width: 640px) {{
      section {{ padding: 64px 0; }}
      nav {{ padding: 18px 22px; }}
      .container {{ padding: 0 22px; }}
    }}
  </style>
</head>
<body>
  <nav>
    <a href="/new" class="logo">
      <img src="../favicon.png" class="logo-mark" alt="" />
      Cowboy Closers
    </a>
    <a href="#apply" class="nav-cta">Apply Now</a>
  </nav>

  <section class="hero">
    <div class="container">
      <div class="eyebrow">Free Resources</div>
      <h1 class="hero-h1">Five playbooks to <em>get you closing</em></h1>
      <p class="hero-sub">Everything I'd give you on day one if you joined my group. No email opt-in.</p>
    </div>
  </section>

  <section style="padding-top: 0;">
    <div class="container">
      <div class="asset-grid">
{card_html}
      </div>
    </div>
  </section>

  <section id="apply" class="alt">
    <div class="container">
      <div class="section-head">
        <div class="eyebrow">Apply</div>
        <h2 class="editorial">Want help <em>landing a closer role?</em></h2>
        <p class="blurb" style="margin: 0 auto 0;">Fill out the application. If you're a fit we'll jump on a call this week.</p>
      </div>
      <div class="apply-wrap">
        <iframe class="tf-embed" src="https://form.typeform.com/to/{TYPEFORM_ID}?typeform-embed=embed-widget" title="Apply for Cowboy Closers"></iframe>
      </div>
    </div>
  </section>

  <footer>
    <div class="container">
      <div class="footer-brand">Cowboy Closers</div>
      <div>© Cowboy Closers · <a href="/privacy-policy">Privacy</a> · <a href="/terms">Terms</a></div>
    </div>
  </footer>
</body>
</html>
"""


def main():
    for asset in ASSETS:
        out = HERE / asset["slug"] / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(render(asset))
        print(f"wrote {out.relative_to(ROOT)}")
    index_out = HERE / "index.html"
    index_out.write_text(render_index())
    print(f"wrote {index_out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
