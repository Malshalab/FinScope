import apiClient from "./client";

export interface AddTransactionRequest {
  description: string;
  category: string;
  account: string;
  amount: number;
  status: string;
  type: string;
  date: string;
}

// src/api/transaction.ts
export interface TransactionResponse {
  id: number;
  account: string;
  description: string;
  category: string;
  amount: number | string;
  status: string;
  type: string;
  date: string;
  user_id: number;
}

export interface TransactionCategoriesResponse {
  category: string;
  amount: number | string;
  count: number;
  percent: number;
}

export async function addTransaction(data: AddTransactionRequest): Promise<TransactionResponse> {
  const res = await apiClient.post<TransactionResponse>(
    "/transactions/addTransaction",
    data,
  );
  return res.data;
}

export async function getTransactions(): Promise<TransactionResponse[]> {
  const res = await apiClient.get<TransactionResponse[]>("/transactions/");
  return res.data;
}

export async function getTransactionCategories(): Promise<TransactionCategoriesResponse[]> {
  const res = await apiClient.get<TransactionCategoriesResponse[]>("/transactions/category");
  return res.data;
}
