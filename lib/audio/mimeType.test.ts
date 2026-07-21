import { describe, expect, it } from "vitest";
import { extensionForMimeType } from "@/lib/audio/mimeType";

describe("extensionForMimeType", () => {
  it("maps audio/webm (Chrome/Android default) to webm", () => {
    expect(extensionForMimeType("audio/webm;codecs=opus")).toBe("webm");
    expect(extensionForMimeType("audio/webm")).toBe("webm");
  });

  it("maps audio/mp4 (Safari/iOS default) to mp4, not webm", () => {
    expect(extensionForMimeType("audio/mp4")).toBe("mp4");
    expect(extensionForMimeType("audio/mp4;codecs=mp4a.40.2")).toBe("mp4");
  });

  it("maps audio/wav to wav", () => {
    expect(extensionForMimeType("audio/wav")).toBe("wav");
    expect(extensionForMimeType("audio/x-wav")).toBe("wav");
  });

  it("maps audio/ogg to ogg", () => {
    expect(extensionForMimeType("audio/ogg;codecs=opus")).toBe("ogg");
  });

  it("maps mpeg/mp3 to mp3", () => {
    expect(extensionForMimeType("audio/mpeg")).toBe("mp3");
  });

  it("maps flac to flac", () => {
    expect(extensionForMimeType("audio/flac")).toBe("flac");
  });

  it("falls back to webm for an unrecognized or empty type", () => {
    expect(extensionForMimeType("")).toBe("webm");
    expect(extensionForMimeType("application/octet-stream")).toBe("webm");
  });
});
