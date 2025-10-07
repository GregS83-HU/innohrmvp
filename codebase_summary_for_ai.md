# Codebase Résumée - innohrmvp
**Généré le:** Sat Oct  4 19:26:42 CEST 2025
**Objectif:** Documentation technique automatisée via IA (version condensée)

---


## `package.json`

```json
{
  "name": "innohrmvp",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "postinstall": "patch-package",
    "lint": "next lint"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-popover": "^1.1.15",
    "@stripe/react-stripe-js": "^4.0.2",
    "@stripe/stripe-js": "^7.9.0",
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "@supabase/auth-helpers-react": "^0.5.0",
    "@supabase/supabase-js": "^2.53.0",
    "@vercel/analytics": "^1.5.0",
    "@vercel/speed-insights": "^1.2.0",
    "canvas": "^3.2.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "file-saver": "^2.0.5",
    "framer-motion": "^12.23.12",
    "jszip": "^3.10.1",
    "lucide-react": "^0.539.0",
    "next": "^15.5.2",
    "openai": "^5.11.0",
    "patch-package": "^8.0.0",
    "pdf-parse": "^1.1.1",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-icons": "^5.5.0",
    "recharts": "^3.1.2",
    "stripe": "^18.5.0",
    "tailwind-merge": "^3.3.1",
    "tesseract.js": "^6.0.1",
    "tesseract.js-node": "^0.1.0",
    "uuid": "^13.0.0",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/pdf-parse": "^1.1.5",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/stripe-v3": "^3.1.33",
    "@types/tesseract.js": "^0.0.2",
    "@types/uuid": "^10.0.0",
    "autoprefixer": "^10.4.21",
    "eslint": "^9",
    "eslint-config-next": "15.4.5",
    "postcss": "^8.5.6",
    "snyk": "^1.1299.0",
    "tailwindcss": "^4.1.13",
    "tw-animate-css": "^1.3.7",
    "typescript": "^5"
  }
}
```

---


## `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": "src",
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", "lib/parsePdfSimple.cjs"],
  "exclude": ["node_modules"]
}
```

---


---

# Statistiques
- **Nombre de fichiers inclus:** 2
- **Taille du fichier:** 4.0K
- **Date d'extraction:** Sat Oct  4 19:26:42 CEST 2025

# Note
Cette version est *condensée* et inclut uniquement :
- Les fichiers de configuration clés
- Les points d'entrée (pages, app, main)
- Les routes API de haut niveau
- Les composants principaux (10 premiers)
- Les services/libs/utilitaires

