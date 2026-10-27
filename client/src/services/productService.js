import { fetchJson, uploadFormData } from './api';

export async function getMyProducts() {
  return await fetchJson('/products/my');
}

export async function createProduct(data) {
  return await fetchJson('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id, data) {
  return await fetchJson(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id) {
  return await fetchJson(`/products/${id}`, {
    method: 'DELETE',
  });
}

export async function toggleProductAvailability(id, isAvailable) {
  return await fetchJson(`/products/${id}/availability`, {
    method: 'PATCH',
    body: JSON.stringify({ isAvailable }),
  });
}

export async function uploadProductImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  return await uploadFormData('/products/upload', formData);
}

export default {
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
  uploadProductImage,
};
