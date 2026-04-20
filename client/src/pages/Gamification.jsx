import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

function Gamification() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [badges, setBadges] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    fetchBadges();
    fetchUserPoints();
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await axios.get('/gamification/certificates');
      setCertificates(response.data);
    } catch (error) {
      // silent — may not have certificates
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('/gamification/leaderboard');
      console.log('Leaderboard data:', response.data);
      setLeaderboard(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Leaderboard error:', error);
      toast.error(error.response?.data?.message || 'Failed to load leaderboard');
      setLeaderboard([]);
    }
  };

  const fetchBadges = async () => {
    try {
      const response = await axios.get('/gamification/badges');
      setBadges(response.data);
    } catch (error) {
      console.error('Failed to load badges');
    }
  };

  const fetchUserPoints = async () => {
    try {
      const response = await axios.get('/gamification/points');
      updateUser({ points: response.data.points });
    } catch (error) {
      console.error('Failed to load points');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="page-title mb-6">Gamification</h1>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card p-5 animate-fade-in-up">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-primary-50 rounded-xl">
              <svg
                className="w-6 h-6 text-primary-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-surface-500">Points</p>
              <p className="text-3xl font-bold text-primary-600">{user?.points || 0}</p>
            </div>
          </div>
        </div>
        <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-primary-50 rounded-xl">
              <svg
                className="w-6 h-6 text-primary-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-surface-500">Badges Earned</p>
              <p className="text-3xl font-bold text-primary-600">{badges.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="card p-5 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="section-title mb-4">Your Badges</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {badges.map((item, index) => (
              <div
                key={index}
                className="border border-accent-200 rounded-xl p-4 text-center bg-accent-50"
              >
                <div className="p-2.5 bg-accent-100 rounded-md w-fit mx-auto mb-2">
                  <svg
                    className="w-6 h-6 text-accent-700"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <p className="font-semibold text-surface-900 text-sm">{item.badge?.name}</p>
                <p className="text-xs text-surface-500 mt-0.5">{item.badge?.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      {certificates.length > 0 && (
        <div className="card p-5 mb-6 animate-fade-in-up" style={{ animationDelay: '0.12s' }}>
          <h2 className="section-title mb-4">Your Certificates</h2>
          <div className="space-y-3">
            {certificates.map((cert) => {
              const shareUrl = `${window.location.origin}/api/gamification/certificate/${cert.certificateId}`;
              return (
                <div key={cert._id} className="border border-primary-200 rounded-xl p-5 bg-primary-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-primary-900">{cert.title}</h3>
                      <p className="text-sm text-surface-600 mt-1">{cert.description}</p>
                      <p className="text-xs text-surface-400 mt-2">
                        Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                        {cert.issuedBy?.name && ` by ${cert.issuedBy.name}`}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4 flex-shrink-0">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(shareUrl);
                          toast.success('Certificate link copied!');
                        }}
                        className="btn-secondary !py-2 !px-3 text-xs"
                        title="Copy shareable link"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Share
                      </button>
                      <button
                        onClick={() => {
                          const text = `🎉 I earned a Certificate of Appreciation from SDASP for responding to ${cert.responseCount}+ student queries!\n\nVerify: ${shareUrl}`;
                          if (navigator.share) {
                            navigator.share({ title: cert.title, text, url: shareUrl });
                          } else {
                            navigator.clipboard.writeText(text);
                            toast.success('Share text copied to clipboard!');
                          }
                        }}
                        className="btn-accent !py-2 !px-3 text-xs"
                        title="Share to platforms"
                      >
                        Share to Platform
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="section-title">Leaderboard</h2>
          <button onClick={fetchLeaderboard} className="btn-secondary text-sm">
            Refresh
          </button>
        </div>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="w-12 h-12 text-surface-300 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-surface-500">No leaderboard entries yet.</p>
            <p className="text-sm text-surface-400 mt-1">
              Users will appear here as they earn points.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-surface-500 uppercase">
                    Rank
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-surface-500 uppercase">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-surface-500 uppercase">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => {
                  const entryUserId = entry.userId?._id?.toString() || entry.userId?.toString();
                  const currentUserId = user?.id?.toString() || user?._id?.toString();
                  const isCurrentUser = entryUserId === currentUserId;
                  return (
                    <tr
                      key={entry._id || index}
                      className={`border-b border-surface-100 transition-colors ${isCurrentUser ? 'bg-primary-50 font-semibold' : 'hover:bg-surface-50'}`}
                    >
                      <td className="py-3 px-4">
                        <span className="font-semibold">
                          {index === 0 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 bg-primary-200 text-primary-900 rounded-full text-sm font-bold">
                              1
                            </span>
                          ) : index === 1 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 bg-surface-200 text-surface-800 rounded-full text-sm font-bold">
                              2
                            </span>
                          ) : index === 2 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 bg-accent-200 text-accent-900 rounded-full text-sm font-bold">
                              3
                            </span>
                          ) : (
                            <span className="text-surface-500">{entry.rank}</span>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-surface-900">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={() =>
                            entry.userId?._id && navigate(`/dashboard/user/${entry.userId._id}`)
                          }
                          onKeyDown={(e) =>
                            e.key === 'Enter' &&
                            entry.userId?._id &&
                            navigate(`/dashboard/user/${entry.userId._id}`)
                          }
                          className="cursor-pointer hover:text-primary-600 hover:underline transition-colors"
                        >
                          {entry.userId?.name || 'Unknown User'}
                        </span>
                        {isCurrentUser && (
                          <span className="ml-2 text-primary-600 text-sm">(You)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-primary-600">{entry.score || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Gamification;
