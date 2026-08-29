// src/app/journal/[id]/page.tsx

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { PN_JOURNAL } from "@/lib/blog-data";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const article = PN_JOURNAL[id];

    return {
        title: article
            ? `${article.title} | PropertiesNexus`
            : "Journal | PropertiesNexus",
    };
}

export function generateStaticParams() {
    return Object.keys(PN_JOURNAL).map((id) => ({ id }));
}

export default async function JournalArticlePage({ params }: Props) {
    const { id } = await params;
    const article = PN_JOURNAL[id];

    if (!article) notFound();

    return (
        <>
            <style>{`
        :root {
          --navy:#07182d;
          --ink:#172633;
          --gold:#c88b2e;
          --paper:#f8f7f3;
          --line:#dde3e5;
        }

        * { box-sizing:border-box; }

        html { scroll-behavior:smooth; }

        body {
          margin:0;
          background:var(--paper);
          color:var(--ink);
          font-family:'DM Sans',Arial,sans-serif;
        }

        a {
          color:inherit;
          text-decoration:none;
        }

        .wrap {
          width:min(1160px,calc(100% - 48px));
          margin:auto;
        }

        .site-header {
          position:fixed;
          top:0;
          left:0;
          width:100%;
          height:80px;
          z-index:9999;
          background:rgba(248,247,243,.97);
          border-bottom:1px solid var(--line);
          backdrop-filter:blur(12px);
        }

        .nav {
          height:80px;
          display:flex;
          align-items:center;
          gap:25px;
        }

        .logo {
          display:flex;
          align-items:center;
          font-size:18px;
          font-weight:700;
          letter-spacing:1px;
          white-space:nowrap;
        }

        .logo span {
          font-weight:400;
          color:#6b7a86;
        }

        .mark {
          display:flex;
          align-items:flex-end;
          gap:2px;
          height:21px;
          margin-right:8px;
        }

        .mark i {
          display:block;
          width:4px;
          background:var(--gold);
        }

        .mark i:nth-child(1){height:10px}
        .mark i:nth-child(2){height:18px}
        .mark i:nth-child(3){height:14px}

        .links {
          display:flex;
          gap:24px;
          border-left:1px solid var(--line);
          padding-left:24px;
          font-size:13px;
          font-weight:600;
          color:#5c6c78;
        }

        .links a:hover {
          color:var(--ink);
        }

        .back {
          margin-left:auto;
          font-size:12px;
          font-weight:700;
          border-bottom:1px solid var(--ink);
          padding-bottom:4px;
        }

        main {
          padding-top:80px;
        }

        .article-head {
          max-width:820px;
          margin:43px auto 35px;
        }

        .tag {
          font-size:10px;
          text-transform:uppercase;
          letter-spacing:1.5px;
          font-weight:700;
          color:#a46b1d;
        }

        .article-head h1 {
          font-family:'Playfair Display',serif;
          font-size:clamp(42px,5.5vw,68px);
          line-height:1.06;
          font-weight:500;
          letter-spacing:-2.5px;
          margin:15px 0;
        }

        .intro {
          max-width:730px;
          font-size:18px;
          line-height:1.65;
          color:#546571;
        }

        .meta {
          font-size:11px;
          color:#81909a;
          margin-top:21px;
        }

        .hero-image {
          width:min(1160px,100%);
          height:min(55vw,570px);
          margin:auto;
          background-size:cover;
          background-position:center;
        }

        .article {
          display:grid;
          grid-template-columns:minmax(0,720px) 205px;
          gap:50px;
          max-width:1000px;
          margin:52px auto 80px;
        }

        .content h2 {
          font-family:'Playfair Display',serif;
          font-size:30px;
          font-weight:500;
          margin:0 0 12px;
        }

        .content p {
          font-size:16px;
          line-height:1.85;
          color:#43545f;
          margin:0 0 35px;
        }

        .aside {
          height:max-content;
          position:sticky;
          top:100px;
          border-top:2px solid var(--gold);
          padding-top:14px;
        }

        .aside b {
          font-size:12px;
        }

        .aside ul {
          list-style:none;
          padding:0;
          margin:12px 0;
        }

        .aside li {
          position:relative;
          padding-left:15px;
          margin:10px 0;
          font-size:12px;
          line-height:1.55;
          color:#5e6e79;
        }

        .aside li::before {
          content:'•';
          position:absolute;
          left:0;
          color:var(--gold);
        }

        .cta {
          margin-top:50px;
          padding:27px;
          background:var(--navy);
          color:white;
        }

        .cta h2 {
          color:white;
        }

        .cta p {
          color:#d0dae4;
          font-size:13px;
          margin-bottom:19px;
        }

        .cta a {
          display:inline-block;
          padding:11px 14px;
          background:white;
          color:var(--ink);
          font-size:12px;
          font-weight:700;
        }

        .footer {
          padding:28px 0;
          background:#041222;
          color:#a8b7c3;
          font-size:11px;
        }

        .footer .wrap {
          display:flex;
          justify-content:space-between;
        }

        @media (max-width:760px) {
          .wrap {
            width:calc(100% - 32px);
          }

          .site-header,
          .nav {
            height:67px;
          }

          main {
            padding-top:67px;
          }

          .links {
            display:none;
          }

          .back {
            font-size:11px;
          }

          .article-head {
            margin:30px auto;
          }

          .article-head h1 {
            font-size:43px;
            letter-spacing:-1.8px;
          }

          .intro {
            font-size:16px;
          }

          .hero-image {
            height:300px;
          }

          .article {
            display:block;
            margin:35px auto 55px;
          }

          .aside {
            position:static;
            margin-bottom:32px;
          }

          .content h2 {
            font-size:28px;
          }

          .content p {
            font-size:15px;
          }

          .footer .wrap {
            flex-direction:column;
            gap:10px;
          }
        }

        @media (max-width:480px) {
          .wrap {
            width:calc(100% - 28px);
          }

          .logo {
            font-size:16px;
          }

          .back {
            font-size:10px;
          }

          .article-head h1 {
            font-size:38px;
          }

          .hero-image {
            height:250px;
          }

          .cta {
            padding:22px;
          }
        }
      `}</style>

            <header className="site-header">
                <div className="wrap nav">
                    <Link className="logo" href="/">
                        <span className="mark">
                            <i />
                            <i />
                            <i />
                        </span>
                        Properties<span>Nexus</span>
                    </Link>

                    <nav className="links">
                        <Link href="/properties">Properties</Link>
                        <Link href="/#areas">Locations</Link>
                        <Link href="/journal">Journal</Link>
                    </nav>

                    <Link className="back" href="/journal">
                        ← Back to Journal
                    </Link>
                </div>
            </header>

            <main>
                <header className="article-head">
                    <span className="tag">{article.category}</span>
                    <h1>{article.title}</h1>
                    <p className="intro">{article.intro}</p>
                    <p className="meta">
                        {article.read} · {article.location}
                    </p>
                </header>

                <div
                    className="hero-image"
                    style={{
                        backgroundImage: `url('${article.image}')`,
                    }}
                />

                <article className="article">
                    <section className="content">
                        {article.sections.map(([heading, text]) => (
                            <section key={heading}>
                                <h2>{heading}</h2>
                                <p>{text}</p>
                            </section>
                        ))}

                        <div className="cta">
                            <h2>Find a place that fits.</h2>
                            <p>
                                Explore thoughtfully selected homes and spaces across India
                                with PropertiesNexus.
                            </p>
                            <Link href="/properties">
                                Explore properties →
                            </Link>
                        </div>
                    </section>

                    <aside className="aside">
                        <b>In this article</b>
                        <ul>
                            {article.takeaways.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </aside>
                </article>
            </main>

            <footer className="footer">
                <div className="wrap">
                    <span>© 2026 PropertiesNexus. All rights reserved.</span>
                    <Link href="/journal">
                        Explore more journal stories →
                    </Link>
                </div>
            </footer>
        </>
    );
}
