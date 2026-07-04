import { expect, test } from "vitest";
import { formatParseError } from "./formatParseError";

test("formats syntax error", () => {
  expect(formatParseError("Syntax error in text")).toContain("Syntax error");
});

test("formats line hint", () => {
  expect(formatParseError("Syntax error", 5)).toContain("line 5");
});

test("handles empty message", () => {
  expect(formatParseError("")).toBe("Something went wrong while parsing the diagram.");
});

test("handles diagram type error", () => {
  expect(formatParseError("No diagram type detected")).toContain("Could not detect diagram type");
});
