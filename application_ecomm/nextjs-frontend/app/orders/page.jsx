import { getOrders } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  let orders = [];
  let error = null;

  try {
    const response = await getOrders();
    if (response.success) {
      orders = response.data;
    } else {
      error = 'Impossible de charger les commandes';
    }
  } catch (err) {
    error = `Erreur de connexion au Order Service : ${err.message}`;
  }

  return (
    <>
      <h1 className="page-title">Mes Commandes</h1>
      <p className="page-subtitle">Historique récupéré en direct depuis le Order Service</p>

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
      )}

      {!error && orders.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__icon">📋</div>
          <p>Aucune commande pour le moment</p>
        </div>
      )}

      {!error && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-card__header">
                <span className="order-card__id">Commande #{order.id}</span>
                <span className="order-card__status">{order.status}</span>
              </div>
              <p className="order-card__date">
                {new Date(order.createdAt).toLocaleString('fr-FR')}
              </p>
              <div className="order-card__items">
                {order.items.map((item) => (
                  <div className="order-card__item-row" key={item.productId}>
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>{(item.price * item.quantity).toFixed(2)} €</span>
                  </div>
                ))}
              </div>
              <div className="order-card__footer">
                <span>Total</span>
                <span className="order-card__total">{order.total.toFixed(2)} €</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
