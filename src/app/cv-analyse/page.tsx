// src/app/cv-analyse/page.tsx
import React from "react";

interface CVAnalysePageProps {
  searchParams?: Record<string, string>; // Typage simple pour les query params
}

const fetchSomeData = async () => {
  // Exemple de récupération de données asynchrone
  return { message: "Données chargées" };
};

export default async function Page({ searchParams }: CVAnalysePageProps) {
  // Si tu as besoin de faire des appels API, tu peux le faire ici
  const data = await fetchSomeData();

  return (
    <div className="cv-analyse-page">
      <h1>Analyse CV</h1>
      {searchParams && (
        <div>
          <h2>Paramètres de recherche :</h2>
          <pre>{JSON.stringify(searchParams, null, 2)}</pre>
        </div>
      )}
      <div>
        <h2>Données récupérées :</h2>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}
