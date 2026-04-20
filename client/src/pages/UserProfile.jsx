import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If viewing own profile, redirect to editable profile page
    if (authUser && id === authUser._id) {
      navigate('/dashboard/profile', { replace: true });
      return;
    }
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`/profile/${id}`);
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      toast.error('Failed to load user profile');
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

  if (!profile) {
    return (
      <div className="text-center py-12">
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
            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-surface-500">User not found</p>
        <button onClick={() => navigate(-1)} className="btn-secondary mt-4">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="btn-secondary mb-4 text-sm">
        &larr; Back
      </button>

      <div className="card p-6 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Profile Picture */}
          {profile.profilePicture ? (
            <img
              src={profile.profilePicture}
              alt={profile.name}
              className="w-28 h-28 rounded-full object-cover border border-surface-200 shadow-sm flex-shrink-0"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-primary-100 flex items-center justify-center border border-primary-300 flex-shrink-0">
              <span className="font-serif text-3xl font-semibold text-primary-900">
                {profile.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          )}

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-surface-900">{profile.name}</h1>
            <span className="badge-blue mt-1 inline-block">{profile.role}</span>
            {profile.bio && <p className="text-surface-600 mt-3">{profile.bio}</p>}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-surface-100">
          <div className="text-center p-3 bg-primary-50 rounded-lg">
            <p className="text-2xl font-bold text-primary-600">{profile.points || 0}</p>
            <p className="text-xs text-surface-500 mt-1">Points</p>
          </div>
          {profile.skills?.length > 0 && (
            <div className="text-center p-3 bg-accent-50 rounded-lg">
              <p className="text-2xl font-bold text-accent-600">{profile.skills.length}</p>
              <p className="text-xs text-surface-500 mt-1">Skills</p>
            </div>
          )}
          <div className="text-center p-3 bg-surface-50 rounded-lg">
            <p className="text-sm font-medium text-surface-600">
              Joined {new Date(profile.createdAt).toLocaleDateString()}
            </p>
            <p className="text-xs text-surface-500 mt-1">Member Since</p>
          </div>
        </div>

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <div className="mt-6 pt-6 border-t border-surface-100">
            <h3 className="text-sm font-semibold text-surface-700 mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span key={skill} className="badge-blue">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        {profile.badges?.length > 0 && (
          <div className="mt-6 pt-6 border-t border-surface-100">
            <h3 className="text-sm font-semibold text-surface-700 mb-3">Badges</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.badges.map((badge, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-accent-50 rounded-md border border-accent-200"
                >
                  <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-accent-700"
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
                    <p className="font-semibold text-surface-900 text-sm">{badge.name}</p>
                    {badge.description && (
                      <p className="text-xs text-surface-500">{badge.description}</p>
                    )}
                    <p className="text-xs text-surface-400 mt-0.5">
                      Awarded {new Date(badge.awardedTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quiz Scores */}
        {profile.quizAttempts?.length > 0 && (
          <div className="mt-6 pt-6 border-t border-surface-100">
            <h3 className="text-sm font-semibold text-surface-700 mb-3">Recent Quiz Scores</h3>
            <div className="space-y-2">
              {profile.quizAttempts.map((qa, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-surface-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-surface-800">{qa.quizTitle}</p>
                    {qa.completedAt && (
                      <p className="text-xs text-surface-400">
                        {new Date(qa.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span
                    className={`badge-${qa.totalQuestions && qa.score / qa.totalQuestions >= 0.5 ? 'green' : 'red'}`}
                  >
                    {qa.score}/{qa.totalQuestions}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
