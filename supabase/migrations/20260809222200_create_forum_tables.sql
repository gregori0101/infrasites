-- Create table for forum posts
CREATE TABLE public.forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    text_content TEXT NOT NULL,
    image_url TEXT,
    is_fixed BOOLEAN DEFAULT FALSE,
    admin_response TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Grant privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forum_posts TO authenticated;
GRANT ALL ON public.forum_posts TO service_role;

-- Enable RLS
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can see all forum posts" ON public.forum_posts
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create their own forum posts" ON public.forum_posts
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON public.forum_posts
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any post (responses)" ON public.forum_posts
    FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
