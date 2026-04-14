import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

function ResponseView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [responseType, setResponseType] = useState('Text');
  const [responseFiles, setResponseFiles] = useState([]);
  const [responseRecording, setResponseRecording] = useState(null);
  const [responseMediaRecorder, setResponseMediaRecorder] = useState(null);
  const [isResponseRecording, setIsResponseRecording] = useState(false);
  const [responseVideo, setResponseVideo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuery();
    fetchResponses();
  }, [id]);

  const fetchQuery = async () => {
    try {
      const response = await axios.get(`/queries/${id}`);
      setQuery(response.data);
    } catch (error) {
      toast.error('Failed to load query');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async () => {
    try {
      const response = await axios.get('/responses', { params: { queryId: id } });
      setResponses(response.data);
    } catch (error) {
      console.error('Failed to load responses');
    }
  };

  const startResponseRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setResponseRecording(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setResponseMediaRecorder(recorder);
      setIsResponseRecording(true);
    } catch (error) {
      toast.error('Microphone access denied');
    }
  };

  const stopResponseRecording = () => {
    if (responseMediaRecorder && responseMediaRecorder.state === 'recording') {
      responseMediaRecorder.stop();
      setIsResponseRecording(false);
    }
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (
      !responseText.trim() &&
      !responseRecording &&
      !responseVideo &&
      responseFiles.length === 0
    ) {
      toast.error('Please enter a response text or add media (voice, video, or attachments)');
      return;
    }

    // Auto-set response type based on media
    let finalResponseType = responseType;
    if (responseVideo) {
      finalResponseType = 'Video';
    } else if (responseRecording) {
      finalResponseType = 'Audio';
    } else if (responseText.trim()) {
      finalResponseType = 'Text';
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('queryId', id);
      formData.append('responseText', responseText.trim() || '');
      formData.append('responseType', finalResponseType);

      // Add voice recording
      if (responseRecording) {
        formData.append('voiceFile', responseRecording, `recording_${Date.now()}.webm`);
      }

      // Add video
      if (responseVideo) {
        formData.append('videoFile', responseVideo);
      }

      // Add attachments
      responseFiles.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await axios.post('/responses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Response posted successfully!');
      setResponseText('');
      setResponseType('Text');
      setResponseFiles([]);
      setResponseRecording(null);
      setResponseVideo(null);
      setShowResponseForm(false);
      fetchResponses();
      fetchQuery(); // Refresh query to update status
    } catch (error) {
      console.error('Submit response error:', error);
      toast.error(error.response?.data?.message || 'Failed to post response');
    } finally {
      setSubmitting(false);
    }
  };

  // Check if user can respond (not their own query, and user is authenticated)
  // Peers and moderators can respond to any query (except their own)
  const queryOwnerId = query?.userId?._id?.toString() || query?.userId?.toString();
  const currentUserId = user?.id?.toString() || user?._id?.toString();
  const canRespond = user && query && queryOwnerId !== currentUserId;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!query) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      {/* Query */}
      <div className="card p-6 mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span
            className={`badge-${query.category === 'MRC' ? 'blue' : query.category === 'PRC' ? 'green' : 'purple'}`}
          >
            {query.category}
          </span>
          <span
            className={`badge-${query.status === 'Resolved' ? 'green' : query.status === 'InProgress' ? 'yellow' : 'gray'}`}
          >
            {query.status}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-surface-900 mb-3">{query.title}</h1>
        <p className="text-surface-600 mb-4 whitespace-pre-wrap leading-relaxed">{query.content}</p>

        {query.voiceFile && (
          <div className="mb-4 p-3 bg-surface-50 rounded-xl border border-surface-100">
            <p className="text-sm font-medium text-surface-700 mb-2">Voice Recording</p>
            <audio controls className="w-full">
              <source src={query.voiceFile} type="audio/webm" />
            </audio>
          </div>
        )}
        {query.videoFile && (
          <div className="mb-4">
            <p className="text-sm font-medium text-surface-700 mb-2">Video</p>
            <video controls className="w-full max-w-2xl rounded-xl">
              <source src={query.videoFile} />
            </video>
          </div>
        )}
        {query.attachments && query.attachments.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-surface-700 mb-2">Attachments</p>
            <div className="space-y-1.5">
              {query.attachments.map((attachment, idx) => (
                <a
                  key={idx}
                  href={attachment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-3 py-2 bg-surface-50 hover:bg-surface-100 rounded-lg text-sm text-surface-700 transition-colors border border-surface-100"
                >
                  <svg
                    className="w-4 h-4 text-surface-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                  <span>{attachment.fileName || attachment.type}</span>
                </a>
              ))}
            </div>
          </div>
        )}
        <div className="text-sm text-surface-400 pt-3 border-t border-surface-100">
          <p>
            Posted by <span className="text-surface-600 font-medium">{query.userId?.name}</span>
          </p>
          <p>{new Date(query.timestamp).toLocaleString()}</p>
        </div>
      </div>

      {/* Responses */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-surface-900">Responses ({responses.length})</h2>
          {canRespond ? (
            <button
              onClick={() => setShowResponseForm(!showResponseForm)}
              className={showResponseForm ? 'btn-secondary' : 'btn-primary'}
            >
              {showResponseForm ? 'Cancel' : '+ Add Response'}
            </button>
          ) : queryOwnerId === currentUserId ? (
            <p className="text-sm text-surface-400">You cannot respond to your own query</p>
          ) : null}
        </div>

        {showResponseForm && canRespond && (
          <div className="card p-6 mb-6 animate-fade-in-up">
            <h3 className="text-base font-semibold text-surface-900 mb-4">Post Your Response</h3>
            <form onSubmit={handleSubmitResponse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Response Type
                </label>
                <select
                  value={responseType}
                  onChange={(e) => setResponseType(e.target.value)}
                  className="input-modern"
                >
                  <option value="Text">Text</option>
                  <option value="Audio">Audio</option>
                  <option value="Video">Video</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Response Text
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={5}
                  className="input-modern resize-none"
                  placeholder="Write your response here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  Voice Recording (Optional)
                </label>
                <div className="flex items-center space-x-3">
                  {!responseRecording && !isResponseRecording && (
                    <button
                      type="button"
                      onClick={startResponseRecording}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Record</span>
                    </button>
                  )}
                  {isResponseRecording && (
                    <button
                      type="button"
                      onClick={stopResponseRecording}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm font-medium animate-pulse"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <rect x="4" y="4" width="12" height="12" rx="1" />
                      </svg>
                      <span>Stop</span>
                    </button>
                  )}
                  {responseRecording && !isResponseRecording && (
                    <div className="flex items-center space-x-2 bg-surface-50 px-3 py-2 rounded-xl border border-surface-200">
                      <audio
                        controls
                        src={URL.createObjectURL(responseRecording)}
                        className="h-8"
                      />
                      <button
                        type="button"
                        onClick={() => setResponseRecording(null)}
                        className="text-red-500 hover:text-red-600 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  Video (Optional)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (file.size > 50 * 1024 * 1024) {
                        toast.error('Video must be < 50MB');
                        return;
                      }
                      setResponseVideo(file);
                    }
                  }}
                  className="input-modern text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                {responseVideo && (
                  <div className="mt-2 flex items-center space-x-2 text-sm">
                    <span className="text-surface-600">{responseVideo.name}</span>
                    <button
                      type="button"
                      onClick={() => setResponseVideo(null)}
                      className="text-red-500 hover:text-red-600 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  Attachments (Optional)
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    setResponseFiles([...responseFiles, ...Array.from(e.target.files)]);
                  }}
                  className="input-modern text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                {responseFiles.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {responseFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-surface-50 p-2.5 rounded-lg border border-surface-100"
                      >
                        <span className="text-sm text-surface-700">{file.name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setResponseFiles(responseFiles.filter((_, i) => i !== index))
                          }
                          className="text-red-500 hover:text-red-600 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-2">
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Posting...' : 'Post Response'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResponseForm(false);
                    setResponseText('');
                    setResponseType('Text');
                    setResponseFiles([]);
                    setResponseRecording(null);
                    setResponseVideo(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {responses.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-surface-500 mb-1">No responses yet.</p>
            {canRespond && <p className="text-sm text-surface-400">Be the first to respond!</p>}
          </div>
        ) : (
          <div className="space-y-4">
            {responses.map((response, i) => {
              const isModerator =
                response.moderatorId?.role === 'Moderator' ||
                response.moderatorId?.role === 'Admin';
              return (
                <div
                  key={response._id}
                  className="card p-5 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-surface-900">
                          {response.moderatorId?.name}
                        </p>
                        {isModerator ? (
                          <span className="badge-purple">Moderator</span>
                        ) : (
                          <span className="badge-green">Peer</span>
                        )}
                      </div>
                      <p className="text-xs text-surface-400 mt-0.5">
                        {new Date(response.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span className="badge-blue">{response.responseType}</span>
                  </div>
                  {response.responseText && (
                    <p className="text-surface-700 mb-3 whitespace-pre-wrap leading-relaxed">
                      {response.responseText}
                    </p>
                  )}

                  {response.voiceFile && (
                    <div className="mt-3 p-3 bg-surface-50 rounded-xl border border-surface-100">
                      <p className="text-sm font-medium text-surface-600 mb-1.5">Voice Recording</p>
                      <audio controls className="w-full">
                        <source src={response.voiceFile} type="audio/webm" />
                      </audio>
                    </div>
                  )}
                  {response.videoFile && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-surface-600 mb-1.5">Video</p>
                      <video controls className="w-full max-w-2xl rounded-xl">
                        <source src={response.videoFile} />
                      </video>
                    </div>
                  )}
                  {response.fileUrl && !response.voiceFile && !response.videoFile && (
                    <div className="mt-3">
                      <a
                        href={response.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View {response.responseType} →
                      </a>
                    </div>
                  )}
                  {response.attachments && response.attachments.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-surface-600 mb-1.5">Attachments</p>
                      <div className="space-y-1">
                        {response.attachments.map((attachment, idx) => (
                          <a
                            key={idx}
                            href={attachment.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 px-3 py-2 bg-surface-50 hover:bg-surface-100 rounded-lg text-sm text-surface-700 transition-colors border border-surface-100"
                          >
                            <svg
                              className="w-4 h-4 text-surface-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                              />
                            </svg>
                            <span>{attachment.fileName || attachment.type}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResponseView;
