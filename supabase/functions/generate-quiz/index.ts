// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// Declare Deno for TypeScript
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response>) => void
  env: {
    get: (key: string) => string | undefined
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Hello from Functions!")

interface Word {
  word: string
  definition: string
  example_usage: string
  part_of_speech?: string
  category: string
}

interface QuizQuestion {
  word: string
  question: string
  type: 'multiple_choice' | 'fill_blank'
  correctAnswer: string
  options?: string[]
  context?: string
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { words } = await req.json()

    if (!words || !Array.isArray(words) || words.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid words array provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const prompt = `Generate quiz questions for vocabulary learning. For each word, create EXACTLY 3 questions (mix of multiple choice and fill-in-the-blank).

Words to create questions for:
${words.map((word: Word) => `- ${word.word} (${word.part_of_speech || 'noun'}): ${word.definition}. Example: "${word.example_usage}"`).join('\n')}

Requirements:
1. Create EXACTLY 3 questions per word (total: ${words.length * 3} questions)
2. Mix question types: multiple choice and fill-in-the-blank
3. Multiple choice should have 4 options (A, B, C, D) with one correct answer
4. Fill-in-the-blank should use the word in context
5. Make distractors plausible but clearly wrong
6. Use the provided definition and example usage
7. Questions should test understanding, not just memorization
8. The questions should be in random order - shuffle the questions array so that the questions are in a random order
9. DO NOT create part of speech questions
10. All questions should be high quality and engaging, real world examples

IMPORTANT: Return ONLY valid JSON in this exact format, no additional text:
{
  "questions": [
    {
      "word": "word_here",
      "question": "What does [word] mean?",
      "type": "multiple_choice",
      "correctAnswer": "correct_definition",
      "options": ["option_a", "option_b", "option_c", "option_d"]
    },
    {
      "word": "word_here", 
      "question": "Complete the sentence: The [blank] of the situation was clear to everyone.",
      "type": "fill_blank",
      "correctAnswer": "word_here",
      "context": "The [blank] of the situation was clear to everyone."
    },
    {
      "word": "word_here",
      "question": "Which sentence uses [word] correctly?",
      "type": "multiple_choice",
      "correctAnswer": "The correct sentence using the word",
      "options": ["correct_sentence", "wrong_sentence_1", "wrong_sentence_2", "wrong_sentence_3"]
    }
  ]
}`

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a vocabulary quiz generator. Generate engaging quiz questions. ALWAYS return valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000
      })
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('OpenAI API error:', errorText)
      throw new Error(`OpenAI API request failed: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0].message.content

    // Try to parse the content directly first
    let parsedQuestions
    try {
      parsedQuestions = JSON.parse(content)
    } catch (parseError) {
      // If direct parsing fails, try to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          parsedQuestions = JSON.parse(jsonMatch[0])
        } catch (extractError) {
          console.error('Failed to parse extracted JSON:', extractError)
          throw new Error('Invalid response format from AI service')
        }
      } else {
        throw new Error('No valid response received from AI service')
      }
    }

    if (parsedQuestions && parsedQuestions.questions) {
      return new Response(
        JSON.stringify({ questions: parsedQuestions.questions }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      throw new Error('Invalid question format received')
    }

  } catch (error) {
    console.error('Edge function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        questions: [] 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

