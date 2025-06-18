export const seed = async function (knex) {
  await knex("models").del();

  const models = [
    {
      value: "gemini-2.5-flash-preview-04-17",
      label: "Gemini 2.5 Flash",
      provider: "gemini",
      premium: false,
    },
    {
      value: "gemini-2.5-pro-preview-05-06",
      label: "Gemini 2.5 Pro",
      provider: "gemini",
      premium: true,
    },
    {
      value: "o4-mini",
      label: "GPT-4o mini",
      provider: "openai",
      premium: false,
    },
    {
      value: "gpt-4.1-nano",
      label: "GPT-4.1 nano",
      provider: "openai",
      premium: false,
    },
    {
      value: "o3-mini",
      label: "o3-mini",
      provider: "openai",
      premium: false,
    },
    {
      value: "gpt-3.5-turbo",
      label: "GPT-3.5 Turbo",
      provider: "openai",
      premium: true,
    },
    {
      value: "claude-4-sonnet-20250514",
      label: "Claude 4 Sonnet",
      provider: "claude",
      premium: true,
    },
    {
      value: "claude-4-opus-20250514",
      label: "Claude 4 Opus",
      provider: "claude",
      premium: true,
    },
    { value: "grok-3", label: "Grok-3", provider: "grok", premium: true },
    {
      value: "grok-3-mini",
      label: "Grok-3 Mini",
      provider: "grok",
      premium: false,
    },
    {
      value: "deepseek-chat",
      label: "DeepSeek Chat",
      provider: "deepseek",
      premium: false,
    },
    {
      value: "deepseek-reasoner",
      label: "DeepSeek-R1",
      provider: "deepseek",
      premium: true,
    },
  ];

  await knex("models").insert(models);
};
