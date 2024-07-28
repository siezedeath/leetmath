import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(500).json({ message: 'Error parsing the files' });
        return;
      }

      const { userCode } = fields;
      const image = files.image;

      try {
        const formData = new FormData();
        formData.append('userCode', userCode as string);
        if (image) {
          const file = fs.readFileSync(image.filepath);
          formData.append('image', file, {
            filename: image.originalFilename,
            contentType: image.mimetype,
          });
        }

        const gpt4Response = await axios.post('YOUR_GPT4_API_ENDPOINT', formData, {
          headers: {
            ...formData.getHeaders(),
          },
        });

        const { success, feedback, optimalSolution } = gpt4Response.data;

        res.status(200).json({ success, feedback, optimalSolution });
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};

export default handler;
