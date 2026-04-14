import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function KBSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const navigate = useNavigate();

  // Initial load
  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch when URL params change
  useEffect(() => {
    const urlQ = searchParams.get('q') || '';
    const urlCategory = searchParams.get('category') || '';
    setSearchQuery(urlQ);
    setCategory(urlCategory);
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params = {};
      const urlQ = searchParams.get('q');
      const urlCategory = searchParams.get('category');

      // Use URL params, fallback to local state
      const searchTerm = urlQ !== null && urlQ !== undefined ? urlQ : searchQuery;
      const searchCategory =
        urlCategory !== null && urlCategory !== undefined ? urlCategory : category;

      if (searchTerm && searchTerm.trim()) {
        params.q = searchTerm.trim();
      }
      if (searchCategory && searchCategory.trim()) {
        params.category = searchCategory.trim();
      }

      console.log('KB Search Params:', params);

      const response = await axios.get('/kb/search', { params });
      console.log('KB Search Response:', response.data);
      setQueries(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('KB search error:', error);
      toast.error(error.response?.data?.message || 'Search failed');
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (searchQuery && searchQuery.trim()) {
      params.q = searchQuery.trim();
    }
    if (category && category.trim()) {
      params.category = category.trim();
    }
    setSearchParams(params);
  };

  // Handle category change immediately
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    const params = {};
    if (searchQuery && searchQuery.trim()) {
      params.q = searchQuery.trim();
    }
    if (newCategory && newCategory.trim()) {
      params.category = newCategory.trim();
    }
    setSearchParams(params);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="page-title mb-6">Knowledge Base</h1>

      <form onSubmit={handleSearch} className="card p-5 mb-6 animate-fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search queries..."
              className="input-modern"
            />
          </div>
          <div>
            <select value={category} onChange={handleCategoryChange} className="input-modern">
              <option value="">All Categories</option>
              <option value="MRC">MRC</option>
              <option value="PRC">PRC</option>
              <option value="ERC">ERC</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex space-x-3">
          <button type="submit" className="btn-primary">
            <svg
              className="w-4 h-4 mr-1.5 inline"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setCategory('');
              setSearchParams({});
            }}
            className="btn-secondary"
          >
            Clear
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent"></div>
        </div>
      ) : queries.length === 0 ? (
        <div className="card p-10 text-center">
          <svg
            className="w-14 h-14 text-surface-300 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-surface-600 mb-1">No results found.</p>
          <p className="text-sm text-surface-400">
            {searchQuery || category
              ? 'Try adjusting your search terms or filters.'
              : 'Start by searching for queries or selecting a category.'}
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-surface-500 mb-4">
            Found <span className="font-semibold text-surface-700">{queries.length}</span> result
            {queries.length !== 1 ? 's' : ''}
          </p>
          <div className="grid gap-4">
            {queries.map((query, index) => (
              <div
                key={query._id}
                className="card p-5 cursor-pointer hover:shadow-card-hover transition-all group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.04}s` }}
                onClick={() => navigate(`/dashboard/query/${query._id}`)}
              >
                <h3 className="text-lg font-semibold text-surface-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {query.title}
                </h3>
                <p className="text-surface-500 mb-3 line-clamp-2 text-sm">
                  {query.content || 'No description'}
                </p>

                {query.responses && query.responses.length > 0 && (
                  <div className="mb-3 inline-flex items-center px-3 py-1.5 bg-accent-50 rounded-lg text-sm text-accent-700 font-medium">
                    <svg
                      className="w-4 h-4 mr-1.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    {query.responses.length} response{query.responses.length > 1 ? 's' : ''}{' '}
                    available
                  </div>
                )}

                <div className="flex items-center flex-wrap gap-2 text-sm">
                  <span
                    className={
                      query.category === 'MRC'
                        ? 'badge-blue'
                        : query.category === 'PRC'
                          ? 'badge-green'
                          : 'badge-purple'
                    }
                  >
                    {query.category}
                  </span>
                  <span className="text-surface-400">by {query.userId?.name || 'Unknown'}</span>
                  <span className="text-surface-300">•</span>
                  <span className="text-surface-400">
                    {query.timestamp ? new Date(query.timestamp).toLocaleDateString() : 'No date'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default KBSearch;
