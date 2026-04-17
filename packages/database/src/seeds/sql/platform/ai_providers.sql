-- =============================================================================
-- AI PROVIDERS - AI szolgáltatók alapértelmezett adatai
-- =============================================================================

-- AI szolgáltatók beszúrása
INSERT INTO platform.ai_providers (name, display_name, description, is_enabled, is_recommended) VALUES
('gemini', 'Google Gemini', 'Google Gemini AI modellek', true, true),
('groq', 'Groq', 'Groq gyors inferencia platform', true, false),
('openai', 'OpenAI', 'OpenAI GPT modellek', true, true),
('anthropic', 'Anthropic', 'Anthropic Claude modellek', true, false),
('huggingface', 'Hugging Face', 'Hugging Face Inference API', true, false),
('custom', 'Egyéni endpoint', 'Saját AI API endpoint', true, false)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    is_enabled = EXCLUDED.is_enabled,
    is_recommended = EXCLUDED.is_recommended,
    updated_at = NOW();