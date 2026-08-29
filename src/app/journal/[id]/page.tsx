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
          overflow-x: hidden;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        img {
          max-width: 100%;
        }

        /* =====================================================
           MAIN CONTAINER
        ===================================================== */

        .wrap {
          width: min(1160px, calc(100% - 48px));
          margin: 0 auto;
        }

        /* =====================================================
           FIXED HEADER
        ===================================================== */

        .site-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          height: 80px;
          z-index: 9999;

          background: rgba(248, 247, 243, 0.96);
          border-bottom: 1px solid var(--line);

          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);

          box-shadow: 0 2px 14px rgba(7, 24, 45, 0.04);
        }

        .nav {
          height: 80px;

          display: flex;
          align-items: center;
          gap: 25px;
        }

        /* =====================================================
           LOGO
        ===================================================== */

        .logo {
          display: flex;
          align-items: center;

          font-size: 18px;
          font-weight: 700;
          letter-spacing: 1px;
          white-space: nowrap;

          flex-shrink: 0;
        }

        .logo > span:last-child {
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

        /* =====================================================
           NAVIGATION
        ===================================================== */

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
          transition:
            color 0.2s ease,
            opacity 0.2s ease;
        }

        .links a:hover {
          color: var(--ink);
        }

        /* =====================================================
           BACK BUTTON
        ===================================================== */

        .back {
          margin-left: auto;

          border-bottom: 1px solid var(--ink);

          font-size: 12px;
          font-weight: 700;

          padding-bottom: 4px;

          white-space: nowrap;

          transition:
            opacity 0.2s ease,
            color 0.2s ease;
        }

        .back:hover {
          opacity: 0.65;
        }

        /* =====================================================
           MAIN
           Fixed header = 80px
        ===================================================== */

        main {
          padding-top: 80px;
          min-height: 100vh;
        }

        /* =====================================================
           ARTICLE HEADER
        ===================================================== */

        .article-head {
          width: min(820px, calc(100% - 48px));

          margin: 0 auto;

          padding-top: 58px;
          padding-bottom: 40px;
        }

        .tag {
          display: inline-block;

          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 700;

          color: #a46b1d;
        }

        .article-head h1 {
          font-family: 'Playfair Display', Georgia, serif;

          font-size: clamp(
            42px,
            5.5vw,
            68px
          );

          line-height: 1.06;
          font-weight: 500;

          letter-spacing: -2.5px;

          margin: 15px 0 18px;

          color: var(--ink);

          overflow-wrap: break-word;
        }

        .intro {
          font-size: 18px;
          line-height: 1.65;

          color: #546571;

          max-width: 730px;

          margin: 0;
        }

        .meta {
          font-size: 11px;
          line-height: 1.5;

          color: #81909a;

          margin: 21px 0 0;
        }

        /* =====================================================
           HERO IMAGE
        ===================================================== */

        .hero-image {
          width: min(1160px, calc(100% - 48px));

          height: clamp(
            320px,
            48vw,
            570px
          );

          margin: 0 auto;

          background-size: cover;
          background-position: center;

          border-radius: 2px;
        }

        /* =====================================================
           ARTICLE CONTENT
        ===================================================== */

        .article {
          width: min(1000px, calc(100% - 48px));

          display: grid;

          grid-template-columns:
            minmax(0, 720px)
            205px;

          justify-content: space-between;

          gap: clamp(30px, 5vw, 60px);

          margin: 60px auto 90px;
        }

        .content {
          min-width: 0;
        }

        .content section {
          min-width: 0;
        }

        .content h2 {
          font-family: 'Playfair Display', Georgia, serif;

          font-size: clamp(
            27px,
            3vw,
            30px
          );

          line-height: 1.2;

          font-weight: 500;

          letter-spacing: -1px;

          margin: 0 0 13px;
        }

        .content p {
          font-size: 16px;

          color: #43545f;

          line-height: 1.85;

          margin: 0 0 36px;

          overflow-wrap: break-word;
        }

        /* =====================================================
           SIDEBAR
        ===================================================== */

        .aside {
          height: max-content;

          position: sticky;

          top: 105px;

          border-top: 2px solid var(--gold);

          padding-top: 14px;
        }

        .aside b {
          display: block;

          font-size: 12px;
          line-height: 1.4;
        }

        .aside ul {
          padding: 0;
          margin: 12px 0;

          list-style: none;
        }

        .aside li {
          position: relative;

          font-size: 12px;
          line-height: 1.55;

          color: #5e6e79;

          margin: 10px 0;

          padding-left: 15px;
        }

        .aside li::before {
          content: '•';

          position: absolute;

          left: 0;
          top: 0;

          color: var(--gold);
        }

        /* =====================================================
           CTA
        ===================================================== */

        .cta {
          margin-top: 55px;

          background: var(--navy);
          color: white;

          padding: 32px;

          border-radius: 2px;
        }

        .cta h2 {
          color: white;

          font-size: clamp(
            26px,
            3vw,
            30px
          );

          margin: 0 0 12px;
        }

        .cta p {
          color: #d0dae4;

          font-size: 13px;
          line-height: 1.7;

          margin: 0 0 20px;
        }

        .cta a {
          display: inline-block;

          background: white;
          color: var(--ink);

          padding: 11px 15px;

          font-size: 12px;
          font-weight: 700;

          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .cta a:hover {
          background: #f1f1ef;
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        .footer {
          background: #041222;

          color: #a8b7c3;

          padding: 30px 0;

          font-size: 11px;
        }

        .footer .wrap {
          display: flex;

          align-items: center;
          justify-content: space-between;

          gap: 20px;
        }

        .footer a {
          transition: color 0.2s ease;
        }

        .footer a:hover {
          color: white;
        }

        /* =====================================================
           LARGE DESKTOP
        ===================================================== */

        @media (min-width: 1400px) {
          .wrap {
            width: min(1200px, calc(100% - 80px));
          }

          .hero-image {
            width: min(1200px, calc(100% - 80px));
          }

          .article-head {
            width: min(850px, calc(100% - 80px));
          }

          .article {
            width: min(1050px, calc(100% - 80px));
          }
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1024px) {
          .wrap {
            width: calc(100% - 40px);
          }

          .site-header {
            height: 74px;
          }

          .nav {
            height: 74px;
            gap: 20px;
          }

          .links {
            gap: 18px;
            padding-left: 18px;
          }

          main {
            padding-top: 74px;
          }

          .article-head {
            width: calc(100% - 56px);

            padding-top: 48px;
            padding-bottom: 35px;
          }

          .article-head h1 {
            font-size: clamp(
              42px,
              6vw,
              58px
            );
          }

          .hero-image {
            width: calc(100% - 40px);
            height: 430px;
          }

          .article {
            width: calc(100% - 56px);

            grid-template-columns:
              minmax(0, 1fr)
              190px;

            gap: 35px;

            margin-top: 50px;
          }

          .content p {
            font-size: 15.5px;
          }
        }

        /* =====================================================
           SMALL TABLET / LARGE MOBILE
        ===================================================== */

        @media (max-width: 820px) {
          .links {
            display: none;
          }

          .article {
            grid-template-columns: 1fr;
          }

          .aside {
            position: static;

            order: -1;

            margin-bottom: 25px;

            padding: 16px 18px;

            border-top: 2px solid var(--gold);

            background: rgba(255, 255, 255, 0.55);
          }

          .aside ul {
            display: grid;

            grid-template-columns:
              repeat(2, minmax(0, 1fr));

            gap: 0 25px;
          }

          .aside li {
            margin: 7px 0;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 760px) {
          .wrap {
            width: calc(100% - 32px);
          }

          /* Fixed mobile header */

          .site-header {
            height: 67px;
          }

          .nav {
            height: 67px;
            gap: 10px;
          }

          .logo {
            font-size: 16px;
            letter-spacing: 0.7px;
          }

          .mark {
            height: 19px;
            margin-right: 6px;
          }

          .mark i {
            width: 3px;
          }

          .mark i:nth-child(1) {
            height: 9px;
          }

          .mark i:nth-child(2) {
            height: 16px;
          }

          .mark i:nth-child(3) {
            height: 12px;
          }

          /* Header space */

          main {
            padding-top: 67px;
          }

          /* Back link */

          .back {
            font-size: 10px;
            padding-bottom: 3px;
          }

          /* Article heading */

          .article-head {
            width: calc(100% - 32px);

            padding-top: 35px;
            padding-bottom: 30px;
          }

          .tag {
            font-size: 9px;
            letter-spacing: 1.3px;
          }

          .article-head h1 {
            font-size: clamp(
              36px,
              10vw,
              46px
            );

            line-height: 1.08;

            letter-spacing: -1.7px;

            margin: 12px 0 16px;
          }

          .intro {
            font-size: 16px;

            line-height: 1.65;
          }

          .meta {
            font-size: 10px;

            margin-top: 17px;
          }

          /* Hero */

          .hero-image {
            width: calc(100% - 32px);

            height: 300px;

            border-radius: 2px;
          }

          /* Article */

          .article {
            width: calc(100% - 32px);

            display: block;

            margin: 40px auto 60px;
          }

          /* Sidebar */

          .aside {
            margin-bottom: 35px;

            padding: 14px;
          }

          .aside ul {
            display: block;

            margin-bottom: 0;
          }

          .aside li {
            font-size: 11px;

            margin: 9px 0;
          }

          /* Content */

          .content h2 {
            font-size: 27px;

            letter-spacing: -0.7px;

            margin-bottom: 10px;
          }

          .content p {
            font-size: 15px;

            line-height: 1.8;

            margin-bottom: 30px;
          }

          /* CTA */

          .cta {
            margin-top: 42px;

            padding: 24px 20px;
          }

          .cta h2 {
            font-size: 26px;

            letter-spacing: -0.5px;
          }

          .cta p {
            font-size: 13px;

            line-height: 1.65;
          }

          .cta a {
            padding: 11px 13px;

            font-size: 11px;
          }

          /* Footer */

          .footer {
            padding: 25px 0;
          }

          .footer .wrap {
            flex-direction: column;

            align-items: flex-start;

            gap: 10px;
          }
        }

        /* =====================================================
           SMALL PHONES
        ===================================================== */

        @media (max-width: 480px) {
          .wrap {
            width: calc(100% - 28px);
          }

          .site-header {
            height: 62px;
          }

          .nav {
            height: 62px;
          }

          main {
            padding-top: 62px;
          }

          .logo {
            font-size: 15px;
          }

          .back {
            font-size: 9px;
          }

          .article-head {
            width: calc(100% - 28px);

            padding-top: 30px;
            padding-bottom: 26px;
          }

          .article-head h1 {
            font-size: 36px;

            letter-spacing: -1.5px;
          }

          .intro {
            font-size: 15px;
          }

          .hero-image {
            width: calc(100% - 28px);

            height: 245px;
          }

          .article {
            width: calc(100% - 28px);

            margin-top: 34px;
          }

          .content h2 {
            font-size: 25px;
          }

          .content p {
            font-size: 14.5px;

            line-height: 1.78;
          }

          .aside {
            padding: 13px;
          }

          .cta {
            padding: 21px 18px;
          }

          .cta h2 {
            font-size: 24px;
          }
        }

        /* =====================================================
           VERY SMALL PHONES
        ===================================================== */

        @media (max-width: 360px) {
          .wrap {
            width: calc(100% - 24px);
          }

          .site-header {
            height: 58px;
          }

          .nav {
            height: 58px;
          }

          main {
            padding-top: 58px;
          }

          .logo {
            font-size: 14px;
          }

          .back {
            font-size: 8px;
          }

          .article-head {
            width: calc(100% - 24px);
          }

          .article-head h1 {
            font-size: 33px;
          }

          .hero-image {
            width: calc(100% - 24px);
            height: 220px;
          }

          .article {
            width: calc(100% - 24px);
          }
        }
      `}</style>

            {/* =====================================================
          FIXED HEADER
      ===================================================== */}

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

            {/* =====================================================
          MAIN
      ===================================================== */}

            <main>
                {/* =================================================
            ARTICLE HEADER
        ================================================= */}

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

                {/* =================================================
            HERO IMAGE
        ================================================= */}

                <div
                    className="hero-image"
                    style={{
                        backgroundImage: `url('${article.image}')`,
                    }}
                />

                {/* =================================================
            ARTICLE BODY
        ================================================= */}

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

                        {/* =============================================
                CTA
            ============================================= */}

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

                    {/* =================================================
              SIDEBAR
          ================================================= */}

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

            {/* =====================================================
          FOOTER
      ===================================================== */}

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
