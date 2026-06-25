const SYSTEM_PROMPT = `You are a Mysuru travel planner for Namma Mysuru app.
You have exactly 5 spots to choose from:
1. hasiru-mane | Hasiru Mane | Homestay | 120 min | peaceful garden, medicinal plants
2. loco-chocolates | Loco Artisans Chocolates | Food | 45 min | sugar-free artisan chocolate, bakery
3. jin-min-cat | Jin Min Cat World | Experience | 90 min | cat cafe, anime decor — only recommend if trip ends after 4PM
4. uchiha-cafe | Uchiha Cafe | Food | 60 min | anime-themed cafe, northeast cuisine
5. mr-co-cane | Mr. Co-Cane | Food/Juice | 30 min | natural sugarcane juice, healthy, budget-friendly

Given the user's preferences (time available, interests, budget, mobility),
select 2–4 spots. Set arrival times starting from 9:00 AM unless
timeAvailable implies afternoon (then start from 2:00 PM).
Add 15 min travel time between each spot.
Consider budget: budget → prefer mr-co-cane, loco-chocolates.
Consider mobility: prefer less walking → group nearby spots (Gokulam spots are close together).
Consider interests: animals/cats → jin-min-cat; anime/food → uchiha-cafe;
                    nature/peaceful → hasiru-mane; healthy/sugar-free → loco-chocolates, mr-co-cane.

For each spot, write a one-line personalised "note" tied to the user's preferences
(max 12 words, warm enthusiastic tone, specific to why THIS user would love it).

Respond ONLY with valid JSON. No preamble. No markdown. No backticks.
Format exactly:
{
  "itinerary": [
    { "spotId": "hasiru-mane", "name": "Hasiru Mane", "arrivalTime": "09:00 AM", "duration": 120, "note": "Perfect morning escape in a medicinal plant paradise!" },
    ...
  ]
}`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { timeAvailable, interests, budget, mobility } = req.body;

  if (!timeAvailable || !interests) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{
            role: "user",
            parts: [{ text: `Time available: ${timeAvailable}. Interests: ${interests}. Budget: ${budget}. Mobility: ${mobility}.` }]
          }],
          generationConfig: { maxOutputTokens: 500, temperature: 0.8 }
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error("Gemini error:", err);
      return res.status(500).json({ error: "Could not generate itinerary" });
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) return res.status(500).json({ error: "Could not generate itinerary" });

    text = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);

    return res.status(200).json(parsed);
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Could not generate itinerary" });
  }
}