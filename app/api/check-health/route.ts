import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Define the expected response from our Python API
type PythonApiResponse = {
  status: 'success' | 'error';
  prediction?: 'Healthy' | 'Not Healthy';
  message?: string;
};

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Get the dog data from the request body
    const dogData = await request.json();

    // 2. Get our secret variables
    const pythonApiUrl = process.env.PYTHON_API_URL;
    const pythonApiKey = process.env.PYTHON_API_KEY;

    if (!pythonApiUrl || !pythonApiKey) {
      console.error('API URL or Key is not set in .env.local');
      return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    }

    // 3. Securely call the Python API from our server
    const response = await fetch(`${pythonApiUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': pythonApiKey, // Add our secret key here
      },
      body: JSON.stringify(dogData),
      cache: 'no-store', // Disable caching for this request
    });

    // 4. Handle Python API errors
    if (!response.ok) {
      let errorMessage = 'Error from prediction service';
      
      // Read the response body as text ONCE
      const errorText = await response.text();
      console.error('Raw error response from Python API:', errorText.substring(0, 500)); // Log the HTML

      try {
        // Now, try to parse the text as JSON
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (err) {
        // This will catch the 'Unexpected token <'
        console.error('Failed to parse error response as JSON. Response was likely HTML.');
        errorMessage = 'Prediction service returned an invalid error page.';
      }

      console.error('Python API Error:', errorMessage);
      return NextResponse.json(
        { message: errorMessage },
        { status: response.status }
      );
    }

    // 5. Send the successful prediction back to the client
    const data: PythonApiResponse = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Internal Next.js API Error:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}