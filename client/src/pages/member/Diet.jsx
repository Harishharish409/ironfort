import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../utils/api';

const MemberDiet = () => {
  const { user } = useSelector((state) => state.auth);
  const [diets, setDiets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiets();
  }, []);

  const fetchDiets = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/diets/member/${user._id}`);
      setDiets(response.data);
    } catch (err) {
      console.error('Failed to fetch diets:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Diet Plans</h1>

      {diets.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No diet plans assigned yet
        </div>
      ) : (
        <div className="space-y-6">
          {diets.map((diet) => (
            <div key={diet._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">{diet.title}</h2>
                  <p className="text-gray-600">
                    {diet.frequency} • {new Date(diet.startDate).toLocaleDateString()} - {new Date(diet.endDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {diet.frequency}
                </span>
              </div>

              {diet.notes && (
                <p className="text-gray-600 mb-4 italic">{diet.notes}</p>
              )}

              <div className="space-y-4">
                <h3 className="font-semibold">Meals</h3>
                {diet.meals.map((meal, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium mb-2">{meal.mealTime}</h4>
                    <div className="mb-2">
                      <span className="font-medium">Food Items:</span>
                      <span className="ml-2">{meal.items?.join(', ') || '-'}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm text-gray-600">
                      {meal.calories && (
                        <div>
                          <span className="font-medium">Calories:</span> {meal.calories}
                        </div>
                      )}
                      {meal.protein && (
                        <div>
                          <span className="font-medium">Protein:</span> {meal.protein}g
                        </div>
                      )}
                      {meal.carbs && (
                        <div>
                          <span className="font-medium">Carbs:</span> {meal.carbs}g
                        </div>
                      )}
                      {meal.fat && (
                        <div>
                          <span className="font-medium">Fat:</span> {meal.fat}g
                        </div>
                      )}
                    </div>
                    {meal.notes && (
                      <p className="text-gray-600 text-sm mt-2">{meal.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberDiet;
