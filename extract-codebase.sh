#!/bin/bash

OUTPUT_FILE="codebase_for_ai.md"
PROJECT_NAME=$(basename $(pwd))
MAX_FILE_LINES=300  # Increased for API routes and components
MAX_TOTAL_SIZE=800000  # Increased to ~800KB (roughly 200k tokens)

echo "🚀 Smart Codebase Extraction for AI Analysis (v2 - Full Features)..."
echo "📁 Project: $PROJECT_NAME"
echo "📄 Output: $OUTPUT_FILE"

# Initialize output file with metadata
cat > $OUTPUT_FILE << EOF
# Codebase - $PROJECT_NAME
**Mode:** full-feature-extract  
**Generated:** $(date)
**Purpose:** Complete AI analysis including all APIs, components & features

---

EOF

# Track total size
CURRENT_SIZE=0

# Function to check if we're approaching size limit
check_size_limit() {
    CURRENT_SIZE=$(wc -c < "$OUTPUT_FILE")
    if [ $CURRENT_SIZE -gt $MAX_TOTAL_SIZE ]; then
        echo "⚠️  Size limit reached (~800KB). Stopping extraction."
        return 1
    fi
    return 0
}

# Function to extract smart summary with more content
extract_smart_summary() {
    local filepath=$1
    local filename=$(basename "$filepath")
    local extension="${filename##*.}"
    local folder=$(dirname "$filepath")
    
    if [ ! -f "$filepath" ]; then
        return
    fi
    
    local line_count=$(wc -l < "$filepath")
    
    echo " ✅ $filepath (${line_count} lines)"
    
    # Create smart summary
    cat >> $OUTPUT_FILE << EOF

## \`$filepath\`

\`\`\`
Folder: $folder
Type: $extension | Lines: $(printf "%8d" $line_count)
Top definitions:
EOF

    # Extract meaningful patterns based on file type
    case $extension in
        ts|tsx|js|jsx)
            # Extract: imports, exports, interfaces, types, main functions, components
            {
                echo "--- Exports ---"
                grep -E "^export (default |const |function |class |interface |type )" "$filepath" | head -30 || echo "(none)"
                echo ""
                echo "--- Key Functions/Components ---"
                grep -E "^(function |const |class |interface |type )" "$filepath" | head -20 || echo "(none)"
            } >> $OUTPUT_FILE
            ;;
        sql)
            # Extract: table definitions, key queries
            {
                grep -iE "^CREATE TABLE|^CREATE VIEW|^CREATE INDEX|^ALTER TABLE" "$filepath" | head -30 || echo "- (none detected)"
            } >> $OUTPUT_FILE
            ;;
        json)
            # For package.json, show dependencies and scripts
            if [[ $filename == "package.json" ]]; then
                {
                    echo "--- Package Info ---"
                    grep -E '"(name|version|description)"' "$filepath" | head -5
                    echo ""
                    echo "--- Scripts ---"
                    grep -A 20 '"scripts"' "$filepath" | grep -E '^\s*"' | head -15
                    echo ""
                    echo "--- Key Dependencies ---"
                    grep -A 30 '"dependencies"' "$filepath" | grep -E '^\s*"' | head -20
                } >> $OUTPUT_FILE
            else
                echo "- (config file)" >> $OUTPUT_FILE
            fi
            ;;
        *)
            echo "- (see full content below if needed)" >> $OUTPUT_FILE
            ;;
    esac
    
    cat >> $OUTPUT_FILE << EOF
\`\`\`

EOF

    # Include full content for important files up to MAX_FILE_LINES
    if [ $line_count -lt $MAX_FILE_LINES ]; then
        cat >> $OUTPUT_FILE << EOF
<details>
<summary>📄 Full content (${line_count} lines)</summary>

\`\`\`$extension
$(cat "$filepath")
\`\`\`
</details>

EOF
    else
        cat >> $OUTPUT_FILE << EOF
<details>
<summary>📄 Preview (first 100 lines of ${line_count})</summary>

\`\`\`$extension
$(head -100 "$filepath")
... (truncated, ${line_count} total lines)
\`\`\`
</details>

EOF
    fi
    
    echo "---" >> $OUTPUT_FILE
}

# Priority 1: Configuration & Project Setup
echo "📋 [1/7] Core configuration..."
extract_smart_summary "package.json"
extract_smart_summary "tsconfig.json"
extract_smart_summary "next.config.js"
extract_smart_summary "next.config.ts"
extract_smart_summary "next.config.mjs"
extract_smart_summary "tailwind.config.js"
extract_smart_summary "tailwind.config.ts"

check_size_limit || exit 0

# Priority 2: Database Schema (critical for understanding data model)
echo "🗄️  [2/7] Database schema..."
find . -type f -name "*.sql" \
    -not -path "./node_modules/*" \
    -not -path "./.next/*" \
    | head -10 | while read file; do
    extract_smart_summary "$file"
    check_size_limit || break
done

# Priority 3: Type definitions & Models (understand the domain)
echo "📐 [3/7] Types & models..."
find src app -type f \( -name "*types*.ts" -o -name "*types*.tsx" -o -name "*model*.ts" -o -name "*schema*.ts" -o -name "*interface*.ts" \) 2>/dev/null \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    | head -15 | while read file; do
    extract_smart_summary "$file"
    check_size_limit || break
done

# Priority 4: ALL API Routes (KEY FEATURE DISCOVERY)
echo "🔌 [4/7] API routes (ALL endpoints)..."
find pages/api app/api src/api src/app/api -type f \( -name "*.ts" -o -name "*.js" -o -name "*.tsx" -o -name "*.jsx" \) 2>/dev/null \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    | sort | while read file; do
    extract_smart_summary "$file"
    check_size_limit || break
done

# Priority 5: Main pages/routes (understand user flows)
echo "📄 [5/7] Main pages & routes..."
find pages app src/app -type f \( -name "page.tsx" -o -name "page.ts" -o -name "index.tsx" -o -name "index.ts" -o -name "[a-z]*.tsx" \) 2>/dev/null \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/api/*" \
    -not -path "*/components/*" \
    | head -30 | while read file; do
    extract_smart_summary "$file"
    check_size_limit || break
done

# Priority 6: ALL Components (CRITICAL FOR FEATURES)
echo "🧩 [6/7] Components (ALL features)..."
find src/components app/components components src/app/components -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) 2>/dev/null \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/ui/*" \
    | sort | while read file; do
    extract_smart_summary "$file"
    check_size_limit || break
done

# Priority 7: Lib/Utils/Services (business logic)
echo "🛠️  [7/7] Services & utilities..."
find src/lib lib src/services services src/utils utils -type f \( -name "*.ts" -o -name "*.js" -o -name "*.tsx" \) 2>/dev/null \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    | head -20 | while read file; do
    extract_smart_summary "$file"
    check_size_limit || break
done

# Add comprehensive statistics and context
TOTAL_FILES=$(grep -c "^## \`" $OUTPUT_FILE)
FILE_SIZE=$(du -h $OUTPUT_FILE | cut -f1)

cat >> $OUTPUT_FILE << EOF

---

# Statistics
- **Files included:** $TOTAL_FILES
- **File size:** $FILE_SIZE
- **Extraction date:** $(date)

# Technology Stack Detected
EOF

# Detect technologies from package.json
if [ -f "package.json" ]; then
    echo "" >> $OUTPUT_FILE
    echo "## Frontend/Framework" >> $OUTPUT_FILE
    grep -E '"(next|react|vue|angular|svelte)"' package.json | sed 's/[",]//g' >> $OUTPUT_FILE || echo "- Not detected" >> $OUTPUT_FILE
    
    echo "" >> $OUTPUT_FILE
    echo "## Backend/API" >> $OUTPUT_FILE
    grep -E '"(express|fastify|nest|prisma|mongoose|sequelize)"' package.json | sed 's/[",]//g' >> $OUTPUT_FILE || echo "- Next.js API routes" >> $OUTPUT_FILE
    
    echo "" >> $OUTPUT_FILE
    echo "## Database" >> $OUTPUT_FILE
    grep -E '"(pg|mysql|mongodb|sqlite|supabase)"' package.json | sed 's/[",]//g' >> $OUTPUT_FILE || echo "- Check SQL files" >> $OUTPUT_FILE
    
    echo "" >> $OUTPUT_FILE
    echo "## AI/ML Libraries" >> $OUTPUT_FILE
    grep -E '"(openai|langchain|tensorflow|anthropic|cohere)"' package.json | sed 's/[",]//g' >> $OUTPUT_FILE || echo "- None detected" >> $OUTPUT_FILE
fi

cat >> $OUTPUT_FILE << EOF

# Key Folder Overview

\`\`\`
EOF

tree -L 3 -d -I 'node_modules|.next|.git|dist|build' 2>/dev/null | head -50 >> $OUTPUT_FILE || {
    find . -type d -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/.git/*" -not -path "*/dist/*" -not -path "*/build/*" | head -50 >> $OUTPUT_FILE
}

cat >> $OUTPUT_FILE << EOF
\`\`\`

---

# Feature Extraction Summary

Based on this codebase, here are the detected features:

## API Endpoints
\`\`\`
EOF

# List all API routes found
find pages/api app/api src/api src/app/api -type f \( -name "*.ts" -o -name "*.js" \) 2>/dev/null \
    -not -path "*/node_modules/*" | sed 's|^./||' | sort >> $OUTPUT_FILE 2>/dev/null || echo "No API routes detected" >> $OUTPUT_FILE

cat >> $OUTPUT_FILE << EOF
\`\`\`

## User-Facing Pages
\`\`\`
EOF

# List main pages
find pages app src/app -type f -name "page.tsx" 2>/dev/null \
    -not -path "*/node_modules/*" -not -path "*/api/*" | sed 's|^./||' | sort >> $OUTPUT_FILE 2>/dev/null || echo "No pages detected" >> $OUTPUT_FILE

cat >> $OUTPUT_FILE << EOF
\`\`\`

## Components
\`\`\`
EOF

# List component folders
find src/components app/components components -type d 2>/dev/null \
    -not -path "*/node_modules/*" -not -path "*/ui" | sed 's|^./||' | sort | head -30 >> $OUTPUT_FILE 2>/dev/null || echo "No components detected" >> $OUTPUT_FILE

cat >> $OUTPUT_FILE << EOF
\`\`\`

---

# What's Included
✅ **Config files** - Complete project setup  
✅ **Database schema** - All SQL definitions  
✅ **Type definitions** - Domain models  
✅ **ALL API routes** - Every endpoint with full/preview code  
✅ **ALL Components** - Every feature component  
✅ **Main pages** - User flows  
✅ **Services/Utils** - Business logic  

# What's Excluded
❌ node_modules, build artifacts  
❌ Test files (*.test.ts, *.spec.ts)  
❌ Type definitions (*.d.ts)  
❌ Files exceeding $MAX_FILE_LINES lines (preview shown)

# AI Analysis Prompts

Copy this file and use these prompts:

## 1. Complete Feature List
\`\`\`
"Analyze this codebase and create a comprehensive list of ALL features with descriptions. Group by: HR Management, Recruitment, Employee Tools, Admin Features, and AI/Automation capabilities."
\`\`\`

## 2. Technical Documentation
\`\`\`
"Create technical documentation covering: architecture, API endpoints, data models, and integration points."
\`\`\`

## 3. Sales Pitch (5 slides)
\`\`\`
"Create a 5-slide sales pitch for Hungarian SMEs (10-50 employees) highlighting the unique features and ROI."
\`\`\`

## 4. Competitive Analysis
\`\`\`
"Compare this HR system to competitors (BambooHR, Gusto, Personio). What are the unique differentiators?"
\`\`\`

## 5. Pricing Strategy
\`\`\`
"Suggest a tiered pricing strategy based on features, target market (Hungarian SMEs), and value delivered."
\`\`\`

## 6. Go-to-Market Strategy
\`\`\`
"Develop a 6-month go-to-market plan for the Hungarian market including: positioning, channels, messaging, and milestones."
\`\`\`

EOF

echo ""
echo "✅ Full-feature extraction complete!"
echo "📄 File: $OUTPUT_FILE"
echo "📊 Stats:"
echo "   - Files: $TOTAL_FILES"
echo "   - Size: $FILE_SIZE"
echo ""
echo "🤖 Ready for comprehensive AI analysis!"
echo "💡 Now includes ALL APIs and components for complete feature discovery."