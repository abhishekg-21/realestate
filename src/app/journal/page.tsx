// src/app/journal/page.tsx

import Link from "next/link";
import { PN_JOURNAL } from "@/lib/blog-data";

export default function JournalPage() {
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
           NAVIGATION
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
           MAIN CONTENT
           Header = 80px
        ========================= */

        main {
          padding-top: 80px;
        }

        /* =========================
           JOURNAL HERO
        ========================= */

        .hero {
          padding: 60px 0 40px;
        }

        .hero h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 5vw, 60px);
          font-weight: 500;
          letter-spacing: -2px;
          line-height: 1.1;
          margin: 0 0 12px;
        }

        .hero p {
          font-size: 17px;
          color: #546571;
          line-height: 1.6;
          margin: 0;
        }

        /* =========================
           ARTICLE GRID
        ========================= */

        .grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fill,
            minmax(320px, 1fr)
          );
          gap: 32px;
          padding: 40px 0 80px;
        }

        /* =========================
           ARTICLE CARD
        ========================= */

        .card {
          display: block;
          border: 1px solid var(--line);
          border-radius: 4px;
          overflow: hidden;
          background: #fff;
          transition:
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        .card:hover {
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.09);
          transform: translateY(-2px);
        }

        .card img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          display: block;
        }

        .card-body {
          padding: 20px;
        }

        .tag {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 700;
          color: #a46b1d;
        }

        .card-body h2 {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 500;
          margin: 8px 0;
          line-height: 1.3;
        }

        .card-body p {
          font-size: 14px;
          color: #546571;
          line-height: 1.7;
          margin: 0 0 16px;
        }

        .card-meta {
          font-size: 11px;
          color: #81909a;
        }

        /* =========================
           FOOTER
        ========================= */

        .footer {
          background: #041222;
          color: #a8b7c3;
          padding: 28px 0;
          font-size: 11px;
        }

        .footer .wrap {
          display: flex;
          justify-content: space-between;
        }

        /* =========================
           MOBILE + TABLET
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

          /* Content below fixed header */
          main {
            padding-top: 67px;
          }

          /* Hide desktop nav */
          .links {
            display: none;
          }

          /* Hero */
          .hero {
            padding: 40px 0 25px;
          }

          .hero h1 {
            font-size: 42px;
            letter-spacing: -1.5px;
          }

          .hero p {
            font-size: 16px;
          }

          /* Grid */
          .grid {
            grid-template-columns: 1fr;
            gap: 24px;
            padding: 25px 0 55px;
          }

          /* Cards */
          .card img {
            height: 220px;
          }

          .card-body {
            padding: 18px;
          }

          .card-body h2 {
            font-size: 21px;
          }

          .card-body p {
            font-size: 14px;
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

          .hero {
            padding-top: 32px;
          }

          .hero h1 {
            font-size: 36px;
          }

          .hero p {
            font-size: 15px;
          }

          .card img {
            height: 200px;
          }

          .grid {
            gap: 20px;
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
                </div>
            </header>

            {/* =========================
          MAIN CONTENT
      ========================= */}

            <main>
                <div className="wrap">

                    {/* Journal Hero */}
                    <div className="hero">
                        <h1>
                            The PropertiesNexus Journal
                        </h1>

                        <p>
                            Insights, guides, and stories from across
                            India's property landscape.
                        </p>
                    </div>

                    {/* Article Grid */}
                    <div className="grid">
                        {Object.entries(PN_JOURNAL).map(
                            ([id, article]) => (
                                <Link
                                    href={`/journal/${id}`}
                                    key={id}
                                    className="card"
                                >
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                    />

                                    <div className="card-body">
                                        <span className="tag">
                                            {article.category}
                                        </span>

                                        <h2>
                                            {article.title}
                                        </h2>

                                        <p>
                                            {article.intro}
                                        </p>

                                        <span className="card-meta">
                                            {article.read} · {article.location}
                                        </span>
                                    </div>
                                </Link>
                            )
                        )}
                    </div>
                </div>
            </main>

            {/* =========================
          FOOTER
      ========================= */}

            <footer className="footer">
                <div className="wrap">
                    <span>
                        © 2026 PropertiesNexus. All rights reserved.
                    </span>

                    <Link href="/properties">
                        Explore properties →
                    </Link>
                </div>
            </footer>
        </>
    );
}
