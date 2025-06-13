export const seed = async function (knex) {
  await knex("models").del();

  const models = [
    {
      value: "gemini-2.5-flash",
      label: "Gemini 2.5 flash",
      provider: "gemini",
      premium: false,
    },
    {
      value: "gemini-2.5-pro",
      label: "Gemini 2.5 pro",
      provider: "gemini",
      premium: false,
    },
    {
      value: "o4-mini",
      label: "o4 mini",
      provider: "openai",
      premium: false,
    },
    {
      value: "gpt-4.1-nano",
      label: "4.1 nano",
      provider: "openai",
      premium: false,
    },
    {
      value: "o3-mini",
      label: "o3 mini",
      provider: "openai",
      premium: false,
    },
    {
      value: "o3",
      label: "o3",
      provider: "openai",
      premium: true,
    },
    {
      value: "claude-4-sonnet",
      label: "4 sonnet",
      provider: "claude",
      premium: true,
    },
    {
      value: "claude-4-sonnet-reasoning",
      label: "4 sonnet reasoning",
      provider: "claude",
      premium: true,
    },
    { value: "grok-3", label: "3", provider: "grok", premium: true },
    {
      value: "grok-3-mini",
      label: "3 mini",
      provider: "grok",
      premium: false,
    },
    {
      value: "deepseek-reasoner",
      label: "v3",
      provider: "deepseek",
      premium: false,
    },
    {
      value: "deepseek-reasoner-r1",
      label: "r1",
      provider: "deepseek",
      premium: false,
    },
  ];

  const modelsToInsert = models.filter((model) => model.value);

  await knex("models").insert(modelsToInsert);
};
