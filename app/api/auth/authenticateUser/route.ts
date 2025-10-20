import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
interface UserAuthRequest {
  localAccountId: string;
  email: string;
  display_name: string;
  roles: string[];
}
interface AuthenticateUserResponse {
  success: boolean;
  message?: string;
  user_id?: string;
  email?: string;
  display_name?: string;
  roles?: string[];
  error?: string;
}
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const userData = await req.json() as UserAuthRequest;
    if (!userData.localAccountId || !userData.email || !userData.display_name || !userData.roles) {
      return NextResponse.json({
        error: 'Missing required fields: localAccountId, email, display_name, roles'
      }, { status: 400 });
    }
    const response = await authenticateUser(userData);
    if (response.success) {
      return NextResponse.json(response, { status: 200 });
    } else {
      return NextResponse.json({
        error: response.error || 'Authentication failed'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error authenticating user:', error);
    return NextResponse.json(
      {
        error: 'Error authenticating user',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
async function authenticateUser(userData: UserAuthRequest): Promise<AuthenticateUserResponse> {
  try {
    const response = await fetch(`${BASE_URL}/auth/authenticate_user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorDetails}`);
    }
    const responseData = await response.json();
    return {
      success: true,
      message: responseData.message,
      user_id: responseData.user_id,
      email: responseData.email,
      display_name: responseData.display_name,
      roles: responseData.roles,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}