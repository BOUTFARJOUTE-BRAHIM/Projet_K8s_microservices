'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createUserAction } from '@/lib/actions';

export default function UserList({ initialUsers, initialError }) {
  const [users, setUsers] = useState(initialUsers || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState(initialError || '');
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();

  // Form fields
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    startTransition(async () => {
      try {
        const response = await createUserAction(formData);
        if (response.success) {
          setSuccessMsg(`Utilisateur "${formData.username}" créé avec succès !`);
          setUsers([response.data, ...users]);
          setFormData({
            username: '',
            email: '',
            first_name: '',
            last_name: '',
            phone: '',
            address: '',
          });
          setShowAddForm(false);
          router.refresh();
        } else {
          const detail = response.errors ? JSON.stringify(response.errors) : response.message;
          setErrorMsg(`Erreur : ${detail || 'Impossible de créer l’utilisateur'}`);
        }
      } catch (err) {
        setErrorMsg(`Erreur réseau : ${err.message}`);
      }
    });
  };

  return (
    <div className="users-page-container">
      <div className="users-header-actions">
        <button
          className="btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '✕ Fermer le formulaire' : '➕ Nouvel utilisateur'}
        </button>
      </div>

      {successMsg && <div className="success-banner">{successMsg}</div>}
      {errorMsg && <div className="error-banner">{errorMsg}</div>}

      {showAddForm && (
        <div className="user-form-card">
          <h2 className="section-subtitle">Créer un nouvel utilisateur (User Service)</h2>
          <form onSubmit={handleCreateUser} className="user-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="username">Nom d'utilisateur *</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  className="form-input"
                  placeholder="Ex: jdupont"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="Ex: jean.dupont@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="first_name">Prénom</label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  className="form-input"
                  placeholder="Ex: Jean"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Nom</label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  className="form-input"
                  placeholder="Ex: Dupont"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Téléphone</label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  className="form-input"
                  placeholder="Ex: +33 6 12 34 56 78"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Adresse</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  className="form-input"
                  placeholder="Ex: 10 Rue de la Paix, Paris"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={isPending}>
                {isPending ? 'Enregistrement...' : "Créer l'utilisateur"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="users-grid">
        {users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">👥</div>
            <p>Aucun utilisateur trouvé dans la base PostgreSQL.</p>
          </div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-card__header">
                <div className="user-card__avatar">
                  {(user.first_name ? user.first_name.charAt(0) : user.username.charAt(0)).toUpperCase()}
                </div>
                <div>
                  <h3 className="user-card__name">
                    {user.first_name || user.last_name
                      ? `${user.first_name} ${user.last_name}`.trim()
                      : user.username}
                  </h3>
                  <span className="user-card__username">@{user.username}</span>
                </div>
              </div>

              <div className="user-card__body">
                <div className="user-card__field">
                  <span className="user-card__label">📧 Email</span>
                  <span className="user-card__value">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="user-card__field">
                    <span className="user-card__label">📱 Téléphone</span>
                    <span className="user-card__value">{user.phone}</span>
                  </div>
                )}
                {user.address && (
                  <div className="user-card__field">
                    <span className="user-card__label">📍 Adresse</span>
                    <span className="user-card__value">{user.address}</span>
                  </div>
                )}
                <div className="user-card__field">
                  <span className="user-card__label">Statut</span>
                  <span className={`badge ${user.is_active ? 'badge--success' : 'badge--danger'}`}>
                    {user.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
