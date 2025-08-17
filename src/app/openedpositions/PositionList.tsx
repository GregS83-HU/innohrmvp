"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface Position {
  id: number
  position_name: string
  position_description: string
  position_description_detailed: string
  company?: {
    company_logo?: string
    name?: string
    slug?: string
  }
}

interface PositionsListProps {
  initialPositions?: Position[]
  companySlug?: string
}

export default function PositionsList({
  initialPositions = [],
  companySlug,
}: PositionsListProps) {
  const [positions, setPositions] = useState<Position[]>(initialPositions)

  useEffect(() => {
    const fetchPositions = async () => {
      if (companySlug) {
        // ⚡ Mode public : fetch par slug
        const { data, error } = await supabase
          .from("openedpositions")
          .select(
            `
            id,
            position_name,
            position_description,
            position_description_detailed,
            company:company(
              company_logo,
              name,
              slug
            )
          `
          )
          .eq("company.slug", companySlug)

        if (!error && data) {
          setPositions(data as Position[])
        }
      } else {
        // 🔒 Mode privé : récupérer les positions de l’utilisateur connecté
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          const { data, error } = await supabase
            .from("openedpositions")
            .select(
              `
              id,
              position_name,
              position_description,
              position_description_detailed,
              company:company(
                company_logo,
                name,
                slug
              )
            `
            )
            .eq("user_id", session.user.id)

          if (!error && data) {
            setPositions(data as Position[])
          }
        }
      }
    }

    fetchPositions()
  }, [companySlug])

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Available positions</h2>
      <ul>
        {positions.map((p) => (
          <li key={p.id} className="border p-2 mb-2 rounded">
            {p.company?.company_logo && (
              <img
                src={p.company.company_logo}
                alt={`${p.company.name} logo`}
                className="h-8 mb-2"
              />
            )}
            <h3 className="font-semibold">{p.position_name}</h3>
            <p className="text-sm">{p.position_description}</p>
          </li>
        ))}
      </ul>
      {positions.length === 0 && (
        <p className="text-gray-500">Aucune offre disponible.</p>
      )}
    </div>
  )
}
