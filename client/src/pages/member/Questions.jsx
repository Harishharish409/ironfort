import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../utils/api';

const MemberQuestions = () => {
  const { user } = useSelector((state) => state.auth);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    category: 'general',
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/questions/me');
      setQuestions(response.data);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/questions', formData);
      setShowForm(false);
      setFormData({ question: '', category: 'general' });
      fetchQuestions();
    } catch (err) {
      alert('Failed to submit question');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Questions</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Ask Question
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Ask a Question</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General</option>
                <option value="diet">Diet</option>
                <option value="workout">Workout</option>
                <option value="equipment">Equipment</option>
                <option value="subscription">Subscription</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
              <textarea
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-2">
              <span
                className={`px-2 py-1 rounded text-xs ${
                  q.status === 'answered'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {q.status}
              </span>
              <span className="text-gray-600 text-sm capitalize">{q.category}</span>
            </div>
            <p className="text-gray-900 font-medium mb-2">{q.question}</p>
            {q.answer && (
              <div className="bg-gray-50 p-4 rounded mt-4">
                <p className="text-gray-600 text-sm mb-1">Answer:</p>
                <p className="text-gray-900">{q.answer}</p>
                {q.answeredBy && (
                  <p className="text-gray-600 text-sm mt-2">
                    Answered by {q.answeredBy.username}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
        {questions.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No questions yet
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberQuestions;
