// src/app/api/happiness/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';

// Types
interface PermaScores {
  positive?: number;
  engagement?: number;
  relationships?: number;
  meaning?: number;
  accomplishment?: number;
  work_life_balance?: number;
}

interface SessionData {
  id: string;
  step: number;
  completed: boolean;
  permaScores: PermaScores;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Simulation d'une base de données en mémoire (à remplacer par une vraie DB)
const sessions = new Map<string, SessionData>();

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

    // Récupérer la session
    let session = sessions.get(sessionToken);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session introuvable' },
        { status: 404 }
      );
    }

    if (session.completed) {
      return NextResponse.json(
        { error: 'Évaluation déjà terminée' },
        { status: 400 }
      );
    }

    // Ajouter le message de l'utilisateur
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Analyser la réponse et mettre à jour les scores PERMA
    const currentQuestion = permaQuestions[session.step - 1];
    if (currentQuestion) {
      const score = analyzeResponseAndScore(message, currentQuestion.dimension as keyof PermaScores);
      
      // Correction 1: Utiliser const au lieu de let car updatedPermaScores n'est jamais réassigné
      const updatedPermaScores = {
        ...session.permaScores,
        [currentQuestion.dimension]: score
      };
      
      session.permaScores = updatedPermaScores;
    }

    // Passer à l'étape suivante
    session.step += 1;

    let response: string;
    let completed = false;

    if (session.step <= permaQuestions.length) {
      // Poser la question suivante
      const nextQuestion = permaQuestions[session.step - 1];
      response = nextQuestion.question;
    } else {
      // Évaluation terminée
      completed = true;
      session.completed = true;
      
      const scores = session.permaScores;
      const avgScore = Object.keys(scores).length > 0 
        ? Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
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

    // Ajouter la réponse du bot
    session.messages.push({
      role: 'assistant',
      content: response,
      timestamp: new Date()
    });

    session.updatedAt = new Date();

    // Correction 2: Utiliser const au lieu de let et définir le type explicitement
    const sessionUpdate: {
      response: string;
      step: number;
      completed: boolean;
      scores: PermaScores;
    } = {
      response,
      step: session.step,
      completed,
      scores: session.permaScores
    };

    // Sauvegarder la session mise à jour
    sessions.set(sessionToken, session);

    return NextResponse.json(sessionUpdate);

  } catch (error) {
    console.error('Erreur dans POST /api/happiness/chat:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}