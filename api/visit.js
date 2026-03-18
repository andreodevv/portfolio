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

    // Rota POST: Cria a visita com Geolocalização Completa
    if (req.method === 'POST') {
        const { referrer, screen, lang, ua } = req.body;

        // Captura dados geográficos dos headers da Vercel
        const city = req.headers['x-vercel-ip-city'] || 'Desconhecido';
        const region = req.headers['x-vercel-ip-country-region'] || 'Desconhecido';
        const country = req.headers['x-vercel-ip-country'] || 'Desconhecido';
        const latitude = req.headers['x-vercel-ip-latitude'] || '0';
        const longitude = req.headers['x-vercel-ip-longitude'] || '0';
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
                latitude,
                longitude,
                ip: ip.split(',')[0]
            })
        });

        const data = await response.json();
        return res.status(201).json(data[0]);
    }

    // Rota PATCH: Atualiza com os campos de contato
    if (req.method === 'PATCH') {
        const { id, visitor_name, company, job_title, visitor_email, visitor_phone } = req.body;

        if (!id) return res.status(400).json({ error: 'ID da visita não encontrado' });

        await fetch(`${SUPABASE_URL}/rest/v1/visits?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            },
            body: JSON.stringify({
                visitor_name,
                company,
                job_title,
                visitor_email,
                visitor_phone
            })
        });

        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ message: 'Método não permitido' });
}