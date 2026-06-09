import { useState, useEffect } from 'react';
import api from '../../utils/api';

const AdminQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, [filter]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = filter ? `?status=${filter}` : '';
      const response = await api.get(`/questions${params}`);
      setQuestions(response.data);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (questionId) => {
    const answer = prompt('Enter your answer:');
    if (!answer) return;

    try {
      await api.patch(`/questions/${questionId}/answer`, { answer });
      fetchQuestions();
    } catch (err) {
      alert('Failed to answer question');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Questions</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="answered">Answered</option>
        </select>
      </div>

      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-gray-600 text-sm">
                  {q.askedBy?.username} ({q.askedBy?.role})
                </span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-gray-600 text-sm capitalize">{q.category}</span>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  q.status === 'answered'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {q.status}
              </span>
            </div>
            <p className="text-gray-900 font-medium mb-4">{q.question}</p>
            {q.answer ? (
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-gray-600 text-sm mb-1">Answer:</p>
                <p className="text-gray-900">{q.answer}</p>
              </div>
            ) : (
              <button
                onClick={() => handleAnswer(q._id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Answer
              </button>
            )}
          </div>
        ))}
        {questions.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No questions found
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQuestions;
