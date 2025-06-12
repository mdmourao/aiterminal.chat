export function getLogoFromProvider(provider: string): string {
  switch (provider) {
    case "openai":
      return "openai-black.svg";
    case "gemini":
      return "google-color.svg";
    case "grok":
      return "grok.svg";
    default:
      return "ai.svg";
  }
}
