import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({apiKey: process.env.GROQ_API_KEY});
const prompt = "You must generate exactly three open-ended and engaging questions.Return the output as a single plain string only.Separate each question using exactly '||' with no spaces around it.Do not include numbering, bullet points, quotes, emojis, or any extra text The questions are for an anonymous social messaging platform like Qooh.me.They must be suitable for a diverse audience. Avoid personal, sensitive, political, or controversial topics.Focus on universal, friendly themes that encourage curiosity and positive interaction. Output format example (follow this strictly): What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?";


export async function GET(request:Request){
    try{
        const completions = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages:[
                {
                    role: 'system',
                    content: prompt
                },

                {
                    role: "user",
                    content: "Generate questions",
                },
            ],
            temperature: 0.6
        });

        const text = completions.choices[0]?.message?.content || "";
        const question = text.split("||").map((q)=>q.trim());

        return NextResponse.json({
            message : question,
            success: true
        },{status:200});
    }
    catch(error){
        console.log('Error generate suggestion', error);
        return NextResponse.json({
            message : "Suggestion question not generate yet!!",
            success: false
        },{status:200})
    }
}