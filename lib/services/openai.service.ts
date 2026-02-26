"use server";

import OpenAI from 'openai';

// Read API key from environment variables to ensure it's not exposed
const apiKey = process.env.OPENAI_API_KEY;

// Create OpenAI client only if API key is available
const openai = apiKey 
  ? new OpenAI({ apiKey })
  : null;

/**
 * Generates a match comment using OpenAI based on match stats and game data
 * 
 * @param matchDetails Object containing match information, player stats, game results
 * @returns Generated comment string or error message
 */
export async function generateMatchComment(matchDetails: {
  players: Array<{ id: number, nickname: string }>,
  games: Array<{ 
    scores: Array<{ playerName: string, score: number }>,
    marks?: Array<{ name: string }>,
    comment?: string | null 
  }>,
  matchStatus: string,
  existingComment?: string | null
}): Promise<string> {
  try {
    // Ensure OpenAI client is available
    if (!openai) {
      throw new Error('OpenAI API key not configured');
    }
    
    // Prepare a structured prompt with match details
    const prompt = `Create a funny and entertaining match summary based on these details:

Players: ${matchDetails.players.map(p => p.nickname).join(', ')}
Match Status: ${matchDetails.matchStatus}

Game Results:
${matchDetails.games.map((game, i) => {
  const scoreText = game.scores
    .map(s => `${s.playerName}: ${s.score}`)
    .join(', ');
  
  const marksText = game.marks?.length 
    ? `Marks: ${game.marks.map(m => m.name).join(', ')}`
    : '';
    
  const commentText = game.comment 
    ? `Comment: ${game.comment}`
    : '';
    
  return `Game ${i+1}: ${scoreText}\n${marksText}\n${commentText}`.trim();
}).join('\n\n')}

${matchDetails.existingComment ? `Previous match notes: ${matchDetails.existingComment}` : ''}

Please write a humorous, engaging 1 sentence match summary that captures the spirit of the competition. Include player names, interesting game moments, and maybe a playful joke about the outcome. Use an entertaining, light-hearted tone. They play without spectators in squash.`;

    // Call OpenAI API with GPT-3.5 Turbo (good balance of performance and cost)
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // More cost-effective than GPT-4 for this simple task
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7, // Some creativity but not too wild
      max_tokens: 150, // Keep response concise
    });
    
    return response.choices[0].message.content?.trim() || "Could not generate a comment.";
  } catch (error) {
    console.error("Error generating match comment:", error);
    return "Unable to generate AI comment at this time.";
  }
}