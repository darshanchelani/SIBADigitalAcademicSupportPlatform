import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useConfirm } from '../components/ConfirmDialog';

function ModerationQueueDetail() {
  const confirm = useConfirm();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState(null);
  const [draft, setDraft] = useState(location.state?.draft || null);
  const [editedDraft, setEditedDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [aiProvider, setAiProvider] = useState('auto');
  const [responseType, setResponseType] = useState('Text');
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [existingResponses, setExistingResponses] = useState([]);

  useEffect(() => {
    fetchQuery();
    fetchTemplates();
    fetchExistingResponses();
    if (draft) {
      setEditedDraft(draft.draft);
    }
  }, [id]);

  const fetchExistingResponses = async () => {
    try {
      const response = await axios.get('/responses', { params: { queryId: id } });
      setExistingResponses(response.data);
    } catch (error) {
      console.error('Failed to load existing responses');
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/moderator/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to load templates');
    }
  };

  const fetchQuery = async () => {
    try {
      const response = await axios.get(`/queries/${id}`);
      setQuery(response.data);
    } catch (error) {
      toast.error('Failed to load query');
      navigate('/dashboard/moderator/queue');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseQuery = async () => {
    const ok = await confirm({
      title: 'Close this query?',
      message: 'The query will be marked as closed. You can reopen it later by changing its status.',
      confirmLabel: 'Close query',
      tone: 'primary',
    });
    if (!ok) return;
    try {
      await axios.post('/moderator/close-query', { queryId: id });
      toast.success('Query closed successfully');
      fetchQuery();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to close query');
    }
  };

  const generateDraft = async () => {
    setGeneratingDraft(true);
    try {
      const payload = { queryId: id };
      if (aiProvider !== 'auto') payload.provider = aiProvider;
      const response = await axios.post('/moderator/generate-draft', payload);
      setDraft(response.data);
      setEditedDraft(response.data.draft);
      toast.success('AI draft generated successfully!');
    } catch (error) {
      console.error('Generate draft error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate draft');
    } finally {
      setGeneratingDraft(false);
    }
  };

  const submitResponse = async () => {
    if (!editedDraft.trim()) {
      toast.error('Response text is required');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post('/moderator/submit-response', {
        queryId: id,
        responseText: editedDraft,
        responseType: responseType,
      });
      toast.success('Response submitted successfully!');
      // Refresh data
      fetchQuery();
      fetchExistingResponses();
      setEditedDraft('');
      setDraft(null);
    } catch (error) {
      toast.error('Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  const discardDraft = () => {
    setDraft(null);
    setEditedDraft('');
    toast.success('Draft discarded');
  };

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
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">Moderation Queue</h1>
        <button
          onClick={() => navigate('/dashboard/moderator/queue')}
          className="btn-secondary inline-flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>Back to Queue</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Query */}
        <div className="card p-6 animate-fade-in-up">
          <h2 className="section-title mb-4">Query</h2>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span
              className={`badge-${query.category === 'MRC' ? 'blue' : query.category === 'PRC' ? 'green' : 'purple'}`}
            >
              {query.category}
            </span>
            <span
              className={`badge-${query.status === 'Closed' ? 'gray' : query.status === 'Resolved' ? 'green' : query.status === 'InProgress' ? 'yellow' : 'blue'}`}
            >
              {query.status}
            </span>
          </div>
          <h3 className="text-xl font-bold text-surface-900 mb-3">{query.title}</h3>
          <p className="text-surface-600 mb-4 whitespace-pre-wrap leading-relaxed">
            {query.content || 'No description provided'}
          </p>

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
                    <span>{attachment.type} - View File</span>
                  </a>
                ))}
              </div>
            </div>
          )}

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

          <div className="text-sm text-surface-400 pt-4 border-t border-surface-100 space-y-0.5">
            <p>
              <span className="font-medium text-surface-600">Posted by:</span> {query.userId?.name}
            </p>
            <p>
              <span className="font-medium text-surface-600">Email:</span> {query.userId?.email}
            </p>
            <p>
              <span className="font-medium text-surface-600">Date:</span>{' '}
              {new Date(query.timestamp).toLocaleString()}
            </p>
          </div>

          {query.status !== 'Closed' && (
            <div className="mt-4 pt-4 border-t border-surface-100">
              <button
                onClick={handleCloseQuery}
                className="btn-secondary w-full inline-flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>Close Query</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: AI Draft & Response Editor */}
        <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="section-title">Response</h2>
              {existingResponses.length > 0 && (
                <p className="text-sm text-surface-400 mt-1">
                  {existingResponses.length} existing response(s)
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {!draft && (
                <>
                  <select
                    value={aiProvider}
                    onChange={(e) => setAiProvider(e.target.value)}
                    className="input-modern text-sm py-2 px-3 rounded-xl"
                    disabled={generatingDraft}
                  >
                    <option value="auto">Auto</option>
                    <option value="openai">OpenAI</option>
                    <option value="gemini">Gemini</option>
                  </select>
                  <button
                    onClick={generateDraft}
                    disabled={generatingDraft}
                    className="btn-primary inline-flex items-center space-x-2"
                  >
                    {generatingDraft ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                        <span>AI Draft</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {draft && (
            <div className="mb-4 p-4 bg-primary-50 rounded-xl border border-primary-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-semibold text-primary-900">AI Draft</p>
                  <p className="text-xs text-primary-600">
                    Confidence: {(draft.confidence * 100).toFixed(0)}% | Model:{' '}
                    {draft.model || 'fallback'}
                  </p>
                </div>
                <button
                  onClick={discardDraft}
                  className="text-red-500 hover:text-red-600 text-sm font-medium"
                >
                  Discard
                </button>
              </div>
              <p className="text-sm text-surface-700 whitespace-pre-wrap">{draft.draft}</p>
            </div>
          )}

          {/* Response Type and Templates */}
          <div className="mb-4 space-y-3">
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
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="w-full px-4 py-2.5 bg-surface-50 text-surface-700 rounded-xl hover:bg-surface-100 transition-colors text-sm font-medium flex items-center justify-center space-x-2 border border-surface-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>{showTemplates ? 'Hide' : 'Show'} Response Templates</span>
              </button>
              {showTemplates && (
                <div className="mt-2 p-3 bg-surface-50 rounded-xl border border-surface-200">
                  <div className="space-y-2">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => {
                          setEditedDraft(template.text);
                          setShowTemplates(false);
                        }}
                        className="w-full text-left px-3 py-2.5 bg-white hover:bg-primary-50 rounded-lg border border-surface-200 transition-colors text-sm"
                      >
                        <div className="font-semibold text-surface-900">{template.name}</div>
                        <div className="text-xs text-surface-400 line-clamp-1 mt-0.5">
                          {template.text}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <textarea
            value={editedDraft}
            onChange={(e) => setEditedDraft(e.target.value)}
            rows={12}
            className="input-modern font-mono text-sm mb-4 resize-none"
            placeholder="Enter your response or edit the AI draft..."
          />

          <div className="flex items-center justify-between">
            <div className="text-sm text-surface-400">{editedDraft.length} characters</div>
            <div className="flex space-x-3">
              <button
                onClick={submitResponse}
                disabled={submitting || !editedDraft.trim()}
                className="btn-accent inline-flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Submit Response</span>
                  </>
                )}
              </button>
              <button
                onClick={() => navigate('/dashboard/moderator/queue')}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Existing Responses */}
          {existingResponses.length > 0 && (
            <div className="mt-6 pt-6 border-t border-surface-100">
              <h3 className="section-title mb-4">Existing Responses</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {existingResponses.map((response) => (
                  <div
                    key={response._id}
                    className="p-3 bg-surface-50 rounded-xl border border-surface-100"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-sm text-surface-900">
                          {response.moderatorId?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-surface-400">
                          {new Date(response.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <span className="badge-blue">{response.responseType}</span>
                    </div>
                    <p className="text-sm text-surface-600 line-clamp-3">{response.responseText}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModerationQueueDetail;
