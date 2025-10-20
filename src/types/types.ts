export type OpenAIModel = 'gpt-4o' | 'gpt-3.5-turbo';
// interface SelectedDocument {
//   id: string;
//   name: string;
//   filename: string;
//   date: string;
// }
export interface ChatBody {
  inputCode: string;
  model: string | null;
  chat_id : string | undefined;
  user_id : string | null;
  file_id : string | undefined;
  // full_documents?: SelectedDocument[];
  file_ids : Array<string> | undefined
  token: {
    input: number;
    output: number;
    total: number;
  };
}

export interface IdTokenClaims {
  oid?: string;
  email?: string;
  preferred_username?: string;
  exp: number;
  nbf: number;
  ver: string;
  iss: string;
  sub: string;
  aud: string;
  nonce: string;
  iat: number;
  auth_time: number;
  name: string;
  emails: string[];
  tfp: string;
  roles?: string[];  // JWT roles claim
  [key: string]: any;
}
