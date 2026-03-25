export default async function handler(req, res) {
    // 1. Configurar CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { SUPABASE_URL, SUPABASE_KEY } = process.env;

    // Rota POST: Cria a visita com Geolocalização e Inteligência de Marketing
    if (req.method === 'POST') {
        const { 
            referrer, screen, lang, ua, 
            utm_source, utm_medium, utm_campaign, is_returning 
        } = req.body;

        // Captura dados geográficos automáticos da Vercel
        const city = req.headers['x-vercel-ip-city'] || 'Desconhecido';
        const region = req.headers['x-vercel-ip-country-region'] || 'Desconhecido';
        const country = req.headers['x-vercel-ip-country'] || 'Desconhecido';
        const ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || '0.0.0.0';

        const response = await fetch(`${SUPABASE_URL}/rest/v1/visits`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                referrer,
                screen_res: screen,
                language: lang,
                user_agent: ua,
                city,
                region,
                country,
                ip: ip.split(',')[0],
                utm_source,
                utm_medium,
                utm_campaign,
                is_returning: is_returning || false
            })
        });

        const data = await response.json();
        return res.status(201).json(data[0]);
    }

    // Rota PATCH: Atualiza Lead (Nome, Email, Mensagem) OU Tempo de Permanência
    if (req.method === 'PATCH') {
        // CORREÇÃO: Removidos os campos antigos e adicionado o 'message'
        const { id, visitor_name, visitor_email, message, time_on_page } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'ID da visita não informado.' });
        }

        const updateData = {};
        if (visitor_name !== undefined) updateData.visitor_name = visitor_name;
        if (visitor_email !== undefined) updateData.visitor_email = visitor_email;
        
        // CORREÇÃO: Condicional apontando para a variável correta
        if (message !== undefined) updateData.message = message;

        if (time_on_page !== undefined) updateData.time_on_page = time_on_page;

        const response = await fetch(`${SUPABASE_URL}/rest/v1/visits?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({ error: 'Falha ao atualizar Supabase', details: errorData });
        }

        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ message: 'Método HTTP não permitido.' });
}