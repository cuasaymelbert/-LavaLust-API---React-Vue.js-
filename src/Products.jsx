import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

const emptyForm = { product_name: "", description: "", price: "", quantity: "" };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadProducts = async () => {
    try {
      const { data } = await api.get("/products");
      setProducts(data.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, form);
      } else {
        await api.post("/products", form);
      }
      setForm(emptyForm);
      setEditingId(null);
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save product");
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({
      product_name: p.product_name,
      description: p.description || "",
      price: p.price,
      quantity: p.quantity,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete product");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {
        refresh_token: localStorage.getItem("refresh_token"),
      });
    } catch {}
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="products-page">
      <div className="header">
        <h2>Product Management System</h2>
       <button className="btn-secondary" onClick={handleLogout}>Logout</button>
      </div>

      {error && <p className="error">{error}</p>}

        <form
        onSubmit={handleSubmit}
        className={`product-form ${editingId ? "editing" : ""}`}
      >
        <h3>{editingId ? "Edit Product" : "Add Product"}</h3>

        <label className="field field-name">
          <span>Product name</span>
          <input
            name="product_name"
            placeholder="e.g. Gaming mouse"
            value={form.product_name}
            onChange={handleChange}
            required
          />
        </label>

        <label className="field field-desc">
          <span>Description</span>
          <input
            name="description"
            placeholder="Short description"
            value={form.description}
            onChange={handleChange}
          />
        </label>

        <label className="field field-price">
          <span>Price</span>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={form.price}
            onChange={handleChange}
            required
          />
        </label>

        <label className="field field-qty">
          <span>Quantity</span>
          <input
            name="quantity"
            type="number"
            min="0"
            placeholder="0"
            value={form.quantity}
            onChange={handleChange}
            required
          />
        </label>

        <div className="form-actions">
          {editingId && (
            <button type="button" className="btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
          )}
          <button type="submit">{editingId ? "Update Product" : "Add Product"}</button>
        </div>
      </form>

           {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan="7">No products yet.</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.product_name}</td>
                    <td>{p.description}</td>
                    <td>{Number(p.price).toFixed(2)}</td>
                    <td>{p.quantity}</td>
                    <td>{p.created_at}</td>
                    <td className="actions">
                        <button className="btn-edit" onClick={() => handleEdit(p)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(p.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}