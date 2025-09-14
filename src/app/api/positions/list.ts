// pages/api/positions/list.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../lib/supabaseClient';

interface Position {
  id: number;
  position_name: string;
  position_start_date: string;
  position_end_date: string | null;
  created_at: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vérification de l'authentification
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Récupérer l'ID de la compagnie via la fonction get_company_candidates
    // Note: Nous utilisons cette fonction pour obtenir l'ID de la compagnie
    const { data: companyData, error: companyError } = await supabase
      .rpc('get_company_candidates', { 
        user_id_param: user_id as string 
      });

    if (companyError) {
      console.error('Error getting company:', companyError);
      return res.status(403).json({ error: 'No company associated with user' });
    }

    // Extraire l'ID de la compagnie (assuming the function returns company info)
    // Vous devrez adapter cette partie selon le retour exact de votre fonction
    const companyId = companyData?.[0]?.company_id;
    
    if (!companyId) {
      return res.status(403).json({ error: 'No company found for user' });
    }

    // Récupérer les positions de la compagnie
    const { data: positions, error: positionsError } = await supabase
      .from('openedpositions')
      .select('id, position_name, position_start_date, position_end_date, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (positionsError) {
      console.error('Error fetching positions:', positionsError);
      return res.status(500).json({ error: 'Error fetching positions' });
    }

    return res.status(200).json({
      positions: positions || []
    });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}