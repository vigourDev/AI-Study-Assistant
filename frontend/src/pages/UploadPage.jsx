import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Upload, FileText, Image, File } from 'lucide-react';
import toast from 'react-hot-toast';

const FILE_TYPES = {
  'application/pdf': { icon: FileText, label: 'PDF' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: File, label: 'DOCX' },
  'text/plain': { icon: FileText, label: 'TXT' },
  'image/png': { icon: Image, label: 'PNG' },
  'image/jpeg': { icon: Image, label: 'JPG' },
  'image/webp': { icon: Image, label: 'WebP' },
};

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) selectFile(droppedFile);
  };

  const selectFile = (f) => {
    const allowed = Object.keys(FILE_TYPES);
    if (!allowed.includes(f.type)) {
      return toast.error('Unsupported file type. Use PDF, DOCX, TXT, or images.');
    }
    if (f.size > 10 * 1024 * 1024) {
      return toast.error('File size must be under 10MB');
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file');
    if (!title.trim()) return toast.error('Please enter a title');

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim());

      const { data } = await api.post('/materials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Material uploaded successfully!');
      navigate(`/materials/${data.material.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const fileInfo = file ? FILE_TYPES[file.type] : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upload Study Material</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Upload PDFs, Word documents, text files, or images
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`card border-2 border-dashed text-center py-12 cursor-pointer transition-colors ${
            dragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
          }`}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <input
            id="fileInput"
            type="file"
            className="hidden"
            accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
            onChange={(e) => e.target.files[0] && selectFile(e.target.files[0])}
          />

          {file ? (
            <div className="space-y-2">
              {fileInfo && <fileInfo.icon className="h-12 w-12 mx-auto text-primary-600" />}
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-gray-500">
                {fileInfo?.label} • {(file.size / 1024).toFixed(1)} KB
              </p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="text-sm text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-12 w-12 mx-auto text-gray-400" />
              <p className="font-medium">Drop your file here or click to browse</p>
              <p className="text-sm text-gray-500">PDF, DOCX, TXT, PNG, JPG, WebP (max 10MB)</p>
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Material Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="e.g., Chapter 5 - Cell Biology"
            required
          />
        </div>

        <button type="submit" disabled={uploading || !file} className="btn-primary w-full">
          {uploading ? 'Uploading & Processing...' : 'Upload Material'}
        </button>
      </form>
    </div>
  );
}
