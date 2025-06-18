# aiterminal.chat

**Visit the live application here: [aiterminal.chat](https://aiterminal.chat)**

## 🚀 Welcome to aiterminal.chat!

aiterminal.chat is a cutting-edge web open-source application designed to simplify your interactions with multiple Large Language Models (LLMs) in one centralized place. Say goodbye to juggling different platforms – with aiterminal.chat, you can seamlessly communicate with a diverse range of powerful AI models, compare their outputs, and streamline your workflow.

### ✨ Key Features

- **Unified Interface:** Access and interact with various LLMs from a single, intuitive web interface.
- **Diverse Model Support:** Connect with leading models from providers like Gemini, OpenAI, Claude, Grok, and DeepSeek.
- **Real-time Conversations:** Engage in dynamic and responsive conversations with your chosen AI models.
- **Premium Options:** Unlock access to advanced and more powerful models for enhanced capabilities.

## 🧠 Supported Models

aiterminal.chat offers a wide array of LLMs to cater to your specific needs. Here's a list of the models currently supported:

| Model Value                      | Label            | Provider | Premium |
| :------------------------------- | :--------------- | :------- | :------ |
| `gemini-2.5-flash-preview-04-17` | Gemini 2.5 Flash | gemini   | No      |
| `gemini-2.5-pro-preview-05-06`   | Gemini 2.5 Pro   | gemini   | Yes     |
| `o4-mini`                        | GPT-4o mini      | openai   | No      |
| `gpt-4.1-nano`                   | GPT-4.1 nano     | openai   | No      |
| `o3-mini`                        | o3-mini          | openai   | No      |
| `gpt-3.5-turbo`                  | GPT-3.5 Turbo    | openai   | Yes     |
| `claude-4-sonnet-20250514`       | Claude 4 Sonnet  | claude   | Yes     |
| `claude-4-opus-20250514`         | Claude 4 Opus    | claude   | Yes     |
| `grok-3`                         | Grok-3           | grok     | Yes     |
| `grok-3-mini`                    | Grok-3 Mini      | grok     | No      |
| `deepseek-chat`                  | DeepSeek Chat    | deepseek | No      |
| `deepseek-reasoner`              | DeepSeek-R1      | deepseek | Yes     |

## 🛠️ Tech Stack

aiterminal.chat is built with modern and robust technologies to ensure a smooth, scalable, and secure user experience.

### Frontend

Our user interface is crafted with:

- **Next.js 15.3.3:** A powerful React framework for building fast and scalable web applications.
- **shadcn/ui:** A collection of accessible and customizable UI components built with Radix UI and Tailwind CSS, providing a consistent design system.
- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
- **Redux Toolkit:** For efficient state management across the application.
- **`react-markdown` & `react-syntax-highlighter`:** For beautiful rendering of AI responses, including code snippets.
- **TypeScript:** For type safety and improved code quality.

### Backend

Our robust backend powers the LLM interactions and data management:

- **Node.js with Express:** A fast, unopinionated, minimalist web framework for Node.js, following the MVC (Model-View-Controller) architectural pattern for clear separation of concerns.
- **`@ai-sdk/*` packages:** For seamless integration with various AI model providers (Anthropic, DeepSeek, Google, OpenAI, XAI).
- **Knex.js:** A SQL query builder for PostgreSQL, ensuring reliable database interactions.
- **PostgreSQL:** A powerful, open-source relational database.
- **`pino`:** A very fast, low overhead Node.js logger.
- **Stripe:** For handling premium model subscriptions and payments.
- **Better Auth:** For secure user authentication and session management.
