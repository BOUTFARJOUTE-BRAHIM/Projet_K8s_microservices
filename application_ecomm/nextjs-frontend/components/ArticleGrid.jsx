'use client';

export default function ArticleGrid({ initialArticles, initialError }) {
  if (initialError) {
    return (
      <div className="error-message">
        <p>⚠️ {initialError}</p>
      </div>
    );
  }

  if (!initialArticles || initialArticles.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">📰</div>
        <p>Aucun article disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="articles-grid">
      {initialArticles.map((article) => (
        <article key={article.id} className="article-card">
          {article.image && (
            <div className="article-card__img-wrapper">
              <img
                src={article.image}
                alt={article.title}
                className="article-card__img"
                loading="lazy"
              />
              <span className="article-card__category">{article.category}</span>
            </div>
          )}

          <div className="article-card__content">
            {!article.image && (
              <span className="article-card__category article-card__category--inline">
                {article.category}
              </span>
            )}
            <h2 className="article-card__title">{article.title}</h2>
            <p className="article-card__body-text">{article.content}</p>

            <div className="article-card__meta">
              <span className="article-card__author">✍️ {article.author}</span>
              <span className="article-card__date">
                📅{' '}
                {new Date(article.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
