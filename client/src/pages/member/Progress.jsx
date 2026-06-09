import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../utils/api';

const Progress = () => {
  const { user } = useSelector((state) => state.auth);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadData, setUploadData] = useState({
    photoUrl: '',
    caption: '',
  });

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/progress-photos/me');
      setPhotos(response.data);
    } catch (err) {
      console.error('Failed to fetch progress photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      await api.post('/progress-photos', uploadData);
      alert('Progress photo uploaded successfully');
      setShowUpload(false);
      setUploadData({ photoUrl: '', caption: '' });
      fetchPhotos();
    } catch (err) {
      alert('Failed to upload photo');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Progress Photos</h1>
        <button
          onClick={() => setShowUpload(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Upload Photo
        </button>
      </div>

      {showUpload && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Progress Photo</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
              <input
                type="text"
                value={uploadData.photoUrl}
                onChange={(e) => setUploadData({ ...uploadData, photoUrl: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter photo URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
              <textarea
                value={uploadData.caption}
                onChange={(e) => setUploadData({ ...uploadData, caption: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a caption for your progress photo"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Upload
              </button>
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {photos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No progress photos uploaded yet
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div key={photo._id} className="bg-white rounded-lg shadow overflow-hidden">
              <img
                src={photo.photoUrl}
                alt="Progress"
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <p className="text-gray-600 text-sm">
                  {new Date(photo.uploadedAt).toLocaleDateString()}
                </p>
                {photo.caption && (
                  <p className="text-gray-800 mt-2">{photo.caption}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Progress;
