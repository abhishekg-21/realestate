// src/app/journal/[id]/page.tsx

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { PN_JOURNAL } from "@/lib/blog-data";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({
    params,
}: Props): Promise<Metadata> {
    const { id } = await params;
    const article = PN_JOURNAL[id];

    if (!article) {
        return {
            title: "Journal | PropertiesNexus",
        };
    }

    return {
        title: `${article.title} | PropertiesNexus`,
    };
}

export async function generateStaticParams() {
    return Object.keys(PN_JOURNAL).map((id) => ({
        id,
    }));
}

export default async function JournalArticlePage({ params }: Props) {
    const { id } = await params;
    const article = PN_JOURNAL[id];

    if (!article) {
        notFound();
    }

    return (
        <>
            <style>{`
        :root {
          --navy: #07182d;
          --ink: #172633;
          --muted: #6a7984;
          --gold: #c88b2e;
          --paper: #f8f7f3;
          --line: #dde3e5;
        }

        * {
          box-sizing: border-box;
        }

        html {
          margin: 0;
          padding: 0;
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          padding: 0;
          background: var(--paper);
          color: var(--ink);
          font-family: 'DM Sans', Arial, sans-serif;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        /* =========================
           CONTAINER
        ========================= */

        .wrap {
          width: min(1160px, calc(100% - 48px));
          margin: 0 auto;
        }

        /* =========================
           FIXED HEADER
        ========================= */

        .site-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          height: 80px;
          z-index: 9999;
          background: rgba(248, 247, 243, 0.97);
          border-bottom: 1px solid var(--line);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .nav {
          height: 80px;
          display: flex;
          align-items: center;
          gap: 25px;
        }

        /* =========================
           LOGO
        ========================= */

        .logo {
          display: flex;
          align-items: center;
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
          display: inline-flex;
          gap: 2px;
          align-items: flex-end;
          height: 21px;
          margin-right: 8px;
        }

        .mark i {
          display: block;
          width: 4px;
          background: var(--gold);
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

        /* =========================
           NAVIGATION LINKS
        ========================= */

        .links {
          display: flex;
          align-items: center;
          gap: 24px;
          border-left: 1px solid var(--line);
          padding-left: 24px;
          font-size: 13px;
          font-weight: 600;
          color: #5c6c78;
        }

        .links a {
          transition: color 0.2s ease;
        }

        .links a:hover {
          color: var(--ink);
        }

        /* =========================
           BACK TO JOURNAL
        ========================= */

        .back {
          margin-left: auto;
          border-bottom: 1px solid var(--ink);
          font-size: 12px;
          font-weight: 700;
          padding-bottom: 4px;
          white-space: nowrap;
          transition: opacity 0.2s ease;
        }

        .back:hover {
          opacity: 0.65;
        }

        /* =========================
           MAIN CONTENT
           IMPORTANT:
           Header = 80px
        ========================= */

        main {
          padding-top: 80px;
        }

        /* =========================
           ARTICLE HEADER
        ========================= */

        .article-head {
          max-width: 820px;
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
          font-family: 'Playfair Display', serif;
          font-size: clamp(42px, 5.5vw, 68px);
          line-height: 1.06;
          font-weight: 500;
          letter-spacing: -2.5px;
          margin: 15px 0;
        }

        .intro {
          font-size: 18px;
          line-height: 1.65;
          color: #546571;
          max-width: 730px;
        }

        .meta {
          font-size: 11px;
          color: #81909a;
          margin-top: 21px;
        }

        /* =========================
           HERO IMAGE
        ========================= */

        .hero-image {
          width: min(1160px, 100%);
          height: min(55vw, 570px);
          margin: 0 auto;
          background-size: cover;
          background-position: center;
        }

        /* =========================
           ARTICLE BODY
        ========================= */

        .article {
          display: grid;
          grid-template-columns: minmax(0, 720px) 205px;
          justify-content: space-between;
          gap: 50px;
          max-width: 1000px;
          margin: 52px auto 80px;
        }

        .content h2 {
          font-family: 'Playfair Display', serif;
          font-size: 30px;
          font-weight: 500;
          letter-spacing: -1px;
          margin: 0 0 12px;
        }

        .content p {
          font-size: 16px;
          color: #43545f;
          line-height: 1.85;
          margin: 0 0 35px;
        }

        /* =========================
           SIDEBAR
           Starts BELOW fixed header
        ========================= */

        .aside {
          height: max-content;
          position: sticky;
          top: 100px;
          border-top: 2px solid var(--gold);
          padding-top: 14px;
        }

        .aside b {
          font-size: 12px;
        }

        .aside ul {
          padding: 0;
          list-style: none;
          margin: 12px 0;
        }

        .aside li {
          font-size: 12px;
          color: #5e6e79;
          line-height: 1.55;
          margin: 10px 0;
          padding-left: 15px;
          position: relative;
        }

        .aside li:before {
          content: '•';
          position: absolute;
          left: 0;
          color: var(--gold);
        }

        /* =========================
           CTA
        ========================= */

        .cta {
          margin-top: 50px;
          background: var(--navy);
          color: #fff;
          padding: 27px;
        }

        .cta h2 {
          font-size: 29px;
          color: #fff;
        }

        .cta p {
          color: #d0dae4;
          font-size: 13px;
          margin-bottom: 19px;
        }

        .cta a {
          display: inline-block;
          background: #fff;
          color: var(--ink);
          padding: 11px 14px;
          font-size: 12px;
          font-weight: 700;
          transition: opacity 0.2s ease;
        }

        .cta a:hover {
          opacity: 0.85;
        }

        /* =========================
           FOOTER
        ========================= */

        .footer {
          background: #041222;
          color: #fff;
          padding: 28px 0;
          font-size: 11px;
        }

        .footer .wrap {
          display: flex;
          justify-content: space-between;
          color: #a8b7c3;
        }

        /* =========================
           TABLET / MOBILE
        ========================= */

        @media (max-width: 760px) {
          .wrap {
            width: min(calc(100% - 32px), 1160px);
          }

          /* Fixed mobile header */
          .site-header {
            height: 67px;
          }

          .nav {
            height: 67px;
          }

          /* Content starts below mobile header */
          main {
            padding-top: 67px;
          }

          /* Hide desktop navigation */
          .links {
            display: none;
          }

          .back {
            margin-left: auto;
            font-size: 11px;
          }

          /* Article heading */
          .article-head {
            margin: 30px auto;
          }

          .article-head h1 {
            font-size: 43px;
            letter-spacing: -1.8px;
          }

          .intro {
            font-size: 16px;
          }

          /* Hero */
          .hero-image {
            height: 300px;
          }

          /* Article */
          .article {
            display: block;
            margin: 35px auto 55px;
          }

          /* Sidebar becomes normal block */
          .aside {
            position: static;
            margin: 0 0 32px;
          }

          .content p {
            font-size: 15px;
          }

          .content h2 {
            font-size: 28px;
          }

          /* Footer */
          .footer .wrap {
            flex-direction: column;
            gap: 10px;
          }
        }

        /* =========================
           SMALL PHONES
        ========================= */

        @media (max-width: 480px) {
          .wrap {
            width: calc(100% - 28px);
          }

          .logo {
            font-size: 16px;
          }

          .mark {
            margin-right: 6px;
          }

          .back {
            font-size: 10px;
          }

          .article-head h1 {
            font-size: 38px;
          }

          .hero-image {
            height: 250px;
          }

          .cta {
            padding: 22px;
          }

          .cta h2 {
            font-size: 26px;
          }
        }
      `}</style>

            {/* =========================
          FIXED HEADER
      ========================= */}

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
                        <Link href="/properties">
                            Properties
                        </Link>

                        <Link href="/#areas">
                            Locations
                        </Link>

                        <Link href="/journal">
                            Journal
                        </Link>
                    </nav>

                    <Link className="back" href="/journal">
                        ← Back to Journal
                    </Link>
                </div>
            </header>

            {/* =========================
          MAIN
      ========================= */}

            <main>
                {/* Article Header */}
                <header className="article-head">
                    <span className="tag">
                        {article.category}
                    </span>

                    <h1>
                        {article.title}
                    </h1>

                    <p className="intro">
                        {article.intro}
                    </p>

                    <p className="meta">
                        {article.read} · {article.location}
                    </p>
                </header>

                {/* Hero Image */}
                <div
                    className="hero-image"
                    style={{
                        backgroundImage: `url('${article.image}')`,
                    }}
                />

                {/* Article Body */}
                <article className="article">
                    <section className="content">
                        {article.sections.map(([heading, text]) => (
                            <section key={heading}>
                                <h2>
                                    {heading}
                                </h2>

                                <p>
                                    {text}
                                </p>
                            </section>
                        ))}

                        {/* CTA */}
                        <div className="cta">
                            <h2>
                                Find a place that fits.
                            </h2>

                            <p>
                                Explore thoughtfully selected homes and spaces
                                across India with PropertiesNexus.
                            </p>

                            <Link href="/properties">
                                Explore properties →
                            </Link>
                        </div>
                    </section>

                    {/* Sidebar */}
                    <aside className="aside">
                        <b>
                            In this article
                        </b>

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

            {/* =========================
          FOOTER
      ========================= */}

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
