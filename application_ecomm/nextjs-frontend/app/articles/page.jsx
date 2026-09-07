import ArticleGrid from '@/components/ArticleGrid';
import { getArticles } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function ArticlesPage() {
  let articles = [];
  let error = null;

  try {
    const response = await getArticles();
    if (response.success) {
      articles = response.data;
    } else {
      error = response.message || 'Impossible de charger les articles';
    }
  } catch (err) {
    error = `Erreur de connexion au Article Service : ${err.message}`;
  }

  return (
    <>
      <h1 className="page-title">Articles & Actualités</h1>
      <p className="page-subtitle">Contenus éditoriaux et actualités servis par le microservice Flask (Article Service)</p>
      <ArticleGrid initialArticles={articles} initialError={error} />
    </>
  );
}
