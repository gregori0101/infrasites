import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's token to verify they're admin
    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Prefer user id from verified JWT claims (more reliable in functions runtime)
    let requesterUserId = req.headers.get('x-jwt-claim-sub')?.trim();

    // Fallback: ask auth API for the current user
    if (!requesterUserId) {
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
      if (userError || !user) {
        console.error('auth.getUser failed', { message: userError?.message, name: userError?.name });
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      requesterUserId = user.id;
    }

    if (!requesterUserId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role to check admin & access auth.users
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user is admin via direct query (is_admin is in private schema, not RPC-exposed)
    const { data: roleRow, error: roleErr } = await supabaseAdmin
      .from('user_roles')
      .select('role, approved')
      .eq('user_id', requesterUserId)
      .eq('role', 'administrador')
      .eq('approved', true)
      .maybeSingle();

    if (roleErr || !roleRow) {
      console.error('Admin check failed', { requesterUserId, roleErr });
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all user IDs from request body
    const { userIds } = await req.json();
    
    if (!userIds || !Array.isArray(userIds)) {
      return new Response(
        JSON.stringify({ error: 'userIds array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch ALL users from auth.users with pagination
    const allUsers: { id: string; email?: string }[] = [];
    let page = 1;
    const perPage = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage
      });
      
      if (usersError) {
        throw usersError;
      }

      if (users && users.length > 0) {
        allUsers.push(...users);
        page++;
        // If we got fewer than perPage, we've reached the end
        hasMore = users.length === perPage;
      } else {
        hasMore = false;
      }
    }

    console.log(`Fetched ${allUsers.length} total users from auth`);

    // Create a map of user_id to email
    const emailMap: Record<string, string> = {};
    for (const authUser of allUsers) {
      if (userIds.includes(authUser.id)) {
        emailMap[authUser.id] = authUser.email || 'Email não disponível';
      }
    }

    console.log(`Matched ${Object.keys(emailMap).length} emails for ${userIds.length} requested user IDs`);

    return new Response(
      JSON.stringify({ emails: emailMap }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching user emails:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
