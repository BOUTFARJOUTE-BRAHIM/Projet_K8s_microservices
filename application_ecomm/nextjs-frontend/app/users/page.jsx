import UserList from '@/components/UserList';
import { getUsers } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  let users = [];
  let error = null;

  try {
    const response = await getUsers();
    if (response.success) {
      users = response.data;
    } else {
      error = response.message || 'Impossible de charger les utilisateurs';
    }
  } catch (err) {
    error = `Erreur de connexion au User Service : ${err.message}`;
  }

  return (
    <>
      <h1 className="page-title">Gestion des Utilisateurs</h1>
      <p className="page-subtitle">Comptes clients gérés directement par le microservice Django (User Service)</p>
      <UserList initialUsers={users} initialError={error} />
    </>
  );
}
