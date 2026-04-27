insert into sources (kind, url, name) values
  ('rss', 'https://www.anthropic.com/news/rss.xml', 'Anthropic'),
  ('rss', 'https://openai.com/blog/rss.xml', 'OpenAI Blog'),
  ('rss', 'https://blog.google/technology/ai/rss/', 'Google AI'),
  ('rss', 'https://mistral.ai/news/rss.xml', 'Mistral'),
  ('rss', 'https://huggingface.co/blog/feed.xml', 'HuggingFace Blog'),
  ('github_releases', 'anthropics/anthropic-sdk-python', 'anthropic-sdk-python'),
  ('github_releases', 'openai/openai-python', 'openai-python'),
  ('github_releases', 'langchain-ai/langchain', 'langchain'),
  ('github_releases', 'run-llama/llama_index', 'llama_index'),
  ('github_releases', 'vllm-project/vllm', 'vllm'),
  ('github_releases', 'ollama/ollama', 'ollama'),
  ('github_releases', 'huggingface/transformers', 'transformers'),
  ('github_releases', 'ggerganov/llama.cpp', 'llama.cpp'),
  ('hn', 'frontpage', 'Hacker News'),
  ('reddit', 'LocalLLaMA', 'r/LocalLLaMA'),
  ('reddit', 'MachineLearning', 'r/MachineLearning')
on conflict do nothing;
