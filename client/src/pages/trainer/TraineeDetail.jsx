import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../utils/api';

const formatDate = (value) => (
  value ? new Date(value).toLocaleDateString() : 'N/A'
);

const Section = ({ title, children }) => (
  <section className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    {children}
  </section>
);

const TraineeDetail = () => {
  const { memberId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/trainer/trainees/${memberId}`);
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch trainee details:', err);
        setError(err.response?.data?.message || 'Failed to fetch trainee details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [memberId]);

  const latestMeasurement = useMemo(() => data?.measurements?.[0], [data]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error || !data) {
    return <div className="text-red-600 text-center py-8">{error || 'Trainee not found'}</div>;
  }

  const { member, workouts, diets, measurements, progressPhotos, subscription, attendance } = data;

  return (
    <div className="space-y-6">
      <Link to="/trainer/trainees" className="text-blue-600 hover:text-blue-900 font-semibold">
        Back to Trainees
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{member.fullName}</h1>
          <p className="text-gray-500 mt-1">
            {member.memberId} - @{member.user?.username}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/trainer/assign-workout"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Assign Workout
          </Link>
          <Link
            to="/trainer/assign-diet"
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          >
            Assign Diet
          </Link>
        </div>
      </div>

      <Section title="Profile">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Email</span>
            <p className="font-semibold">{member.email}</p>
          </div>
          <div>
            <span className="text-gray-500">Phone</span>
            <p className="font-semibold">{member.phone || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-500">Gender</span>
            <p className="font-semibold capitalize">{member.gender || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-500">Join Date</span>
            <p className="font-semibold">{formatDate(member.joinDate)}</p>
          </div>
        </div>
      </Section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Section title="Latest Measurement">
          {latestMeasurement ? (
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Date:</span> {formatDate(latestMeasurement.date)}</p>
              <p><span className="text-gray-500">Weight:</span> {latestMeasurement.weight || 'N/A'} kg</p>
              <p><span className="text-gray-500">Height:</span> {latestMeasurement.height || 'N/A'} cm</p>
              <p><span className="text-gray-500">BMI:</span> {latestMeasurement.bmi ? latestMeasurement.bmi.toFixed(1) : 'N/A'}</p>
            </div>
          ) : (
            <p className="text-gray-500">No measurements recorded</p>
          )}
        </Section>

        <Section title="Subscription">
          {subscription ? (
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Plan:</span> {subscription.plan?.name || 'N/A'}</p>
              <p><span className="text-gray-500">Status:</span> {subscription.status}</p>
              <p><span className="text-gray-500">Ends:</span> {formatDate(subscription.endDate)}</p>
            </div>
          ) : (
            <p className="text-gray-500">No active subscription found</p>
          )}
        </Section>

        <Section title="Attendance">
          <p className="text-3xl font-bold">{attendance?.length || 0}</p>
          <p className="text-sm text-gray-500">records in recent history</p>
        </Section>
      </div>

      <Section title={`Workout History (${workouts.length})`}>
        {workouts.length === 0 ? (
          <p className="text-gray-500">No workouts assigned</p>
        ) : (
          <div className="space-y-3">
            {workouts.map((workout) => (
              <div key={workout._id} className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{workout.title}</h3>
                    <p className="text-sm text-gray-500">
                      {workout.frequency} - {formatDate(workout.startDate)} - {formatDate(workout.endDate)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">{workout.exercises?.length || 0} exercises</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title={`Diet History (${diets.length})`}>
        {diets.length === 0 ? (
          <p className="text-gray-500">No diets assigned</p>
        ) : (
          <div className="space-y-3">
            {diets.map((diet) => (
              <div key={diet._id} className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{diet.title}</h3>
                    <p className="text-sm text-gray-500">
                      {diet.frequency} - {formatDate(diet.startDate)} - {formatDate(diet.endDate)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">{diet.meals?.length || 0} meals</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title={`Measurement History (${measurements.length})`}>
        {measurements.length === 0 ? (
          <p className="text-gray-500">No measurements recorded</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {measurements.map((measurement) => (
              <div key={measurement._id} className="border border-gray-200 rounded-md p-4 text-sm">
                <p className="font-semibold">{formatDate(measurement.date)}</p>
                <p className="text-gray-600">
                  Weight: {measurement.weight || 'N/A'} kg - BMI: {measurement.bmi ? measurement.bmi.toFixed(1) : 'N/A'}
                </p>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title={`Progress Photos (${progressPhotos.length})`}>
        {progressPhotos.length === 0 ? (
          <p className="text-gray-500">No progress photos uploaded</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {progressPhotos.map((photo) => (
              <div key={photo._id} className="border border-gray-200 rounded-md overflow-hidden">
                <img src={photo.photoUrl} alt="Progress" className="h-40 w-full object-cover" />
                <div className="p-3">
                  <p className="text-sm text-gray-500">{formatDate(photo.uploadedAt)}</p>
                  {photo.caption && <p className="text-sm mt-1">{photo.caption}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
};

export default TraineeDetail;
