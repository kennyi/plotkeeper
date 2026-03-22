import { describe, it, expect } from "vitest";
import { getWeatherCondition } from "@/lib/weather";

describe("getWeatherCondition", () => {
  it("maps code 0 to clear", () => {
    expect(getWeatherCondition(0)).toBe("clear");
  });

  it.each([1, 2])("maps code %i to partly-cloudy", (code) => {
    expect(getWeatherCondition(code)).toBe("partly-cloudy");
  });

  it("maps code 3 to cloudy", () => {
    expect(getWeatherCondition(3)).toBe("cloudy");
  });

  it.each([45, 48])("maps code %i to fog", (code) => {
    expect(getWeatherCondition(code)).toBe("fog");
  });

  it.each([51, 53, 55, 56, 57])("maps code %i to drizzle", (code) => {
    expect(getWeatherCondition(code)).toBe("drizzle");
  });

  it.each([61, 63, 66, 67])("maps code %i to rain", (code) => {
    expect(getWeatherCondition(code)).toBe("rain");
  });

  it.each([65, 80, 81])("maps code %i to heavy-rain", (code) => {
    expect(getWeatherCondition(code)).toBe("heavy-rain");
  });

  it.each([82, 95, 96, 99])("maps code %i to thunderstorm", (code) => {
    expect(getWeatherCondition(code)).toBe("thunderstorm");
  });

  it.each([71, 73, 75, 77, 85, 86])("maps code %i to snow", (code) => {
    expect(getWeatherCondition(code)).toBe("snow");
  });

  it.each([999, -1, 0o777])("maps unknown code %i to cloudy as fallback", (code) => {
    expect(getWeatherCondition(code)).toBe("cloudy");
  });
});
