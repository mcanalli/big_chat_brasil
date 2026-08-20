export interface Client {
  id: string;
  name: string;
  document: string;
  type: 'CPF' | 'CNPJ';
  balance: number;
  planType: 'prepaid' | 'postpaid';
  limit: number;
  consumed: number;
}


export interface AuthRequest {
  document: string;
  type: 'CPF' | 'CNPJ';
}

export interface AuthResponse {
  token: string;
  client: Client;
}
