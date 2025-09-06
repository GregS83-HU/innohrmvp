// src/app/api/happiness/chat/route.ts (version IA complète bienveillante)

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

// Structured questions based on the PERMA-W model
const permaQuestions = [
  {
    step: 1,
    dimension: 'positive',
    question: "Pour commencer, comment décririez-vous votre humeur générale au travail cette semaine ? Comment vous sentez-vous habituellement en arrivant le matin ?"
  },
  {
    step: 2,
    dimension: 'positive', 
    question: "Pouvez-vous me parler d'un moment récent au travail où vous avez ressenti de la joie ou un vrai plaisir ? Partagez-moi un exemple concret."
  },
  {
    step: 3,
    dimension: 'engagement',
    question: "Décrivez-moi une fois récente où vous étiez complètement absorbé(e) par votre travail—où le temps semblait passer très vite."
  },
  {
    step: 4,
    dimension: 'engagement',
    question: "Dans quelle mesure sentez-vous que vos compétences et talents sont bien utilisés dans votre poste actuel ?"
  },
  {
    step: 5,
    dimension: 'relationships',
    question: "Comment décririez-vous la qualité de vos relations avec vos collègues ? Avez-vous le sentiment d'avoir des personnes sur qui compter au travail ?"
  },
  {
    step: 6,
    dimension: 'relationships',
    question: "Vous sentez-vous écouté(e) et valorisé(e) par votre manager et votre équipe ?"
  },
  {
    step: 7,
    dimension: 'meaning',
    question: "De quelles manières votre travail vous semble-t-il avoir du sens ? Comment sentez-vous que vous contribuez à quelque chose de plus grand ?"
  },
  {
    step: 8,
    dimension: 'meaning',
    question: "Vos valeurs personnelles vous semblent-elles alignées avec celles de votre organisation ? Pouvez-vous me donner un exemple ?"
  },
  {
    step: 9,
    dimension: 'accomplishment',
    question: "De quelles réalisations des derniers mois êtes-vous le/la plus fier(ère) ?"
  },
  {
    step: 10,
    dimension: 'accomplishment',
    question: "Comment voyez-vous votre évolution professionnelle ? Avez-vous le sentiment d'atteindre vos objectifs ?"
  },
  {
    step: 11,
    dimension: 'work_life_balance',
    question: "Comment gérez-vous l'équilibre entre votre vie professionnelle et personnelle ? Arrivez-vous à déconnecter et vous ressourcer ?"
  },
  {
    step: 12,
    dimension: 'work_life_balance',
    question: "Enfin, y a-t-il quelque chose que vous aimeriez changer dans votre situation de travail actuelle ?"
  }
];

// Fonction de scoring IA bienveillante
async function analyzeResponseWithAI(response: string, dimension: string, questionText: string): Promise<number> {
  try {
    const prompt = `Tu es un psychologue du travail expérimenté et bienveillant. Analyse cette réponse à une question sur le bien-être professionnel.

DIMENSION ÉVALUÉE: ${dimension}
QUESTION POSÉE: "${questionText}"
RÉPONSE DE L'EMPLOYÉ: "${response}"

Donne un score de 1 à 10 en étant bienveillant mais réaliste selon cette grille:

9-10: Excellent - Très épanoui, positif, proactif dans cette dimension
7-8: Bon - Satisfaisant avec des aspects positifs identifiables 
5-6: Correct - Situation acceptable, quelques défis normaux
3-4: En développement - Défis présents mais pas alarmants
1-2: Difficile - Situation préoccupante nécessitant attention

PRINCIPES BIENVEILLANTS:
- Valorise les efforts et intentions positives exprimés
- Reconnaît que les défis temporaires sont normaux au travail
- L'auto-réflexion et l'honnêteté sont des signes positifs
- Ne pénalise pas la vulnérabilité ou les émotions naturelles
- Considère le contexte professionnel comme perfectible par nature
- Les mots comme "assez bien", "ça va", "correct" méritent 6-7/10
- L'absence de problème majeur = minimum 5-6/10
- Les réponses longues et réfléchies sont valorisées

Réponds uniquement avec un nombre décimal (ex: 6.5):`;

    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2, // Consistance importante pour le scoring
        max_tokens: 50
      }),
    });

    const completion = await aiResponse.json();
    const scoreText = completion.choices?.[0]?.message?.content?.trim() || '6';
    
    // Extraire le score (gérer différents formats de réponse)
    const scoreMatch = scoreText.match(/(\d+\.?\d*)/);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : 6;
    
    // Validation et ajustements bienveillants
    let finalScore = isNaN(score) ? 6 : Math.min(10, Math.max(1, score));
    
    // Ajustement bienveillant : si score trop bas sans raison évidente
    if (finalScore < 4 && response.length > 50 && !response.toLowerCase().includes('terrible') && !response.toLowerCase().includes('horrible')) {
      finalScore = Math.max(4, finalScore);
    }
    
    console.log(`Scoring IA - Dimension: ${dimension}, Réponse: "${response.substring(0, 100)}...", Score: ${finalScore}`);
    
    return finalScore;
    
  } catch (error) {
    console.error('Erreur scoring IA:', error);
    
    // Fallback bienveillant basé sur la longueur et mots-clés basiques
    const lowerResponse = response.toLowerCase();
    const positiveIndicators = ['bien', 'bon', 'content', 'satisfait', 'heureux', 'motivé', 'plaisir', 'équipe', 'objectifs', 'progrès'];
    const negativeIndicators = ['mal', 'terrible', 'horrible', 'déteste', 'impossible', 'jamais', 'aucun'];
    
    let fallbackScore = 6; // Score bienveillant par défaut
    
    // Bonus pour réponse détaillée
    if (response.length > 100) fallbackScore += 0.5;
    if (response.length > 200) fallbackScore += 0.5;
    
    // Ajustements basiques
    const positiveCount = positiveIndicators.filter(word => lowerResponse.includes(word)).length;
    const negativeCount = negativeIndicators.filter(word => lowerResponse.includes(word)).length;
    
    fallbackScore += positiveCount * 0.5;
    fallbackScore -= negativeCount * 0.8;
    
    return Math.min(10, Math.max(3, Math.round(fallbackScore * 2) / 2)); // Scores par 0.5
  }
}

// Nouvelle fonction pour générer des conseils personnalisés
async function generatePersonalizedAdvice(permaScores: PermaScores, sessionId: string): Promise<string[]> {
  try {
    // Récupérer les réponses de l'utilisateur depuis la DB
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('message_text, step_number')
      .eq('session_id', sessionId)
      .eq('is_bot_message', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erreur récupération messages:', error);
    }

    // Identifier les 2-3 domaines les plus faibles
    const sortedScores = Object.entries(permaScores)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 3);

    // Extraire un échantillon de réponses pour le contexte
    const contextResponses = messages && messages.length > 0 
      ? messages.slice(0, 6).map(m => m.message_text).join(' ') 
      : '';

    // Score moyen pour adapter le ton
    const avgScore = Object.values(permaScores).reduce((a, b) => a + b, 0) / Object.keys(permaScores).length;

    const prompt = `Tu es un coach en bien-être au travail expert et bienveillant. 

PROFIL DE L'UTILISATEUR:
- Score moyen: ${avgScore.toFixed(1)}/10
${Object.entries(permaScores).map(([dim, score]) => `- ${dim}: ${score}/10`).join('\n')}

DOMAINES PRIORITAIRES (plus faibles):
${sortedScores.map(([dim, score]) => `- ${dim}: ${score}/10`).join('\n')}

CONTEXTE (extraits réponses): "${contextResponses.substring(0, 400)}..."

MISSION: Crée 3 conseils personnalisés, courts et encourageants (max 4 lignes chacun).

TONE: ${avgScore >= 7 ? 'Encourageant et optimisant' : avgScore >= 5 ? 'Soutenant et constructif' : 'Bienveillant et rassurant'}

RÈGLES:
✅ Ton décontracté et amical
✅ Conseils pratiques et réalisables 
✅ Focus sur les domaines faibles MAIS rester positif
✅ Maximum 4-5 lignes par conseil
✅ Commencer par un emoji approprié
✅ Éviter les termes médicaux/cliniques
✅ Valoriser ce qui fonctionne déjà

FORMAT EXACT:
1. [emoji] [conseil court et actionnable]
2. [emoji] [conseil court et actionnable]
3. [emoji] [conseil court et actionnable]

Réponds UNIQUEMENT avec les 3 conseils numérotés.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8, // Plus de créativité pour les conseils
        max_tokens: 600
      }),
    });

    const completion = await response.json();
    const aiResponse = completion.choices?.[0]?.message?.content ?? '';
    
    // Parser les 3 conseils avec regex plus robuste
    const adviceLines = aiResponse
      .split('\n')
      .filter((line: string) => /^\d+\.\s/.test(line.trim()))
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 3);

    // Si l'IA n'a pas donné 3 conseils, compléter avec des conseils adaptés au score
    while (adviceLines.length < 3) {
      const fallbackAdvice = avgScore >= 7 
        ? "🚀 Continue sur ta lancée ! Partage tes bonnes pratiques avec tes collègues"
        : avgScore >= 5
        ? "💡 Identifie une petite chose que tu peux améliorer cette semaine et lance-toi"
        : "🌱 Rappelle-toi que chaque petit pas compte, tu n'es pas seul(e) dans cette aventure";
      
      adviceLines.push(fallbackAdvice);
    }

    console.log('Conseils générés:', adviceLines);
    return adviceLines;

  } catch (error) {
    console.error('Erreur génération conseils:', error);
    
    // Conseils de fallback adaptés au score moyen si disponible
    const avgScore = Object.values(permaScores).reduce((a, b) => a + b, 0) / Object.keys(permaScores).length;
    
    if (avgScore >= 7) {
      return [
        "🎯 Tu es sur la bonne voie ! Continue à cultiver ce qui te rend heureux au travail",
        "🤝 Pense à partager ton énergie positive avec tes collègues, ça peut faire des merveilles",
        "📈 Profite de cette dynamique pour te fixer un nouveau défi stimulant"
      ];
    } else if (avgScore >= 5) {
      return [
        "🌱 Choisis un aspect de ton travail que tu aimerais améliorer et commence petit",
        "☕ Prends le temps d'échanger avec tes collègues, les relations font souvent la différence",
        "⏸️ Accorde-toi des vraies pauses dans ta journée, ton cerveau a besoin de souffler"
      ];
    } else {
      return [
        "🫂 Rappelle-toi que tu n'es pas seul(e), n'hésite pas à parler de tes difficultés",
        "🎯 Fixe-toi des objectifs très simples pour retrouver confiance progressivement",
        "🌅 Chaque nouveau jour est une occasion de voir les choses différemment"
      ];
    }
  }
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
      console.error('Erreur récupération session:', sessionError);
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier si la session a expiré
    if (session.timeout_at && new Date() > new Date(session.timeout_at)) {
      await supabase
        .from('happiness_sessions')
        .update({ 
          status: 'timeout',
          last_activity: new Date().toISOString()
        })
        .eq('session_token', sessionToken);
      
      return NextResponse.json(
        { error: 'Session expirée' },
        { status: 410 }
      );
    }

    if (session.status === 'completed') {
      return NextResponse.json(
        { error: 'Cette évaluation est déjà terminée' },
        { status: 400 }
      );
    }

    // Récupérer les données actuelles de la session
    let currentStep = session.current_step || 0;
    let permaScores: PermaScores = {};
    
    // Parser les scores existants si disponibles
    if (session.perma_scores) {
      try {
        permaScores = typeof session.perma_scores === 'string' 
          ? JSON.parse(session.perma_scores) 
          : session.perma_scores;
      } catch (e) {
        console.error('Erreur parsing scores existants:', e);
        permaScores = {};
      }
    }
    
    // Analyser la réponse avec l'IA si on n'est pas au premier message
    if (currentStep > 0 && currentStep <= permaQuestions.length) {
      const currentQuestion = permaQuestions[currentStep - 1];
      
      // Utiliser le scoring IA bienveillant
      const score = await analyzeResponseWithAI(
        message, 
        currentQuestion.dimension, 
        currentQuestion.question
      );
      
      permaScores = {
        ...permaScores,
        [currentQuestion.dimension]: score
      };
      
      console.log(`Step ${currentStep}: Score IA pour ${currentQuestion.dimension}: ${score}`);
    }

    // Passer à l'étape suivante
    currentStep += 1;

    let response: string;
    let completed = false;
    let personalizedAdvice: string[] = [];

    if (currentStep <= permaQuestions.length) {
      // Poser la question suivante
      const nextQuestion = permaQuestions[currentStep - 1];
      response = nextQuestion.question;
    } else {
      // Évaluation terminée - Générer les conseils personnalisés
      completed = true;
      
      const avgScore = Object.keys(permaScores).length > 0 
        ? Object.values(permaScores).reduce((a, b) => a + b, 0) / Object.keys(permaScores).length
        : 6;

      // Générer les conseils personnalisés avec l'IA
      personalizedAdvice = await generatePersonalizedAdvice(permaScores, session.id);

      // Message de fin adapté au score (plus bienveillant)
      let endMessage = "";
      if (avgScore >= 8) {
        endMessage = "Fantastique ! Votre bien-être au travail rayonne positivement. Continuez à cultiver cette belle énergie ! 🌟";
      } else if (avgScore >= 6.5) {
        endMessage = "Très bien ! Vous avez de bonnes bases pour votre bien-être professionnel. Quelques ajustements peuvent vous faire briller encore plus ! ✨";
      } else if (avgScore >= 5) {
        endMessage = "Votre situation présente un bon potentiel d'amélioration. Les conseils ci-dessous vous aideront à franchir de nouveaux caps ! 🚀";
      } else {
        endMessage = "Merci pour votre sincérité. Vos réponses montrent des défis réels, mais souvenez-vous que tout peut s'améliorer avec les bonnes stratégies et du soutien. 💙";
      }

      response = `Merci d'avoir partagé vos réflexions sincères ! 🎉

Votre évaluation de bien-être est maintenant terminée. Voici un résumé de vos résultats :

**Score global de bien-être au travail : ${Math.round(avgScore * 10) / 10}/10**

${endMessage}

Cette évaluation est entièrement anonyme et conçue pour soutenir l'amélioration du bien-être général des employés au sein de l'entreprise.`;
    }

    // Préparer les données de mise à jour de la session
    const updateData: {
      current_step: number;
      status: 'completed' | 'in_progress';
      last_activity: string;
      perma_scores?: PermaScores;
      completed_at?: string;
      overall_happiness_score?: number;
    } = {
      current_step: currentStep,
      status: completed ? 'completed' : 'in_progress',
      last_activity: new Date().toISOString()
    };

    // Ajouter les scores
    if (permaScores && Object.keys(permaScores).length > 0) {
      updateData.perma_scores = permaScores;
    }

    // Ajouter l'horodatage de fin
    if (completed) {
      updateData.completed_at = new Date().toISOString();
      
      // Calculer et stocker le score global
      const avgScore = Object.keys(permaScores).length > 0 
        ? Object.values(permaScores).reduce((a, b) => a + b, 0) / Object.keys(permaScores).length
        : 6;
      updateData.overall_happiness_score = Math.round(avgScore);
    }

    console.log('Mise à jour session:', { sessionId: session.id, currentStep, scores: permaScores });

    // Mettre à jour la session
    const { error: updateError } = await supabase
      .from('happiness_sessions')
      .update(updateData)
      .eq('session_token', sessionToken);

    if (updateError) {
      console.error('Erreur mise à jour session:', updateError);
      return NextResponse.json(
        { error: 'Erreur mise à jour session' },
        { status: 500 }
      );
    }

    // Stocker le message dans l'historique
    await supabase
      .from('chat_messages')
      .insert([
        {
          session_id: session.id,
          message_text: message,
          is_bot_message: false,
          step_number: currentStep - 1,
          message_type: currentStep <= permaQuestions.length ? 'question' : 'completion'
        },
        {
          session_id: session.id,
          message_text: response,
          is_bot_message: true,
          step_number: currentStep,
          message_type: completed ? 'completion' : 'question'
        }
      ]);

    const sessionUpdate = {
      response,
      step: currentStep,
      completed,
      scores: permaScores,
      personalizedAdvice: completed ? personalizedAdvice : undefined
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