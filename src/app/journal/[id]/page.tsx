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
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #f8f7f3;
          color: #172633;
          font-family: 'DM Sans', Arial, sans-serif;
          overflow-x: hidden;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        /* CONTAINER */
        .wrap {
          width: min(1160px, calc(100% - 48px));
          margin: 0 auto;
        }

        /* ================= HEADER ================= */

        .site-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          height: 80px;
          z-index: 9999;
          background: rgba(248, 247, 243, 0.97);
          border-bottom: 1px solid #dde3e5;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .nav {
          height: 80px;
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .logo {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 1px;
          white-space: nowrap;
        }

        .logo span {
          font-weight: 400;
          color: #6b7a86;
        }

        .mark {
          display: flex;
          align-items: flex-end;
          gap: 2px;
          height: 21px;
          margin-right: 8px;
        }

        .mark i {
          display: block;
          width: 4px;
          background: #c88b2e;
        }

        .mark i:nth-child(1) {
          height: 10px;
        }

        .mark i:nth-child(2) {
          height: 18px;
        }

        .mark i:nth-child(3) {
          height: 14px;
        }

        .links {
          display: flex;
          align-items: center;
          gap: 20px;
          padding-left: 20px;
          border-left: 1px solid #dde3e5;
          font-size: 13px;
          font-weight: 600;
          color: #5c6c78;
        }

        .links a:hover {
          color: #172633;
        }

        .back {
          margin-left: auto;
          flex-shrink: 0;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          border-bottom: 1px solid #172633;
          padding-bottom: 4px;
        }

        /* ================= MAIN ================= */

        main {
          padding-top: 80px;
        }

        .article-head {
          width: min(820px, calc(100% - 48px));
          margin: 43px auto 35px;
        }

        .tag {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 700;
          color: #a46b1d;
        }

        .article-head h1 {
          margin: 15px 0;
          font-family: 'Playfair Display', serif;
          font-size: clamp(42px, 5.5vw, 68px);
          line-height: 1.06;
          font-weight: 500;
          letter-spacing: -2.5px;
          overflow-wrap: anywhere;
        }

        .intro {
          max-width: 730px;
          margin: 0;
          font-size: 18px;
          line-height: 1.65;
          color: #546571;
        }

        .meta {
          margin-top: 21px;
          font-size: 11px;
          color: #81909a;
        }

        /* ================= IMAGE ================= */

        .hero-image {
          width: min(1160px, calc(100% - 48px));
          height: min(55vw, 570px);
          min-height: 350px;
          margin: 0 auto;
          background-size: cover;
          background-position: center;
          border-radius: 2px;
        }

        /* ================= ARTICLE ================= */

        .article {
          width: min(1000px, calc(100% - 48px));
          display: grid;
          grid-template-columns: minmax(0, 720px) 205px;
          gap: 50px;
          margin: 52px auto 80px;
        }

        .content {
          min-width: 0;
        }

        .content h2 {
          margin: 0 0 12px;
          font-family: 'Playfair Display', serif;
          font-size: 30px;
          line-height: 1.2;
          font-weight: 500;
        }

        .content p {
          margin: 0 0 35px;
          font-size: 16px;
          line-height: 1.85;
          color: #43545f;
          overflow-wrap: anywhere;
        }

        /* ================= SIDEBAR ================= */

        .aside {
          height: max-content;
          position: sticky;
          top: 100px;
          border-top: 2px solid #c88b2e;
          padding-top: 14px;
        }

        .aside b {
          font-size: 12px;
        }

        .aside ul {
          padding: 0;
          margin: 12px 0;
          list-style: none;
        }

        .aside li {
          position: relative;
          margin: 10px 0;
          padding-left: 15px;
          font-size: 12px;
          line-height: 1.55;
          color: #5e6e79;
        }

        .aside li::before {
          content: '•';
          position: absolute;
          left: 0;
          color: #c88b2e;
        }

        /* ================= CTA ================= */

        .cta {
          margin-top: 50px;
          padding: 27px;
          background: #07182d;
          color: white;
        }

        .cta h2 {
          color: white;
        }

        .cta p {
          margin-bottom: 19px;
          color: #d0dae4;
          font-size: 13px;
        }

        .cta a {
          display: inline-block;
          padding: 11px 14px;
          background: white;
          color: #172633;
          font-size: 12px;
          font-weight: 700;
        }

        /* ================= FOOTER ================= */

        .footer {
          padding: 28px 0;
          background: #041222;
          color: #a8b7c3;
          font-size: 11px;
        }

        .footer .wrap {
          display: flex;
          justify-content: space-between;
          gap: 20px;
        }

        /* ================= TABLET ================= */

        @media (max-width: 900px) {

          .wrap {
            width: calc(100% - 36px);
          }

          .nav {
            gap: 15px;
          }

          .links {
            gap: 14px;
            padding-left: 14px;
            font-size: 12px;
          }

          .back {
            font-size: 11px;
          }

          .article {
            grid-template-columns: minmax(0, 1fr) 180px;
            gap: 30px;
          }
        }

        /* ================= MOBILE ================= */

        @media (max-width: 700px) {

          .wrap {
            width: calc(100% - 28px);
          }

          .site-header {
            height: 67px;
          }

          .nav {
            height: 67px;
            gap: 10px;
          }

          .links {
            display: none;
          }

          .logo {
            font-size: 16px;
          }

          .back {
            margin-left: auto;
            font-size: 10px;
          }

          main {
            padding-top: 67px;
          }

          .article-head {
            width: calc(100% - 28px);
            margin: 30px auto;
          }

          .article-head h1 {
            font-size: clamp(36px, 10vw, 46px);
            letter-spacing: -1.5px;
          }

          .intro {
            font-size: 16px;
            line-height: 1.6;
          }

          .hero-image {
            width: calc(100% - 28px);
            height: 280px;
            min-height: 0;
          }

          .article {
            width: calc(100% - 28px);
            display: block;
            margin: 35px auto 55px;
          }

          .aside {
            position: static;
            margin-bottom: 35px;
          }

          .content h2 {
            font-size: 27px;
          }

          .content p {
            font-size: 15px;
            line-height: 1.8;
          }

          .cta {
            padding: 22px;
          }

          .footer .wrap {
            flex-direction: column;
          }
        }

        /* ================= SMALL MOBILE ================= */

        @media (max-width: 400px) {

          .logo {
            font-size: 14px;
          }

          .mark {
            margin-right: 5px;
          }

          .back {
            font-size: 9px;
          }

          .article-head h1 {
            font-size: 34px;
          }

          .hero-image {
            height: 230px;
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

                    <p className="intro">
                        {article.intro}
                    </p>

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
                                Explore thoughtfully selected homes and spaces
                                across India with PropertiesNexus.
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
                                <li key={item}>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </aside>

                </article>

            </main>

            <footer className="footer">
                <div className="wrap">
                    <span>
                        © 2026 PropertiesNexus. All rights reserved.
                    </span>

                    <Link href="/journal">
                        Explore more journal stories →
                    </Link>
                </div>
            </footer>
        </>
    );
}
