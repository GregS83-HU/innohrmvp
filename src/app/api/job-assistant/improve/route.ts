import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, LevelFormat, BorderStyle
} from 'docx';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const LANGUAGE_NAMES: Record<string, string> = { en: 'English', hu: 'Hungarian', fr: 'French' };

export async function POST(req: NextRequest) {
  try {
    const { cvText, jobDescription, locale = 'en' } = await req.json();
    const language = LANGUAGE_NAMES[locale] || 'English';

    if (!cvText || !jobDescription) {
      return NextResponse.json({ error: 'CV text and job description are required' }, { status: 400 });
    }

    const prompt = `You are an expert CV writer and career coach. Rewrite this CV to better match the job description.
Preserve all real experience, education, and facts — do NOT invent anything.
Improve phrasing, keywords, structure, and emphasis to align with the job requirements.

IMPORTANT: Write ALL text content (section content, key changes, improvement summary) in ${language}. Only JSON keys stay in English.

ORIGINAL CV:
${cvText}

JOB DESCRIPTION:
${jobDescription}

Respond ONLY with a valid JSON object in this exact format:
{
  "improvedCvSections": [
    {
      "heading": "<section title in ${language}>",
      "content": "<full section content in ${language}, using newlines to separate items>"
    }
  ],
  "newScore": <number 0-100>,
  "scoreBreakdown": {
    "skillsMatch": <0-100>,
    "experienceMatch": <0-100>,
    "educationMatch": <0-100>,
    "keywordsMatch": <0-100>,
    "overallPresentation": <0-100>
  },
  "keyChanges": ["<change 1 in ${language}>", "<change 2 in ${language}>", "<change 3 in ${language}>", "<change 4 in ${language}>", "<change 5 in ${language}>"],
  "improvementSummary": "<2-3 sentences in ${language} explaining the main improvements made>"
}`;

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
    });

    const raw = completion.choices[0]?.message?.content || '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);

    // Build DOCX
    const dividerBorder = {
      bottom: { style: BorderStyle.SINGLE, size: 4, color: '4F7942', space: 1 },
    };

    const docChildren: Paragraph[] = [];

    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: 'Optimized CV', bold: true, color: '2D5A27' })],
        alignment: AlignmentType.CENTER,
      })
    );

    docChildren.push(
      new Paragraph({
        children: [new TextRun({ text: 'Tailored for the position', italics: true, color: '666666', size: 20 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );

    for (const section of result.improvedCvSections || []) {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          border: dividerBorder,
          children: [new TextRun({ text: section.heading?.toUpperCase() || '', bold: true, color: '2D5A27' })],
          spacing: { before: 320, after: 160 },
        })
      );

      const lines = (section.content || '').split('\n').filter((l: string) => l.trim());
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*');
        const cleanLine = isBullet ? trimmed.replace(/^[•\-\*]\s*/, '') : trimmed;

        if (isBullet) {
          docChildren.push(
            new Paragraph({
              numbering: { reference: 'cv-bullets', level: 0 },
              children: [new TextRun({ text: cleanLine, size: 22 })],
              spacing: { after: 80 },
            })
          );
        } else {
          docChildren.push(
            new Paragraph({
              children: [new TextRun({ text: cleanLine, size: 22 })],
              spacing: { after: 120 },
            })
          );
        }
      }
    }

    const doc = new Document({
      numbering: {
        config: [
          {
            reference: 'cv-bullets',
            levels: [
              {
                level: 0,
                format: LevelFormat.BULLET,
                text: '•',
                alignment: AlignmentType.LEFT,
                style: { paragraph: { indent: { left: 720, hanging: 360 } } },
              },
            ],
          },
        ],
      },
      styles: {
        default: { document: { run: { font: 'Arial', size: 22 } } },
        paragraphStyles: [
          {
            id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
            run: { size: 36, bold: true, font: 'Arial', color: '2D5A27' },
            paragraph: { spacing: { before: 0, after: 200 }, outlineLevel: 0 },
          },
          {
            id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
            run: { size: 26, bold: true, font: 'Arial', color: '2D5A27' },
            paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 },
          },
        ],
      },
      sections: [
        {
          properties: {
            page: {
              size: { width: 11906, height: 16838 },
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
            },
          },
          children: docChildren,
        },
      ],
    });

    const docBuffer = await Packer.toBuffer(doc);
    const base64 = docBuffer.toString('base64');

    return NextResponse.json({ ...result, docxBase64: base64 });
  } catch (error) {
    console.error('Job assistant improve error:', error);
    return NextResponse.json({ error: 'CV improvement failed. Please try again.' }, { status: 500 });
  }
}