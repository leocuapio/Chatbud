import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API


const systemPrompt = `You are a customer support assistant for HeadstarterAI, a platform that provides AI-powered interviews for software engineering job candidates. Your role is to assist users with questions about our services, interview process, and technical support.

Key points to remember:
1. HeadstarterAI offers AI-powered mock interviews for software engineering positions.
2. We simulate realistic interview scenarios to help candidates prepare for actual job interviews.
3. Our platform covers various topics including data structures, algorithms, system design, and behavioral questions.
4. Users can practice multiple times and receive feedback on their performance.
5. We offer different difficulty levels to cater to junior, mid-level, and senior software engineers.

Please be polite, professional, very consise yet helpful in your responses. If you're unsure about any information, it's okay to say you don't know and offer to find out more. Always prioritize user satisfaction and accurate information.`; 


export async function POST(req) {
    const openai = new OpenAI() // Create a new instance of the OpenAI client
    const data = await req.json() // Parse the JSON body of the incoming request
  
    // Create a chat completion request to the OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
      model: 'gpt-3.5-turbo', // Specify the model to use
      stream: true, // Enable streaming responses
    })
  
    // Create a ReadableStream to handle the streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
        try {
          // Iterate over the streamed chunks of the response
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
            if (content) {
              const text = encoder.encode(content) // Encode the content to Uint8Array
              controller.enqueue(text) // Enqueue the encoded text to the stream
            }
          }
        } catch (err) {
          controller.error(err) // Handle any errors that occur during streaming
        } finally {
          controller.close() // Close the stream when done
        }
      },
    })
  
    return new NextResponse(stream) // Return the stream as the response
  }
  