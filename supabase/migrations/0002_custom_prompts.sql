-- Allow sessions to record a user-typed topic instead of one of the seeded
-- prompts. prompt_id stays nullable (a NULL foreign key value is always
-- valid regardless of the referenced table) and is left null for custom
-- topics; the actual text lives in custom_prompt_text instead.
alter table public.sessions add column if not exists custom_prompt_text text;
