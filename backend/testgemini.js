require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Found ✅' : 'MISSING ❌');

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Say hello in one word');
    console.log('Gemini response:', result.response.text());
    console.log('✅ Gemini is working!');
  } catch (err) {
    console.error('❌ Gemini error:', err.message);
  }
}

test();