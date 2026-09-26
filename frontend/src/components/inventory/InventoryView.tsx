import React, { useState, useEffect, useCallback } from 'react';
import { productService, CreateProductPayload, UpdateProductPayload } from '../../services/productService';
import { Product } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { EmptyState } from '../common/EmptyState';
import { formatApiError } from '../../services/api';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  AlertTriangle,
  X,
  CheckCircle2,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Add / Edit Modal state
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [minStock, setMinStock] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenAdd = () => {
    setModalMode('add');
    setEditingProduct(null);
    setName('');
    setPrice('');
    setStockQuantity('');
    setMinStock('5');
    setFormError(null);
  };

  const handleOpenEdit = (product: Product) => {
    setModalMode('edit');
    setEditingProduct(product);
    setName(product.name);
    setPrice(String(product.price));
    setStockQuantity(String(product.stock_quantity ?? product.quantity ?? product.stock ?? 0));
    setMinStock(String(product.min_stock ?? product.threshold ?? 5));
    setFormError(null);
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      if (modalMode === 'add') {
        const payload: CreateProductPayload = {
          name: name.trim(),
          price: parseFloat(price),
          stock_quantity: parseInt(stockQuantity, 10) || 0,
          min_stock: minStock ? parseInt(minStock, 10) : undefined,
        };
        const created = await productService.createProduct(payload);
        setProducts((prev) => [created, ...prev]);
      } else if (modalMode === 'edit' && editingProduct) {
        const payload: UpdateProductPayload = {
          name: name.trim(),
          price: parseFloat(price),
          stock_quantity: parseInt(stockQuantity, 10) || 0,
          min_stock: minStock ? parseInt(minStock, 10) : undefined,
        };
        const updated = await productService.updateProduct(editingProduct.id, payload);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...p, ...updated } : p))
        );
      }
      handleCloseModal();
    } catch (err) {
      setFormError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to delete this product from the inventory database?')) {
      return;
    }

    setDeletingId(id);
    try {
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(formatApiError(err));
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const qty = p.stock_quantity ?? p.quantity ?? p.stock ?? 0;
    const threshold = p.min_stock ?? p.threshold ?? 5;
    const isLow = p.is_low_stock ?? p.low_stock ?? qty <= threshold;

    if (onlyLowStock) {
      return matchesSearch && isLow;
    }
    return matchesSearch;
  });

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8 text-[#2D2320]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 pb-4 border-b border-[#EDE4D8]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#9E6056] block mb-1">
            Store Catalog
          </span>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#2D2320]">
            Inventory &amp; Stock Levels
          </h2>
          <p className="text-xs text-[#7A6963] mt-0.5">
            Connected to FastAPI GET /products, POST /products, PATCH /products/:id, DELETE /products/:id
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchProducts}
            className="inline-flex items-center px-3.5 py-2 border border-[#DED4C7] bg-[#FAF7F2] hover:bg-[#F2EAE1] text-[#55433E] text-xs font-medium rounded-full shadow-2xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-[#8C7A74]" />
            Refresh
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center px-4 py-2 bg-[#9E6056] hover:bg-[#864E46] text-[#FAF7F2] text-xs font-semibold rounded-full shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#9E8B85] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search items by product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#DDD0C0] rounded-xl focus:ring-[#9E6056] focus:border-[#9E6056]"
          />
        </div>

        <label className="flex items-center space-x-2 text-xs text-[#55433E] cursor-pointer select-none bg-white border border-[#EDE4D8] px-4 py-2.5 rounded-xl">
          <input
            type="checkbox"
            checked={onlyLowStock}
            onChange={(e) => setOnlyLowStock(e.target.checked)}
            className="rounded text-[#9E6056] focus:ring-[#9E6056] w-3.5 h-3.5"
          />
          <span className="font-medium text-[#2D2320]">Low Stock Alert Only</span>
        </label>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching inventory from database..." />
      ) : error ? (
        <ErrorMessage title="Failed to Load Inventory" message={error} onRetry={fetchProducts} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title={search || onlyLowStock ? 'No Products Found' : 'Inventory Catalog is Empty'}
          description={
            search || onlyLowStock
              ? 'No products match your current search and filter.'
              : 'Add your store products with prices and stock levels.'
          }
          actionLabel="Add First Product"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-white border border-[#EDE4D8] rounded-3xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#EDE4D8] bg-[#FAF7F2] text-[#8C7A74]">
                  <th className="py-3.5 px-5 font-semibold">Product Name</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Price</th>
                  <th className="py-3.5 px-5 font-semibold text-center">Stock Quantity</th>
                  <th className="py-3.5 px-5 font-semibold text-center">Stock Status</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2EAE0]">
                {filteredProducts.map((product) => {
                  const qty = product.stock_quantity ?? product.quantity ?? product.stock ?? 0;
                  const threshold = product.min_stock ?? product.threshold ?? 5;
                  const isLow = product.is_low_stock ?? product.low_stock ?? qty <= threshold;

                  return (
                    <tr key={product.id} className="hover:bg-[#FAF7F2]/80 transition">
                      <td className="py-3.5 px-5 font-medium text-[#2D2320]">
                        <div className="flex items-center space-x-2.5">
                          <Package className="w-4 h-4 text-[#9E8B85] flex-shrink-0" />
                          <span className="font-semibold">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-right font-serif-editorial text-base font-bold text-[#2D2320] whitespace-nowrap">
                        ₹{Number(product.price).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-3.5 px-5 text-center font-semibold text-[#55433E]">
                        {qty} units
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F9ECEB] text-[#8A4F46]">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Low Stock (&le; {threshold})
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EBF1E9] text-[#4B6344]">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-1 text-[#8C7A74] hover:text-[#9E6056] hover:bg-[#F3ECE6] rounded-full transition"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            className="p-1 text-[#8C7A74] hover:text-[#8A4F46] hover:bg-[#F9ECEB] rounded-full disabled:opacity-50 transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-[#2D2320]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-lg border border-[#EDE4D8]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE4D8] mb-4">
              <h3 className="font-serif-editorial text-2xl font-bold text-[#2D2320]">
                {modalMode === 'add' ? 'Add Inventory Product' : 'Edit Product'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-[#9E8B85] hover:text-[#2D2320] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 bg-[#FBF5F4] border border-[#ECD3CE] text-[#7D3F37] text-xs p-3 rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#55433E] mb-1">
                  Product Name <span className="text-[#9E6056]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fortune Mustard Oil 1L"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl focus:ring-[#9E6056] focus:border-[#9E6056]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#55433E] mb-1">
                  Selling Price (₹) <span className="text-[#9E6056]">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl focus:ring-[#9E6056] focus:border-[#9E6056] font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#55433E] mb-1">
                    Stock Quantity <span className="text-[#9E6056]">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl focus:ring-[#9E6056] focus:border-[#9E6056]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#55433E] mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="5"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl focus:ring-[#9E6056] focus:border-[#9E6056]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-[#DDD0C0] text-[#55433E] rounded-full hover:bg-[#F2EAE0] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#9E6056] hover:bg-[#864E46] text-[#FAF7F2] rounded-full font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Saving to FastAPI...' : modalMode === 'add' ? 'Save Product' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
