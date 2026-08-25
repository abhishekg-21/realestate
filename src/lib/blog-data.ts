export interface Article {
    category: string;
    title: string;
    read: string;
    location: string;
    image: string;
    intro: string;
    sections: [string, string][];
    takeaways: string[];
}

export const PN_JOURNAL: Record<string, Article> = {
    "neighbourhood-fit": {
        category: "Neighbourhood guide",
        title: "How to choose a neighbourhood that fits the life you want to live",
        read: "8 min read",
        location: "India living",
        image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=86",
        intro: "The right neighbourhood is not simply a pin on a map. It is the collection of small decisions that shape how every ordinary day feels.",
        sections: [
            ["Start with your non-negotiables", "Write down the constraints that will remain important long after the excitement of a new address fades: commute time, proximity to family, school access, healthcare, a preferred daily routine, or a need for quiet. A shorter list is more useful than an ambitious one. It gives every viewing a clear frame of reference."],
            ["Visit at more than one hour", "A locality can feel completely different at 8 AM, 2 PM and after sunset. Return at a time that reflects your actual routine. Notice traffic, walkability, lighting, street activity and the easy-to-miss details such as parking or lift queues. These observations reveal how a place works, not just how it presents itself."],
            ["Understand the everyday radius", "Think about the places you reach most often: grocery stores, green space, a favourite café, transit, work, friends and essential services. A home is more valuable when those places can be reached comfortably and repeatedly. The most convenient radius is personal; do not borrow someone else's definition of it."],
            ["Look ahead without guessing", "Ask about planned infrastructure and nearby development, but separate confirmed information from speculation. Consider how new roads, commercial activity or construction could affect access, noise and resale demand. A trusted local advisor can help turn broad claims into questions worth verifying."],
            ["Choose the feeling as well as the spreadsheet", "Price, size and commute are fundamental, but they do not capture the full experience of living somewhere. After your practical comparison, ask one final question: can you imagine an ordinary Tuesday here? Often, that answer is the clearest signal of all."],
        ],
        takeaways: [
            "Define no more than three non-negotiables before searching.",
            "Visit shortlisted areas at the times you would actually use them.",
            "Check confirmed future development, not only promotional claims.",
        ],
    },
    "offer-checklist": {
        category: "Buying",
        title: "What to check before you put in an offer on a home",
        read: "6 min read",
        location: "Buyer guide",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=86",
        intro: "Making an offer should feel deliberate, not rushed. A clear pre-offer review protects your time and helps you negotiate with confidence.",
        sections: [
            ["Confirm the essentials", "Match the listing against what you have seen: usable area, orientation, parking, floor, included fittings and possession timing. Ask for written clarity where an important detail is unclear."],
            ["Review the paperwork", "Ownership documents, approvals, society records, tax receipts and any applicable RERA information should be reviewed by a qualified professional before committing. This is not a box to tick at the end; it is part of understanding the property."],
            ["Calculate the complete cost", "The headline price is one part of the decision. Add registration, stamp duty, maintenance deposits, renovation, moving costs and loan charges. A complete number makes a better offer than an optimistic one."],
            ["Understand the seller's timeline", "A seller who needs a fast completion may value certainty as much as price. Ask about their preferred handover date and any conditions attached to the sale."],
            ["Put your offer in context", "Compare recent, genuinely similar homes—not just asking prices. Your advisor can help you account for building quality, floor, condition and micro-location before you decide your offer range."],
        ],
        takeaways: [
            "Verify property details against your viewing notes.",
            "Have a professional review documents before any payment commitment.",
            "Budget for the full acquisition cost, not only the asking price.",
        ],
    },
    "new-city-renting": {
        category: "Renting",
        title: "Renting in a new city: a first-month plan that works",
        read: "5 min read",
        location: "Rental guide",
        image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=86",
        intro: "A move becomes easier when the first month is planned in simple stages. Focus on the essentials first, then give yourself time to settle into the city.",
        sections: [
            ["Decide what must be ready on day one", "Power, water, internet access, keys, a working lock and a clear inventory should be handled before your first night. If the home is furnished, photograph the condition of key items as you take possession."],
            ["Keep the agreement clear", "Read the rent agreement carefully and confirm rent due dates, deposit conditions, notice period, maintenance responsibilities and rules around guests, pets or parking. Ask questions before signing, not after moving."],
            ["Build a local routine", "Your first week is for practical discovery: the nearest grocery shop, pharmacy, transport option, building contact and reliable local services. These small anchors help a new area become familiar quickly."],
            ["Plan for the invisible costs", "A new city can include setup expenses beyond rent: utility deposits, basic furniture, transport, household essentials and local memberships. Set aside a separate first-month buffer so these do not feel like surprises."],
            ["Give the place time", "A neighbourhood rarely reveals itself in one weekend. Walk a few different routes, try services at different hours and speak to people who live nearby. A rental is a chance to learn the city before making a longer commitment."],
        ],
        takeaways: [
            "Document the condition of the home at handover.",
            "Clarify every payment and responsibility in the agreement.",
            "Create a first-month setup budget separate from rent and deposit.",
        ],
    },
    "listing-details": {
        category: "Selling",
        title: "Seven details that help a property listing stand apart",
        read: "4 min read",
        location: "Seller guide",
        image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=86",
        intro: "The best property listings do not rely on exaggerated claims. They make it easy for the right buyer to understand a home and imagine its value.",
        sections: [
            ["Lead with the strongest truth", "It may be a generous living room, morning light, a garden, a high floor, a walkable location or a newly completed renovation. Choose one defining quality and make it clear from the first image and first line."],
            ["Use photos that answer questions", "Photograph each meaningful room, the approach to the property and the best views. Open curtains, remove visual clutter and use daylight where possible. A buyer should understand the flow before scheduling a viewing."],
            ["Be precise about the facts", "State area, floor, bedrooms, bathrooms, parking, age, furnishing and possession correctly. Precision builds trust and helps avoid viewings from people for whom the home is not a fit."],
            ["Explain the setting", "A home is never only its interiors. Add the locality, nearby conveniences, building character and relevant access points. Keep it useful rather than generic."],
            ["Prepare before you go live", "Gather documents, confirm a realistic price strategy and decide how viewings will be managed. A well-prepared seller can respond quickly when a serious buyer appears."],
        ],
        takeaways: [
            "Choose one distinctive property strength for the opening story.",
            "Use complete, well-lit photographs instead of a few dramatic angles.",
            "Accurate details save time and improve lead quality.",
        ],
    },
    "long-term-value": {
        category: "Investing",
        title: "Thinking beyond yield: how to assess a long-term property decision",
        read: "7 min read",
        location: "Market perspective",
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=86",
        intro: "A durable property decision considers how an asset may perform across changing market conditions—not just what it earns this year.",
        sections: [
            ["Start with demand quality", "Ask who would realistically live or work in the location, and why. Established employment, education, transport, lifestyle services and limited supply can all support demand over time."],
            ["Read the micro-market", "Two buildings a few streets apart can have different buyer profiles, maintenance standards and future supply. Study the immediate catchment before drawing conclusions from city-wide headlines."],
            ["Factor in ownership experience", "Maintenance, management quality, tenant fit, vacancy periods and renovation needs affect the real return. The easiest asset to own is often more valuable than one that looks stronger on paper."],
            ["Keep liquidity in view", "Consider who may buy the property from you later and what they will compare it with. A broad, durable buyer base often matters as much as a standout rental figure."],
            ["Build a patient case", "Set an investment horizon and test your assumptions. A long-term decision should still make sense if rent grows slowly, costs increase or your exit takes longer than expected."],
        ],
        takeaways: [
            "Evaluate real local demand, not only headline yield.",
            "Include maintenance, vacancy and management in return calculations.",
            "Think about the future buyer as well as the future tenant.",
        ],
    },
    "bengaluru-east": {
        category: "City guide",
        title: "A considered guide to living in Bengaluru's east",
        read: "9 min read",
        location: "Bengaluru",
        image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1600&q=86",
        intro: "Bengaluru's east offers a variety of living patterns—from established residential streets to newer work-connected communities. The right choice depends on how you use the city.",
        sections: [
            ["Choose your connection point", "Start with the places that structure your week: office, school, family or airport access. Eastern Bengaluru has several distinct travel corridors, so proximity to the right one can matter more than a general area label."],
            ["Look for mature daily infrastructure", "Newer communities can offer modern amenities, while established pockets may bring easier access to local markets, schools and services. Compare what is available now, not only what is promised."],
            ["Balance energy and quiet", "Some areas thrive on cafés, coworking and activity; others offer calmer residential streets. Visit at weekday rush hour and on a weekend to understand the change in pace."],
            ["Consider apartment community fit", "In larger developments, amenities and association quality shape everyday life. Ask about maintenance, visitor policy, power backup, parking and community rules during your viewing."],
            ["Keep the search personal", "There is no single best address in Bengaluru's east. The best one is the place that makes your own commute, routine and preferred pace feel easier."],
        ],
        takeaways: [
            "Choose areas based on your real travel corridors.",
            "Compare current infrastructure with future promises.",
            "Visit at weekday and weekend times before deciding.",
        ],
    },
    "mumbai-quiet": {
        category: "City guide",
        title: "Finding a quieter side of Mumbai without losing connection",
        read: "7 min read",
        location: "Mumbai",
        image: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=1600&q=86",
        intro: "In Mumbai, quiet is often a matter of building position, street character and how a home connects to the rest of the city.",
        sections: [
            ["Separate neighbourhood from street", "A well-known locality can contain busy arteries, calm lanes and distinct building environments. Stand outside the exact property at the times you will use it; street-level experience matters."],
            ["Study the building as carefully as the address", "Setbacks, window orientation, floor height, common-area maintenance and neighbouring construction all influence how peaceful a home feels. These are practical quality markers, not minor details."],
            ["Protect your daily connection", "A quieter home should not create an exhausting routine. Test the route to your regular destinations and consider transport choices, local services and the reliability of the last mile."],
            ["Look for light and ventilation", "In a dense city, natural light, cross ventilation and a thoughtful outlook often make a larger difference to daily comfort than a few extra square feet."],
            ["Use a longer viewing", "If a property is seriously interesting, return for a second viewing. The first visit reveals the home; the second often reveals the life around it."],
        ],
        takeaways: [
            "Assess the precise street and building—not only the locality name.",
            "Prioritise light, ventilation and outlook in dense areas.",
            "Take a second viewing before making a final decision.",
        ],
    },
};