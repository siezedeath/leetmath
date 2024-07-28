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

const parseForm = (req: NextApiRequest): Promise<ParsedForm> => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
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

    // Prepare data for AI validation
    const aiRequestData: any = {
      userCode: userCode,
    };

    if (image && image.filepath) {
      const imageBuffer = fs.readFileSync(image.filepath);
      aiRequestData.image = imageBuffer.toString('base64');
    }

    // Send request to AI service (replace with your actual AI service endpoint)
    const aiResponse = await axios.post('https://your-ai-service-endpoint.com/validate', aiRequestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_SERVICE_API_KEY}` // Make sure to set this in your environment variables
      }
    });

    const { success, feedback, optimalSolution } = aiResponse.data;

    res.status(200).json({ success, feedback, optimalSolution });
  } catch (error) {
    console.error('Error in validate-math handler:', error);
    res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
};

export default handler;