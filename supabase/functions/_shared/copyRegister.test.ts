import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { findRegisterViolations } from "./copyRegister.ts";
Deno.test("flags hype words in nested content", () => {
  const hits = findRegisterViolations({ hero: { sub: "Visceral market resonance" }, f: ["A powerful tool"] });
  assertEquals(hits.map((h) => h.word).sort(), ["powerful", "resonance", "visceral"]);
});
Deno.test("plain copy passes", () => {
  assertEquals(findRegisterViolations({ h: "We write the brand guide your sales team uses." }).length, 0);
});
Deno.test("flags three-clause dash chains only", () => {
  assertEquals(findRegisterViolations("A — B — C")[0].word, "em-dash-chain");
  assertEquals(findRegisterViolations("A — B").length, 0);
});
import { findProvenanceViolations } from "./copyRegister.ts";
const INPUT = "Many businesses struggle with a clear brand message, an inconsistent brand identity, leading to missed opportunities and difficulty connecting with their target audience.";
Deno.test("flags invented competitor consequence in problem statement", () => {
  const hits = findProvenanceViolations({ problemStatement: "They lose deals to competitors whose brands look sharper, even when work quality is comparable." }, INPUT);
  assertEquals(hits.length, 1);
});
Deno.test("restated challenge passes; non-problem fields ignored", () => {
  assertEquals(findProvenanceViolations({ problemStatement: "An inconsistent identity and unclear message lead to missed opportunities.", headline: "Totally unrelated words here", ctaText: "Book unrelated stuff today" }, INPUT).length, 0);
});
Deno.test("flags invented competitor behaviour in objection answers", () => {
  const hits = findProvenanceViolations({ objections: [{ objection: "Is this just design?", answer: "Most agencies start with aesthetics. We start with strategy and clarify your brand message." }] }, INPUT);
  assertEquals(hits.map((h) => h.reason), ["competitor-claim"]);
});
Deno.test("competitor contrast the user stated is allowed", () => {
  assertEquals(findProvenanceViolations({ faqItems: [{ answer: "Generic agencies miss your brand message." }] }, "Generic agencies don't understand our brand message").filter((h) => h.reason === "competitor-claim").length, 0);
});
