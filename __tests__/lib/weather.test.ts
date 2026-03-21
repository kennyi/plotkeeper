import { describe, it, expect } from "vitest";
import { getWeatherCondition } from "@/lib/weather";

describe("getWeatherCondition", () => {
  it("maps code 0 to clear", () => {
    expect(getWeatherCondition(0)).toBe("clear");
  });
  it("maps code 1 to partly-cloudy", () => {
    expect(getWeatherCondition(1)).toBe("partly-cloudy");
  });
  it("maps code 2 to partly-cloudy", () => {
    expect(getWeatherCondition(2)).toBe("partly-cloudy");
  });
  it("maps code 3 to cloudy", () => {
    expect(getWeatherCondition(3)).toBe("cloudy");
  });
  it("maps code 45 to fog", () => {
    expect(getWeatherCondition(45)).toBe("fog");
  });
  it("maps code 48 to fog", () => {
    expect(getWeatherCondition(48)).toBe("fog");
  });
  it("maps code 51 to drizzle", () => {
    expect(getWeatherCondition(51)).toBe("drizzle");
  });
  it("maps code 61 to rain", () => {
    expect(getWeatherCondition(61)).toBe("rain");
  });
  it("maps code 65 to heavy-rain", () => {
    expect(getWeatherCondition(65)).toBe("heavy-rain");
  });
  it("maps code 80 to heavy-rain", () => {
    expect(getWeatherCondition(80)).toBe("heavy-rain");
  });
  it("maps code 95 to thunderstorm", () => {
    expect(getWeatherCondition(95)).toBe("thunderstorm");
  });
  it("maps code 71 to snow", () => {
    expect(getWeatherCondition(71)).toBe("snow");
  });
  it("maps unknown code to cloudy as fallback", () => {
    expect(getWeatherCondition(999)).toBe("cloudy");
  });
});
