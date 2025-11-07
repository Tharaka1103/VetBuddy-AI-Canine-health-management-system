import type { NextApiRequest, NextApiResponse } from 'next';

// Define the expected response from our Python API
type PythonApiResponse = {
  status: 'success' | 'error';
  prediction?: 'Healthy' | 'Not Healthy';
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // 2. Get the dog data from the request body
  const dogData = req.body;

  // 3. Get our secret variables
  const pythonApiUrl = process.env.PYTHON_API_URL;
  const pythonApiKey = process.env.PYTHON_API_KEY;

  if (!pythonApiUrl || !pythonApiKey) {
    console.error('API URL or Key is not set in .env.local');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    // 4. Securely call the Python API from our server
    const response = await fetch(`${pythonApiUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': pythonApiKey, // Add our secret key here
      },
      body: JSON.stringify(dogData),
    });

    // 5. Handle Python API errors
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Python API Error:', errorData);
      return res.status(response.status).json({ message: errorData.message || 'Error from prediction service' });
    }

    // 6. Send the successful prediction back to the client
    const data: PythonApiResponse = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Internal Next.js API Error:', error);
    return res.status(500).json({ message: 'An unexpected error occurred.' });
  }
}