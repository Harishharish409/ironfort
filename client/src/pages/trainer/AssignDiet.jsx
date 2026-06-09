import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const AssignDiet = () => {
  const navigate = useNavigate();
  const [trainees, setTrainees] = useState([]);
  const [traineesLoading, setTraineesLoading] = useState(true);
  const [formData, setFormData] = useState({
    assignedTo: '',
    title: '',
    frequency: 'daily',
    startDate: '',
    endDate: '',
    notes: '',
    meals: [{ mealTime: 'Breakfast', items: '', calories: '', protein: '', carbs: '', fat: '', notes: '' }],
  });

  useEffect(() => {
    const fetchTrainees = async () => {
      try {
        setTraineesLoading(true);
        const response = await api.get('/trainer/trainees');
        setTrainees(response.data || []);
      } catch (err) {
        console.error('Failed to fetch trainees:', err);
      } finally {
        setTraineesLoading(false);
      }
    };

    fetchTrainees();
  }, []);

  const handleMealChange = (index, field, value) => {
    const updatedMeals = [...formData.meals];
    updatedMeals[index][field] = value;
    setFormData({ ...formData, meals: updatedMeals });
  };

  const addMeal = () => {
    setFormData({
      ...formData,
      meals: [
        ...formData.meals,
        { mealTime: 'Snack', items: '', calories: '', protein: '', carbs: '', fat: '', notes: '' },
      ],
    });
  };

  const removeMeal = (index) => {
    const updatedMeals = formData.meals.filter((_, i) => i !== index);
    setFormData({ ...formData, meals: updatedMeals });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        meals: formData.meals.map((meal) => ({
          ...meal,
          items: meal.items ? meal.items.split(',').map((i) => i.trim()) : [],
          calories: meal.calories ? parseFloat(meal.calories) : undefined,
          protein: meal.protein ? parseFloat(meal.protein) : undefined,
          carbs: meal.carbs ? parseFloat(meal.carbs) : undefined,
          fat: meal.fat ? parseFloat(meal.fat) : undefined,
        })),
      };
      await api.post('/diets', payload);
      alert('Diet assigned successfully');
      navigate('/trainer/dashboard');
    } catch (err) {
      alert('Failed to assign diet');
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Assign Diet</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trainee</label>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select trainee by name / member ID</option>
                {traineesLoading && <option value="">Loading trainees...</option>}
                {!traineesLoading && trainees.map((trainee) => (
                  <option key={trainee._id} value={trainee.memberId}>
                    {trainee.fullName} ({trainee.memberId})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Meals</h3>
              <button
                type="button"
                onClick={addMeal}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Add Meal
              </button>
            </div>

            {formData.meals.map((meal, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Meal {index + 1}</h4>
                  {formData.meals.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMeal(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meal Time</label>
                    <select
                      value={meal.mealTime}
                      onChange={(e) => handleMealChange(index, 'mealTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                      <option value="Snack">Snack</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Food Items (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={meal.items}
                      onChange={(e) => handleMealChange(index, 'items', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
                    <input
                      type="number"
                      value={meal.calories}
                      onChange={(e) => handleMealChange(index, 'calories', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
                    <input
                      type="number"
                      value={meal.protein}
                      onChange={(e) => handleMealChange(index, 'protein', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Carbs (g)</label>
                    <input
                      type="number"
                      value={meal.carbs}
                      onChange={(e) => handleMealChange(index, 'carbs', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fat (g)</label>
                    <input
                      type="number"
                      value={meal.fat}
                      onChange={(e) => handleMealChange(index, 'fat', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meal Notes</label>
                    <textarea
                      value={meal.notes}
                      onChange={(e) => handleMealChange(index, 'notes', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Assign Diet
            </button>
            <button
              type="button"
              onClick={() => navigate('/trainer/dashboard')}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignDiet;
