#!/bin/bash

OUTPUT_FILE="codebase_for_ai.md"
PROJECT_NAME=$(basename $(pwd))

echo "🚀 Extraction de la codebase (version optimisée IA)..."
echo "📁 Projet: $PROJECT_NAME"
echo "📄 Fichier de sortie: $OUTPUT_FILE"

# Initialize output file
cat > $OUTPUT_FILE << EOF
# Codebase - $PROJECT_NAME
**Généré le:** $(date)
**Objectif:** Documentation & analyse technique via IA

---

EOF

# Function to add file with formatting
add_file_content() {
    local filepath=$1
    local filename=$(basename "$filepath")
    local extension="${filename##*.}"
    
    if [ -f "$filepath" ]; then
        echo "   ✅ $filepath"
        cat >> $OUTPUT_FILE << EOF

## \`$filepath\`

\`\`\`$extension
$(cat "$filepath")
\`\`\`

---

EOF
    fi
}

echo "📋 Extraction des fichiers de configuration..."
add_file_content "package.json"
add_file_content "tsconfig.json"
add_file_content "next.config.js"
add_file_content "next.config.mjs"
add_file_content "tailwind.config.js"
add_file_content "tailwind.config.ts"
add_file_content ".env.example"

echo "🔍 Extraction des fichiers sources importants..."

# Collect important source files
find src pages app -type f \( \
    -name "*.ts" -o \
    -name "*.tsx" -o \
    -name "*.js" -o \
    -name "*.jsx" -o \
    -name "*.sql" \
\) \
-not -path "./node_modules/*" \
-not -path "./.next/*" \
-not -path "./dist/*" \
-not -path "./build/*" \
-not -path "./.git/*" \
-not -path "./.vercel/*" \
-not -path "*/__tests__/*" \
-not -path "*/tests/*" \
-not -path "*/mocks/*" \
-not -name "*.spec.ts" \
-not -name "*.test.ts" \
-not -name "*.d.ts" \
| sort | while read file; do
    add_file_content "$file"
done

# Add stats
TOTAL_FILES=$(grep -c "^## \`" $OUTPUT_FILE)
FILE_SIZE=$(du -h $OUTPUT_FILE | cut -f1)

cat >> $OUTPUT_FILE << EOF

---

# Statistiques
- **Nombre de fichiers inclus:** $TOTAL_FILES
- **Taille du fichier:** $FILE_SIZE
- **Date d'extraction:** $(date)

# Notes
Cette extraction inclut :
- Les fichiers de configuration clés
- Les pages et points d'entrée (`pages/`, `app/`)
- Les composants (`src/components/`)
- Les services / libs (`src/lib/`, `src/services/`, `src/utils/`)
- Les routes API (`pages/api/`, `src/api/`)
- Les fichiers SQL (base de données)

Exclus :
- node_modules, .next, dist, build
- tests, mocks, fichiers `.spec.ts`, `.test.ts`
- définitions de types `.d.ts`
- gros fichiers générés

EOF

echo ""
echo "✅ Extraction terminée (optimisée pour IA)!"
echo "📄 Fichier généré: $OUTPUT_FILE"
echo "📊 Statistiques:"
echo "   - Fichiers inclus: $TOTAL_FILES"
echo "   - Taille: $FILE_SIZE"
echo ""
echo "💡 Vous pouvez coller ce fichier directement dans ChatGPT/Claude pour analyse."
