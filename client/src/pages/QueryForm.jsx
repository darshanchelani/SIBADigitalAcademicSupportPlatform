import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';

function QueryForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('MRC');
  const [files, setFiles] = useState([]);
  const [recording, setRecording] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.filter(
        (file) => file.size <= 50 * 1024 * 1024 // 50MB limit
      );
      if (newFiles.length !== acceptedFiles.length) {
        toast.error('Some files exceed 50MB limit');
      }
      setFiles((prev) => [...prev, ...newFiles]);
    },
    maxSize: 50 * 1024 * 1024,
  });

  const startRecording = async () => {
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
        setRecording(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);

      // Stop after 5 minutes max
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          setIsRecording(false);
        }
      }, 300000);
    } catch (error) {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);

      // Add attachment files
      files.forEach((file) => {
        formData.append('attachments', file);
      });

      // Upload voice recording if exists
      if (recording) {
        formData.append('voiceFile', recording, `recording_${Date.now()}.webm`);
      }

      // Upload video file if exists
      if (videoFile) {
        formData.append('videoFile', videoFile);
      }

      const response = await axios.post('/queries', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Query submitted! It is pending moderator approval.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Post New Query</h1>
        <p className="text-surface-500 text-sm mt-1">
          Describe your question and add supporting media
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-surface-700 mb-1.5">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            className="input-modern"
            placeholder="Enter query title..."
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-surface-700 mb-1.5">
            Category *
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-modern"
          >
            <option value="MRC">MRC</option>
            <option value="PRC">PRC</option>
            <option value="ERC">ERC</option>
          </select>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-surface-700 mb-1.5">
            Description
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="input-modern resize-none"
            placeholder="Describe your query..."
          />
        </div>

        {/* Voice Recording */}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">Voice Recording</label>
          <div className="flex items-center space-x-4">
            {!recording && !isRecording && (
              <button
                type="button"
                onClick={startRecording}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Start Recording</span>
              </button>
            )}
            {isRecording && (
              <button
                type="button"
                onClick={stopRecording}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm font-medium animate-pulse"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <rect x="4" y="4" width="12" height="12" rx="1" />
                </svg>
                <span>Stop Recording</span>
              </button>
            )}
            {recording && !isRecording && (
              <div className="flex items-center space-x-3 bg-surface-50 px-4 py-2.5 rounded-xl border border-surface-200">
                <span className="text-sm text-surface-600">
                  Recording ready ({(recording.size / 1024).toFixed(2)} KB)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setRecording(null);
                    setMediaRecorder(null);
                  }}
                  className="text-red-500 hover:text-red-600 text-sm font-medium"
                >
                  Remove
                </button>
                <audio controls src={URL.createObjectURL(recording)} className="h-8" />
              </div>
            )}
          </div>
        </div>

        {/* Video Upload */}
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
                  toast.error('Video file must be less than 50MB');
                  return;
                }
                setVideoFile(file);
              }
            }}
            className="input-modern text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
          {videoFile && (
            <div className="mt-2 flex items-center space-x-2 text-sm">
              <span className="text-surface-600">
                {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
              <button
                type="button"
                onClick={() => setVideoFile(null)}
                className="text-red-500 hover:text-red-600 font-medium"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">
            Attachments (Max 50MB)
          </label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? 'border-primary-400 bg-primary-50'
                : 'border-surface-200 hover:border-primary-300 hover:bg-surface-50'
            }`}
          >
            <input {...getInputProps()} />
            <svg
              className="w-8 h-8 text-surface-400 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-surface-500 text-sm">
              {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to select'}
            </p>
          </div>
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-surface-50 p-3 rounded-xl border border-surface-100"
                >
                  <span className="text-sm text-surface-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFiles(files.filter((_, i) => i !== index))}
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
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Posting...' : 'Post Query'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default QueryForm;
