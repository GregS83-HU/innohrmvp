#!/bin/bash

OUTPUT_FILE="codebase_for_ai_documentation.md"
PROJECT_NAME=$(basename $(pwd))

echo "🚀 Extraction de la codebase pour documentation IA..."
echo "📁 Projet: $PROJECT_NAME"
echo "📄 Fichier de sortie: $OUTPUT_FILE"

# Initialize output file
cat > $OUTPUT_FILE << EOF
# Codebase Complete - $PROJECT_NAME
**Généré le:** $(date)
**Objectif:** Documentation technique automatisée via IA

---

EOF

# Function to add file with proper formatting
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
add_file_content "next.config.js"
add_file_content "next.config.mjs"
add_file_content "tailwind.config.js"
add_file_content "tailwind.config.ts"
add_file_content "tsconfig.json"
add_file_content ".env.example"

echo "🔍 Recherche des fichiers source..."

# Find all relevant source files (macOS compatible)
find . \( \
    -name "*.ts" -o \
    -name "*.tsx" -o \
    -name "*.js" -o \
    -name "*.jsx" -o \
    -name "*.json" -o \
    -name "*.css" -o \
    -name "*.scss" -o \
    -name "*.sql" \
\) \
-not -path "./node_modules/*" \
-not -path "./.next/*" \
-not -path "./.git/*" \
-not -path "./dist/*" \
-not -path "./build/*" \
-not -path "./.vercel/*" \
-not -name "package-lock.json" \
-not -name "yarn.lock" \
| sort | while read file; do
    add_file_content "$file"
done

# Add file count and stats (macOS compatible)
TOTAL_FILES=$(grep -c "^## \`" $OUTPUT_FILE)
if command -v gdu >/dev/null 2>&1; then
    FILE_SIZE=$(gdu -h $OUTPUT_FILE | cut -f1)
else
    FILE_SIZE=$(du -h $OUTPUT_FILE | cut -f1)
fi

cat >> $OUTPUT_FILE << EOF

---

# Statistiques
- **Nombre total de fichiers:** $TOTAL_FILES
- **Taille du fichier:** $FILE_SIZE
- **Date d'extraction:** $(date)

# Instructions pour l'IA
Ce fichier contient la codebase complète du projet $PROJECT_NAME. 

**Objectifs de documentation:**
1. Analyser l'architecture globale
2. Identifier les composants principaux
3. Documenter les flux de données
4. Créer un guide technique complet
5. Suggérer des améliorations

**Structure attendue de la documentation:**
- Vue d'ensemble de l'architecture
- Guide d'installation et setup
- Documentation des composants
- API et routes
- Base de données (si applicable)
- Déploiement et configuration

EOF

echo ""
echo "✅ Extraction terminée!"
echo "📄 Fichier généré: $OUTPUT_FILE"
echo "📊 Statistiques:"
echo "   - Fichiers traités: $TOTAL_FILES"
echo "   - Taille: $FILE_SIZE"
echo ""
echo "🤖 Vous pouvez maintenant copier ce fichier vers votre IA préférée!"
echo ""
echo "📋 Commandes macOS utiles:"
echo "   • Copier dans le clipboard:     cat $OUTPUT_FILE | pbcopy"
echo "   • Ouvrir avec l'éditeur:       open $OUTPUT_FILE"
echo "   • Voir la taille du fichier:   ls -lh $OUTPUT_FILE"
echo ""
echo "🎯 Pour Claude/ChatGPT, collez simplement le contenu et demandez:"
echo '   "Analysez cette codebase Next.js et créez une documentation technique complète"'#!/bin/bash

OUTPUT_FILE="codebase_for_ai_documentation.md"
PROJECT_NAME=$(basename $(pwd))

echo "🚀 Extraction de la codebase pour documentation IA..."
echo "📁 Projet: $PROJECT_NAME"
echo "📄 Fichier de sortie: $OUTPUT_FILE"

# Initialize output file
cat > $OUTPUT_FILE << EOF
# Codebase Complete - $PROJECT_NAME
**Généré le:** $(date)
**Objectif:** Documentation technique automatisée via IA

---

EOF

# Function to add file with proper formatting
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
add_file_content "next.config.js"
add_file_content "next.config.mjs"
add_file_content "tailwind.config.js"
add_file_content "tailwind.config.ts"
add_file_content "tsconfig.json"
add_file_content ".env.example"

echo "🔍 Recherche des fichiers source..."

# Find all relevant source files
find . \( \
    -name "*.ts" -o \
    -name "*.tsx" -o \
    -name "*.js" -o \
    -name "*.jsx" -o \
    -name "*.json" -o \
    -name "*.css" -o \
    -name "*.scss" -o \
    -name "*.sql" \
\) \
-not -path "./node_modules/*" \
-not -path "./.next/*" \
-not -path "./.git/*" \
-not -path "./dist/*" \
-not -path "./build/*" \
-not -path "./.vercel/*" \
-not -name "package-lock.json" \
-not -name "yarn.lock" \
| sort | while read file; do
    add_file_content "$file"
done

# Add file count and stats
TOTAL_FILES=$(grep -c "^## \`" $OUTPUT_FILE)
FILE_SIZE=$(du -h $OUTPUT_FILE | cut -f1)

cat >> $OUTPUT_FILE << EOF

---

# Statistiques
- **Nombre total de fichiers:** $TOTAL_FILES
- **Taille du fichier:** $FILE_SIZE
- **Date d'extraction:** $(date)

# Instructions pour l'IA
Ce fichier contient la codebase complète du projet $PROJECT_NAME. 

**Objectifs de documentation:**
1. Analyser l'architecture globale
2. Identifier les composants principaux
3. Documenter les flux de données
4. Créer un guide technique complet
5. Suggérer des améliorations

**Structure attendue de la documentation:**
- Vue d'ensemble de l'architecture
- Guide d'installation et setup
- Documentation des composants
- API et routes
- Base de données (si applicable)
- Déploiement et configuration

EOF

echo ""
echo "✅ Extraction terminée!"
echo "📄 Fichier généré: $OUTPUT_FILE"
echo "📊 Statistiques:"
echo "   - Fichiers traités: $TOTAL_FILES"
echo "   - Taille: $FILE_SIZE"
echo ""
echo "🤖 Vous pouvez maintenant copier ce fichier vers votre IA préférée pour générer la documentation!"
echo ""
echo "💡 Commande pour copier dans le clipboard (macOS):"
echo "   cat $OUTPUT_FILE | pbcopy"
echo ""
echo "💡 Commande pour copier dans le clipboard (Linux):"
echo "   cat $OUTPUT_FILE | xclip -selection clipboard"
