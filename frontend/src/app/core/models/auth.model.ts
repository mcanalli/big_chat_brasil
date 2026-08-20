export interface Client {
  id: string;
  name: string;
  document: string;
  type: 'CPF' | 'CNPJ';
  balance: number | string;
  planType: 'prepaid' | 'postpaid';
  limit: number | string;
  consumed: number | string;
}


export interface AuthRequest {
  documentId: string;
  documentType: 'CPF' | 'CNPJ';
}

export interface AuthResponse {
  token: string;
  client: Client;
}
