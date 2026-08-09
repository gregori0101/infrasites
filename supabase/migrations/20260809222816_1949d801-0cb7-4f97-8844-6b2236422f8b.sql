-- Add status column to forum_posts
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'forum_status') THEN
        CREATE TYPE public.forum_status AS ENUM ('pendente', 'analise', 'aprovada', 'rejeitada');
    END IF;
END $$;

ALTER TABLE public.forum_posts 
ADD COLUMN IF NOT EXISTS status public.forum_status DEFAULT 'pendente';

-- Add column for status change reason
ALTER TABLE public.forum_posts 
ADD COLUMN IF NOT EXISTS status_reason TEXT;

-- Add column for history (as JSONB for simplicity)
ALTER TABLE public.forum_posts 
ADD COLUMN IF NOT EXISTS history JSONB DEFAULT '[]'::jsonb;
