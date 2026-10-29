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
