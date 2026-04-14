import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

function Profile() {
  const { user: authUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [addingSkill, setAddingSkill] = useState(false);
  const [quizAttempts, setQuizAttempts] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchQuizAttempts();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/profile');
      setProfile(response.data);
      setFormData({
        name: response.data.name || '',
        bio: response.data.bio || '',
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizAttempts = async () => {
    try {
      const response = await axios.get('/quizzes/my-attempts');
      setQuizAttempts(response.data);
    } catch (error) {
      console.error('Failed to fetch quiz attempts:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const response = await axios.patch('/profile', formData);
      setProfile(response.data);
      updateUser(response.data); // Update auth context
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingPicture(true);
    try {
      const formData = new FormData();
      formData.append('picture', file);

      const response = await axios.post('/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProfile(response.data.user);
      updateUser(response.data.user); // Update auth context
      toast.success('Profile picture uploaded successfully');
    } catch (error) {
      console.error('Upload picture error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleRemovePicture = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    try {
      const response = await axios.delete('/profile/picture');
      setProfile(response.data.user);
      updateUser(response.data.user); // Update auth context
      toast.success('Profile picture removed');
    } catch (error) {
      console.error('Remove picture error:', error);
      toast.error(error.response?.data?.message || 'Failed to remove picture');
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) {
      toast.error('Please enter a skill');
      return;
    }

    setAddingSkill(true);
    try {
      const response = await axios.post('/profile/skills', { skill: newSkill.trim() });
      setProfile((prev) => ({ ...prev, skills: response.data.skills }));
      setNewSkill('');
      toast.success('Skill added successfully');
    } catch (error) {
      console.error('Add skill error:', error);
      toast.error(error.response?.data?.message || 'Failed to add skill');
    } finally {
      setAddingSkill(false);
    }
  };

  const handleRemoveSkill = async (skill) => {
    try {
      const response = await axios.delete(`/profile/skills/${encodeURIComponent(skill)}`);
      setProfile((prev) => ({ ...prev, skills: response.data.skills }));
      toast.success('Skill removed');
    } catch (error) {
      console.error('Remove skill error:', error);
      toast.error(error.response?.data?.message || 'Failed to remove skill');
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
        <p className="text-surface-500">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="page-title mb-6">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Picture & Info */}
        <div className="lg:col-span-1">
          <div className="card p-6 animate-fade-in-up">
            {/* Profile Picture */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={profile.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary-500 shadow-md"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center border-4 border-primary-300 shadow-md">
                    <span className="text-4xl font-bold text-white">
                      {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <label
                  htmlFor="picture-upload"
                  className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 cursor-pointer hover:bg-primary-700 transition shadow-md"
                  title="Change picture"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </label>
                <input
                  id="picture-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePictureUpload}
                  className="hidden"
                  disabled={uploadingPicture}
                />
              </div>
              {profile.profilePicture && (
                <button
                  onClick={handleRemovePicture}
                  className="mt-3 text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  Remove Picture
                </button>
              )}
              {uploadingPicture && (
                <p className="mt-2 text-sm text-surface-400 animate-pulse-soft">Uploading...</p>
              )}
            </div>

            {/* User Info */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-surface-900 mb-1">{profile.name}</h2>
              <p className="text-surface-500 mb-3">{profile.email}</p>
              <span
                className={
                  profile.role === 'Admin'
                    ? 'badge-purple'
                    : profile.role === 'Moderator'
                      ? 'badge-blue'
                      : 'badge-green'
                }
              >
                {profile.role}
              </span>
              <div className="mt-5 p-3 bg-primary-50 rounded-xl">
                <p className="text-2xl font-bold text-primary-600">{profile.points || 0}</p>
                <p className="text-sm text-surface-500">Points Earned</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Form */}
          <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
            <h2 className="section-title mb-4">Profile Information</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-surface-700 mb-1.5">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-modern"
                  required
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-surface-700 mb-1.5">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  maxLength={500}
                  className="input-modern resize-none"
                  placeholder="Tell us about yourself..."
                />
                <p className="mt-1 text-sm text-surface-400">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              <button type="submit" disabled={updating} className="btn-primary">
                {updating ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>

          {/* Skills Section */}
          <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="section-title mb-4">Skills</h2>

            {/* Add Skill Form */}
            <form onSubmit={handleAddSkill} className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill..."
                  maxLength={50}
                  className="input-modern flex-1"
                />
                <button
                  type="submit"
                  disabled={addingSkill || !newSkill.trim()}
                  className="btn-accent whitespace-nowrap"
                >
                  {addingSkill ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>

            {/* Skills List */}
            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium transition-colors hover:bg-primary-100"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 text-primary-400 hover:text-red-500 transition-colors"
                      title="Remove skill"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <svg
                  className="w-10 h-10 text-surface-300 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <p className="text-surface-400 text-sm">
                  No skills added yet. Add your first skill above!
                </p>
              </div>
            )}
          </div>

          {/* Quiz Scores Section */}
          <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <h2 className="section-title mb-4">Quiz Scores</h2>
            {quizAttempts.length > 0 ? (
              <div className="space-y-3">
                {quizAttempts.map((attempt) => {
                  const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
                  return (
                    <div
                      key={attempt._id}
                      className="flex items-center justify-between p-4 bg-surface-50 rounded-xl border border-surface-200"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-surface-800">
                          {attempt.quizId?.title || 'Quiz'}
                        </h4>
                        <p className="text-xs text-surface-400 mt-0.5">
                          {attempt.completedAt
                            ? new Date(attempt.completedAt).toLocaleDateString()
                            : ''}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-lg font-bold text-surface-800">
                            {attempt.score}/{attempt.totalQuestions}
                          </p>
                        </div>
                        <span
                          className={`badge-${percentage >= 80 ? 'green' : percentage >= 50 ? 'yellow' : 'red'} text-sm`}
                        >
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <svg
                  className="w-10 h-10 text-surface-300 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-surface-400 text-sm">No quiz attempts yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
