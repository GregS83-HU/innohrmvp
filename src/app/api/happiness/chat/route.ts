// src/app/api/happiness/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Types
interface PermaScores {
  positive?: number;
  engagement?: number;
  relationships?: number;
  meaning?: number;
  accomplishment?: number;
  work_life_balance?: number;
}

// Questions structurées basées sur PERMA-W
const permaQuestions = [
  {
    step: 1,
    dimension: 'positive',
    question: "Pour commencer, parlez-moi de votre humeur générale au travail cette semaine. Comment vous sentez-vous quand vous arrivez au bureau le matin ?"
  },
  {
    step: 2,
    dimension: 'positive',
    question: "Quand avez-vous ressenti de la joie ou du plaisir dans votre travail récemment ? Pouvez-vous me donner un exemple concret ?"
  },
  {
    step: 3,
    dimension: 'engagement',
    question: "Décrivez-moi un moment récent où vous étiez complètement absorbé(e) par votre travail, où le temps passait sans que vous vous en rendiez compte."
  },
  {
    step: 4,
    dimension: 'engagement',
    question: "Dans quelle mesure sentez-vous que vos compétences sont bien utilisées dans votre poste actuel ?"
  },
  {
    step: 5,
    dimension: 'relationships',
    question: "Comment décririez-vous la qualité de vos relations avec vos collègues ? Avez-vous des personnes sur qui vous pouvez compter au travail ?"
  },
  {
    step: 6,
    dimension: 'relationships',
    question: "Vous sentez-vous écouté(e) et valorisé(e) par votre manager et votre équipe ?"
  },
  {
    step: 7,
    dimension: 'meaning',
    question: "En quoi votre travail a-t-il du sens pour vous ? Comment contribuez-vous à quelque chose de plus grand ?"
  },
  {
    step: 8,
    dimension: 'meaning',
    question: "Vos valeurs personnelles sont-elles alignées avec celles de votre entreprise ? Pouvez-vous m'expliquer ?"
  },
  {
    step: 9,
    dimension: 'accomplishment',
    question: "De quoi êtes-vous le plus fier/fière dans votre travail ces derniers mois ?"
  },
  {
    step: 10,
    dimension: 'accomplishment',
    question: "Comment percevez-vous votre progression professionnelle ? Atteignez-vous vos objectifs ?"
  },
  {
    step: 11,
    dimension: 'work_life_balance',
    question: "Comment gérez-vous l'équilibre entre votre vie professionnelle et personnelle ? Arrivez-vous à déconnecter ?"
  },
  {
    step: 12,
    dimension: 'work_life_balance',
    question: "Pour terminer, y a-t-il quelque chose que vous aimeriez changer dans votre situation professionnelle actuelle ?"
  }
];

// Fonction pour analyser la réponse et attribuer un score
function analyzeResponseAndScore(response: string, dimension: keyof PermaScores): number {
  const lowerResponse = response.toLowerCase();
  
  // Mots positifs et négatifs par dimension
  const positiveWords: Record<string, string[]> = {
    positive: ['heureux', 'content', 'joyeux', 'motivé', 'enthousiaste', 'satisfait', 'épanoui', 'bien', 'super', 'génial', 'excellent', 'formidable'],
    engagement: ['passionné', 'absorbé', 'concentré', 'impliqué', 'engagé', 'stimulant', 'défi', 'flow', 'compétences', 'talents'],
    relationships: ['soutien', 'équipe', 'collaboration', 'confiance', 'amical', 'respectueux', 'communication', 'écoute', 'bienveillant'],
    meaning: ['sens', 'mission', 'impact', 'contribution', 'valeurs', 'purpose', 'utile', 'important', 'significatif', 'aligné'],
    accomplishment: ['fier', 'réussite', 'objectifs', 'progression', 'succès', 'accomplissement', 'performance', 'résultats'],
    work_life_balance: ['équilibre', 'déconnexion', 'temps', 'famille', 'loisirs', 'repos', 'flexible', 'horaires', 'vacances']
  };

  const negativeWords: Record<string, string[]> = {
    positive: ['triste', 'démotivé', 'ennuyé', 'frustré', 'déprimé', 'malheureux', 'stress', 'anxieux', 'difficile', 'pénible'],
    engagement: ['ennuyeux', 'répétitif', 'monotone', 'désengagé', 'sous-utilisé', 'compétences gâchées', 'routine'],
    relationships: ['conflit', 'isolé', 'incompris', 'tension', 'communication difficile', 'seul', 'ignoré'],
    meaning: ['inutile', 'vide', 'sans sens', 'désalignement', 'contradiction', 'valeurs opposées'],
    accomplishment: ['échec', 'stagnation', 'régression', 'objectifs non atteints', 'déçu', 'insatisfait'],
    work_life_balance: ['débordé', 'épuisé', 'burn-out', 'pas de temps', 'toujours connecté', 'sacrifice']
  };

  let score = 5; // Score neutre de base
  
  // Compter les mots positifs
  const dimPositive = positiveWords[dimension] || [];
  const positiveCount = dimPositive.filter(word => lowerResponse.includes(word)).length;
  
  // Compter les mots négatifs
  const dimNegative = negativeWords[dimension] || [];
  const negativeCount = dimNegative.filter(word => lowerResponse.includes(word)).length;
  
  // Ajuster le score
  score += positiveCount * 1.5;
  score -= negativeCount * 1.5;
  
  // Analyse de la longueur et du sentiment général
  if (response.length > 100) {
    score += 0.5; // Réponse détaillée = engagement
  }
  
  // Assurer que le score reste entre 1 et 10
  return Math.min(10, Math.max(1, Math.round(score * 10) / 10));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;
    
    // Récupérer le token de session
    const sessionToken = request.headers.get('x-session-token');
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Token de session manquant' },
        { status: 401 }
      );
    }

    // Récupérer la session depuis Supabase
    const { data: session, error: sessionError } = await supabase
      .from('happiness_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single();
    
    if (sessionError || !session) {
      console.error('Session retrieval error:', sessionError);
      return NextResponse.json(
        { error: 'Session introuvable' },
        { status: 404 }
      );
    }

    // Vérifier si la session est expirée
    if (session.timeout_at && new Date() > new Date(session.timeout_at)) {
      await supabase
        .from('happiness_sessions')
        .update({ status: 'timeout' })
        .eq('session_token', sessionToken);
      
      return NextResponse.json(
        { error: 'Session expirée' },
        { status: 410 }
      );
    }

    if (session.status === 'completed') {
      return NextResponse.json(
        { error: 'Évaluation déjà terminée' },
        { status: 400 }
      );
    }

    // Récupérer les données actuelles de la session
    let currentStep = session.current_step || 0;
    let permaScores: PermaScores = session.perma_scores || {};
    
    // Analyser la réponse et mettre à jour les scores PERMA
    const currentQuestion = permaQuestions[currentStep - 1];
    if (currentQuestion) {
      const score = analyzeResponseAndScore(message, currentQuestion.dimension as keyof PermaScores);
      
      const updatedPermaScores = {
        ...permaScores,
        [currentQuestion.dimension]: score
      };
      
      permaScores = updatedPermaScores;
    }

    // Passer à l'étape suivante
    currentStep += 1;

    let response: string;
    let completed = false;

    if (currentStep <= permaQuestions.length) {
      // Poser la question suivante
      const nextQuestion = permaQuestions[currentStep - 1];
      response = nextQuestion.question;
    } else {
      // Évaluation terminée
      completed = true;
      
      const avgScore = Object.keys(permaScores).length > 0 
        ? Object.values(permaScores).reduce((a, b) => a + b, 0) / Object.keys(permaScores).length
        : 5;

      response = `Merci beaucoup pour vos réponses sincères ! 🎉

Votre évaluation est maintenant terminée. Voici un bref aperçu de vos résultats :

**Score général de bien-être au travail : ${Math.round(avgScore * 10) / 10}/10**

${avgScore >= 8 
  ? "Félicitations ! Vous semblez très épanoui(e) dans votre travail. Continuez ainsi ! 😊"
  : avgScore >= 6 
  ? "Votre bien-être au travail est globalement positif, avec quelques axes d'amélioration possibles. 🙂"
  : "Il semble y avoir des défis importants dans votre bien-être professionnel. N'hésitez pas à en parler avec votre manager ou RH. 💙"
}

Cette évaluation est anonyme et aidera à améliorer le bien-être général dans l'entreprise.`;
    }

    // Mettre à jour la session dans Supabase
    const updateData = {
      current_step: currentStep,
      perma_scores: permaScores,
      status: completed ? 'completed' : 'in_progress',
      updated_at: new Date().toISOString(),
      ...(completed && { completed_at: new Date().toISOString() })
    };

    const { error: updateError } = await supabase
      .from('happiness_sessions')
      .update(updateData)
      .eq('session_token', sessionToken);

    if (updateError) {
      console.error('Session update error:', updateError);
      return NextResponse.json(
        { error: 'Erreur mise à jour session' },
        { status: 500 }
      );
    }

    // Sauvegarder le message et la réponse dans les messages
    const { error: messageError } = await supabase
      .from('happiness_messages')
      .insert([
        {
          session_id: session.id,
          message_type: 'user',
          content: message,
          created_at: new Date().toISOString()
        },
        {
          session_id: session.id,
          message_type: 'assistant',
          content: response,
          created_at: new Date().toISOString()
        }
      ]);

    if (messageError) {
      console.error('Message save error:', messageError);
      // Ne pas faire échouer la requête pour ça
    }

    const sessionUpdate: {
      response: string;
      step: number;
      completed: boolean;
      scores: PermaScores;
    } = {
      response,
      step: currentStep,
      completed,
      scores: permaScores
    };

    return NextResponse.json(sessionUpdate);

  } catch (error) {
    console.error('Erreur dans POST /api/happiness/chat:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}