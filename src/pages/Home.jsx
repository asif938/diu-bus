import React from 'react';
import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const BACKEND = "http://localhost:5000";

const fetchBuses = async () => {
  const res = await axios.get(`${BACKEND}/api/admin/buses`);
  return res.data?.data || [];
};

const Home = () => {
  const { data: buses = [], isLoading } = useQuery({
    queryKey: ['buses'],
    queryFn: fetchBuses,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading buses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          DIU Transport - Bus Location Tracker
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Select a bus to start sharing its location
        </p>

        {buses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">No buses available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buses
              .filter(bus => bus.status !== 'deleted')
              .map((bus) => (
                <Link
                  key={bus.busId || bus._id}
                  to={`/send-location/${bus.busId}`}
                  className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-800">
                      {bus.busName}
                    </h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                      {bus.busNumber}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">
                    <strong>Bus ID:</strong> {bus.busId}
                  </p>
                  {bus.route && (
                    <p className="text-gray-600 text-sm mb-2">
                      <strong>Route:</strong> {bus.route}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs capitalize">
                    Status: {bus.status || 'active'}
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className="text-blue-600 font-medium text-sm">
                      Tap to start tracking →
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
