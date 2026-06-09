import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../utils/api';

const MemberWorkouts = () => {
  const { user } = useSelector((state) => state.auth);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/workouts/member/${user._id}`);
      setWorkouts(response.data);
    } catch (err) {
      console.error('Failed to fetch workouts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDone = async (workoutId, exerciseId) => {
    try {
      await api.patch(`/workouts/${workoutId}/exercise/${exerciseId}/done`);
      fetchWorkouts();
    } catch (err) {
      alert('Failed to mark exercise as done');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Workouts</h1>

      {workouts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No workouts assigned yet
        </div>
      ) : (
        <div className="space-y-6">
          {workouts.map((workout) => (
            <div key={workout._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">{workout.title}</h2>
                  <p className="text-gray-600">
                    {workout.frequency} • {new Date(workout.startDate).toLocaleDateString()} - {new Date(workout.endDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {workout.frequency}
                </span>
              </div>

              {workout.notes && (
                <p className="text-gray-600 mb-4 italic">{workout.notes}</p>
              )}

              <div className="space-y-4">
                <h3 className="font-semibold">Exercises</h3>
                {workout.exercises.map((exercise, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{exercise.name}</h4>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={exercise.doneStatus}
                          onChange={() => handleMarkDone(workout._id, exercise._id)}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <span className="text-sm">Done</span>
                      </label>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Sets:</span> {exercise.sets}
                      </div>
                      <div>
                        <span className="font-medium">Reps:</span> {exercise.reps}
                      </div>
                      {exercise.duration && (
                        <div>
                          <span className="font-medium">Duration:</span> {exercise.duration}
                        </div>
                      )}
                      {exercise.restTime && (
                        <div>
                          <span className="font-medium">Rest:</span> {exercise.restTime}
                        </div>
                      )}
                    </div>
                    {exercise.videoUrl && (
                      <a
                        href={exercise.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 text-sm mt-2 inline-block"
                      >
                        Watch Demo Video
                      </a>
                    )}
                    {exercise.notes && (
                      <p className="text-gray-600 text-sm mt-2">{exercise.notes}</p>
                    )}
                    {exercise.doneStatus && (
                      <p className="text-green-600 text-sm mt-2">
                        Completed on {new Date(exercise.doneMarkedAt).toLocaleDateString()}
                      </p>
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

export default MemberWorkouts;
