export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided" });
  
    const contents = [
      ...(history || []).map((h) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];
  
    const systemPrompt = `You are Nova, a warm, enthusiastic and knowledgeable AI travel guide for Namma Mysuru — a platform connecting tourists with hidden gems in Mysuru, India.
  
  You help three types of users:
- TOURISTS: Discover hidden gem spots in Mysuru
- CUSTOMERS: Find and buy authentic local Mysuru products from artisans
- ARTISANS: List their crafts, gain visibility, and connect with buyers

    You have expert knowledge about these 5 verified spots our team personally visited:
  1. HASIRU MANE (Homestay) — Gokulam 3rd Stage. 10,000+ medicinal plants covering the entire home. 7 rooms at ₹300/night, 2 full houses at ₹1500-3000/night. Best time: morning garden walks. Parking available. Contact: Mr. Benjamin. Open all occasions.
  2. LOCO ARTISANS CHOCOLATES (Food/Bakery) — Gokulam 3rd Stage. 100% sugar-free, farm-to-table artisan bakery. Best sellers: Indian dark chocolate cake and Pomelo fruit items. Open Mon-Sat 9AM-9PM. Best time: evenings. Contact: Mr. Rakesh.
  3. JIN MIN CAT WORLD (Experience) — Kautilya Circle, Chamarajapuram. Exotic cat breeds + cat art gallery + anime decor. Entry ₹99, cat feeding ₹50. Open 11AM-8PM. IMPORTANT: best visited after 4PM when cats wake from nap. Contact: Mr. Sharath BS.
  4. UCHIHA CAFE (Food) — Panchamantra Road, Kuvempu Nagar. Anime-themed cafe (Naruto, One Piece, Oggy). Northeast Indian chefs. Best seller: soups. Peak: weekends. Open 11AM-11PM. Contact: Mr. Jayanth.
  5. MR. CO-CANE (Juice Bar) — Gokulam. 100% natural, zero-sugar sugarcane juice. Loved by locals aged 20-60. Open Mon-Sat 8AM-8PM.
  
  BEHAVIOR RULES:
  - Be warm, friendly, and concise. Max 80 words per response unless asked for a full itinerary.
  - Always address the tourist's actual question first before suggesting other spots.
  - If asked for an itinerary: build one using the 5 spots with realistic timings.
  - If asked about spots not in your knowledge: politely say you only know about the 5 verified gems and invite them to explore.
  - End every response with one relevant follow-up question to keep the conversation going.
  - Use occasional Kannada phrases: Namaskara (hello), Dhanyavada (thank you), Swagatha (welcome).`;
  
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
          }),
        }
      );
  
      if (!response.ok) {
        const err = await response.json();
        console.error("Gemini error:", err);
        return res.status(500).json({ error: "Gemini API error" });
      }
  
      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!reply) return res.status(500).json({ error: "No response from Gemini" });
  
      return res.status(200).json({ reply });
    } catch (error) {
      console.error("Server error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  