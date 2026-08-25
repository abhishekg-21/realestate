import Link from "next/link";
import { PN_JOURNAL } from "@/lib/blog-data";

export default function JournalPage() {
    return (
        <>
            <style>{`
        body { margin: 0; background: #f8f7f3; font-family: 'DM Sans', Arial, sans-serif; }
        .wrap { width: min(1160px, calc(100% - 48px)); margin: auto; }
        .nav { height: 80px; display: flex; align-items: center; gap: 25px; }
        .logo { display: flex; align-items: center; font-size: 18px; font-weight: 700; letter-spacing: 1px; }
        .logo span { font-weight: 400; color: #6b7a86; }
        .mark { display: inline-flex; gap: 2px; align-items: end; height: 21px; margin-right: 8px; }
        .mark i { display: block; width: 4px; background: #c88b2e; }
        .mark i:nth-child(1) { height: 10px; }
        .mark i:nth-child(2) { height: 18px; }
        .mark i:nth-child(3) { height: 14px; }
        .links { display: flex; gap: 24px; border-left: 1px solid #dde3e5; padding-left: 24px; font-size: 13px; font-weight: 600; color: #5c6c78; }
        a { color: inherit; text-decoration: none; }
        .hero { padding: 60px 0 40px; }
        .hero h1 { font-family: 'Playfair Display', serif; font-size: clamp(36px, 5vw, 60px); font-weight: 500; letter-spacing: -2px; margin: 0 0 12px; }
        .hero p { font-size: 17px; color: #546571; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 32px; padding: 40px 0 80px; }
        .card { border: 1px solid #dde3e5; border-radius: 4px; overflow: hidden; transition: box-shadow 0.2s; }
        .card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.09); }
        .card img { width: 100%; height: 200px; object-fit: cover; display: block; }
        .card-body { padding: 20px; }
        .tag { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; color: #a46b1d; }
        .card-body h2 { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 500; margin: 8px 0; line-height: 1.3; }
        .card-body p { font-size: 14px; color: #546571; line-height: 1.7; margin: 0 0 16px; }
        .card-meta { font-size: 11px; color: #81909a; }
        .footer { background: #041222; color: #a8b7c3; padding: 28px 0; font-size: 11px; }
        .footer .wrap { display: flex; justify-content: space-between; }
      `}</style>

            {/* Header */}
            <header className="wrap nav">
                <Link className="logo" href="/">
                    <span className="mark"><i /><i /><i /></span>
                    Properties<span>Nexus</span>
                </Link>
                <nav className="links">
                    <Link href="/properties">Properties</Link>
                    <Link href="/#areas">Locations</Link>
                    <Link href="/journal">Journal</Link>
                </nav>
            </header>

            <main>
                <div className="wrap">
                    <div className="hero">
                        <h1>The PropertiesNexus Journal</h1>
                        <p>Insights, guides, and stories from across India's property landscape.</p>
                    </div>

                    <div className="grid">
                        {Object.entries(PN_JOURNAL).map(([id, article]) => (
                            <Link href={`/journal/${id}`} key={id} className="card">
                                <img src={article.image} alt={article.title} />
                                <div className="card-body">
                                    <span className="tag">{article.category}</span>
                                    <h2>{article.title}</h2>
                                    <p>{article.intro}</p>
                                    <span className="card-meta">{article.read} · {article.location}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>

            <footer className="footer">
                <div className="wrap">
                    <span>© 2026 PropertiesNexus. All rights reserved.</span>
                    <Link href="/properties">Explore properties →</Link>
                </div>
            </footer>
        </>
    );
}