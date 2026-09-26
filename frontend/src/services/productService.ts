import api from './api';
import { Product } from '../types';

export interface CreateProductPayload {
  name: string;
  price: number;
  stock_quantity?: number;
  low_stock_threshold?: number;
}

export interface UpdateProductPayload {
  name?: string;
  price?: number;
  stock_quantity?: number;
  low_stock_threshold?: number;
}

export const productService = {
  async getProducts(): Promise<Product[]> {
    const response = await api.get<Product[] | { products: Product[] }>(
      '/products'
    );

    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (
      response.data &&
      Array.isArray(
        (response.data as { products?: Product[] }).products
      )
    ) {
      return (response.data as { products: Product[] }).products;
    }

    return [];
  },

  async getProductById(id: string | number): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  async createProduct(
    payload: CreateProductPayload
  ): Promise<Product> {
    const response = await api.post<Product>('/products', {
      name: payload.name.trim(),
      price: Number(payload.price),
      stock_quantity: Number(payload.stock_quantity ?? 0),
      low_stock_threshold: Number(
        payload.low_stock_threshold ?? 5
      ),
    });

    return response.data;
  },

  async updateProduct(
    id: string | number,
    payload: UpdateProductPayload
  ): Promise<Product> {
    const body: Record<string, unknown> = {};

    if (payload.name !== undefined) {
      body.name = payload.name.trim();
    }

    if (payload.price !== undefined) {
      body.price = Number(payload.price);
    }

    if (payload.stock_quantity !== undefined) {
      body.stock_quantity = Number(payload.stock_quantity);
    }

    if (payload.low_stock_threshold !== undefined) {
      body.low_stock_threshold = Number(
        payload.low_stock_threshold
      );
    }

    const response = await api.patch<Product>(
      `/products/${id}`,
      body
    );

    return response.data;
  },

  async deleteProduct(
    id: string | number
  ): Promise<{ message?: string; success?: boolean }> {
    const response = await api.delete<{
      message?: string;
      success?: boolean;
    }>(`/products/${id}`);

    return response.data;
  },
};

export default productService;