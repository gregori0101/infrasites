import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Create admin client to access auth.users
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verify the requesting user is authenticated and is a gestor/admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if user is gestor or admin
    const { data: userRole } = await supabaseAdmin
      .from('user_roles')
      .select('role, approved')
      .eq('user_id', user.id)
      .single()

    if (!userRole?.approved || (userRole.role !== 'gestor' && userRole.role !== 'administrador')) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get all approved technicians
    const { data: technicians, error: techError } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .eq('role', 'tecnico')
      .eq('approved', true)

    if (techError) {
      throw techError
    }

    const approvedTechnicianIds = technicians?.map(t => t.user_id) || []

    // Also get user_ids from reports to include technicians who submitted reports
    // but might not be in the approved list
    const { data: reportTechnicians, error: reportError } = await supabaseAdmin
      .from('reports')
      .select('user_id')
      .not('user_id', 'is', null)

    if (reportError) {
      throw reportError
    }

    // Combine both lists and deduplicate
    const reportUserIds = reportTechnicians?.map(r => r.user_id).filter(Boolean) || []
    const allUserIds = [...new Set([...approvedTechnicianIds, ...reportUserIds])]

    if (allUserIds.length === 0) {
      return new Response(JSON.stringify({ technicians: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get user emails from auth.users
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000
    })

    if (usersError) {
      throw usersError
    }

    // Filter and map to get emails for all relevant users
    const technicianEmails = users
      .filter(u => allUserIds.includes(u.id))
      .map(u => ({
        id: u.id,
        email: u.email || u.id
      }))

    return new Response(JSON.stringify({ technicians: technicianEmails }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
