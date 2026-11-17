
const PROFILES = {
  "ليلى": "أنتِ ليلى، مستشارة اللغات الإنجليزية واللغات الأخرى ومهارات التواصل. أجيبي بالعربية أو باللغة التي يطلبها العميل، وقدمي أمثلة وتمارين عند الحاجة.",
  "آدم": "أنت آدم، مستشار التكنولوجيا والمهارات الرقمية والبرمجة والأدوات التقنية. اشرح ببساطة وبخطوات عملية.",
  "نور": "أنتِ نور، مستشارة الأعمال والمحاسبة والتمويل والإدارة وريادة الأعمال. قدمي شرحاً عملياً، ولا تختلقي أرقاماً أو بيانات تخص المركز.",
  "زياد": "أنت زياد، مستشار التطوير الشخصي ومهارات التعلم وتنظيم الوقت وتحقيق الأهداف. قدم خططاً عملية واقعية."
};

function send(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store"
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return send({ ok: true, service: "BCCIT AI Team", provider: "Gemini" });
    }

    if (request.method === "POST" && url.pathname === "/api/team-chat") {
      if (!env.GEMINI_API_KEY) {
        return send({ error: "Gemini API key is not configured." }, 503);
      }

      let body;
      try {
        const raw = await request.text();
        if (raw.length > 100000) {
          return send({ error: "Request is too large." }, 413);
        }
        body = JSON.parse(raw || "{}");
      } catch {
        return send({ error: "Invalid JSON request." }, 400);
      }

      const name = String(body.character || "مستشار BCCIT");
      const profile = PROFILES[name] ||
        "أنت مستشار مساعد في BCCIT ACADEMY. أجب بدقة ووضوح واطلب التوضيح عند الحاجة.";

      const messages = Array.isArray(body.messages)
        ? body.messages.slice(-12)
        : [];

      const contents = messages
        .filter(m =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string"
        )
        .map(m => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content.slice(0, 12000) }]
        }));

      if (!contents.length || contents[contents.length - 1].role !== "user") {
        return send({ error: "A user message is required." }, 400);
      }

      const model = env.GEMINI_MODEL || "gemini-2.5-flash";
      const endpoint =
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{
                text: profile +
                  " أجب عن السؤال الحالي مباشرة ولا تعتمد على إجابات محفوظة. لا تخترع أسعاراً أو مواعيد أو سياسات تخص الأكاديمية. إذا لم تتوفر معلومة مؤكدة فقل ذلك بوضوح."
              }]
            },
            contents,
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: 900
            }
          })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          return send({
            error: data?.error?.message || "Gemini request failed."
          }, 502);
        }

        const reply = (data?.candidates?.[0]?.content?.parts || [])
          .map(part => part.text || "")
          .join("")
          .trim();

        if (!reply) {
          return send({ error: "No response text returned." }, 502);
        }

        return send({ reply });
      } catch {
        return send({ error: "Could not reach Gemini. Please try again." }, 502);
      }
    }

    // Serve the original catalog without replacing its contents.
    if (request.method === "GET" &&
        (url.pathname === "/" || url.pathname === "/index.html")) {
      url.pathname = "/BCCIT_People_of_the_Future_AI_Team.html";
      return env.ASSETS.fetch(new Request(url, request));
    }

    return env.ASSETS.fetch(request);
  }
};
