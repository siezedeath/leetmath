import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import axios from 'axios';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface ParsedForm {
  fields: formidable.Fields;
  files: formidable.Files;
}

type MessageContent = string | { type: 'text' | 'image_url', text?: string, image_url?: { url: string } }[];

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: MessageContent;
}

const parseForm = (req: NextApiRequest): Promise<ParsedForm> => {
  return new Promise((resolve, reject) => {
    const form = formidable();
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { fields, files } = await parseForm(req);

    const userCode = Array.isArray(fields.userCode)
      ? fields.userCode[0]
      : fields.userCode || '';

    // Use type assertion and type guard for the image file
    const imageFile = files.image as formidable.File | formidable.File[] | undefined;
    const image = imageFile && !Array.isArray(imageFile) ? imageFile : undefined;

    // Prepare messages for GPT-4 Vision
    const messages: Message[] = [
      { role: 'system', content: 'You are a helpful assistant that validates mathematical solutions and provides feedback. If an image is provided, analyze it in context of the solution.' },
      { role: 'user', content: `Please validate the following mathematical solution and provide feedback:\n\n${userCode}` }
    ];

    // If there's an image, add it to the messages
    if (image && image.filepath) {
      const imageBuffer = fs.readFileSync(image.filepath);
      const base64Image = imageBuffer.toString('base64');
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: "Here's an image related to the solution:" },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
        ]
      });
    }

    // Send request to GPT-4 Vision
    const gpt4Response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4-vision-preview',
      messages: messages,
      max_tokens: 2000
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GPT4_API_KEY}`
      }
    });

    // Extract response from GPT-4
    const gpt4Message = gpt4Response.data.choices[0].message.content;

    // Prepare a follow-up message to get the optimal solution
    const followUpMessages: Message[] = [
      ...messages,
      { role: 'assistant', content: gpt4Message },
      { role: 'user', content: 'Can you also provide the optimal solution for this problem?' }
    ];

    // Send follow-up request to GPT-4 Vision
    const followUpResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4-vision-preview',
      messages: followUpMessages,
      max_tokens: 1000
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GPT4_API_KEY}`
      }
    });

    // Process GPT-4 Vision response
    const followUpMessage = followUpResponse.data.choices[0].message.content;

    // Determine success and feedback
    const success = gpt4Message.toLowerCase().includes('correct') || gpt4Message.toLowerCase().includes('well done');
    const feedback = gpt4Message;
    const optimalSolution = followUpMessage;

    res.status(200).json({ success, feedback, optimalSolution });
  } catch (error) {
    console.error('Error in validate-math handler:', error);
    res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};

export default handler;
