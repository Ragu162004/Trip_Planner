import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch users and their trips from backend
    useEffect(() => {
        const fetchUsersAndTrips = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/users");
                setUsers(response.data);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch data");
                setLoading(false);
            }
        };

        fetchUsersAndTrips();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-xl text-gray-700">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-xl text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-4xl font-semibold text-center text-gray-800 mb-6">
                Admin Dashboard
            </h1>
            <h2 className="text-2xl font-medium text-gray-700 mb-4">
                Users and Their Trips
            </h2>
            <div className="space-y-6">
                {users.length > 0 ? (
                    users.map((user) => (
                        <div
                            key={user.user_email}
                            className="p-4 border border-gray-300 rounded-lg shadow-md"
                        >
                            <h3 className="text-xl font-semibold text-gray-800">
                                {user.user_name} ({user.user_email})
                            </h3>
                            <ul className="mt-4 space-y-4">
                                {user.trips.length > 0 ? (
                                    user.trips.map((trip, index) => (
                                        <li key={index} className="border-t pt-4 text-gray-600">
                                            <div>
                                                <strong className="text-gray-800">Location:</strong>{" "}
                                                {trip.location}
                                            </div>
                                            <div>
                                                <strong className="text-gray-800">Days:</strong>{" "}
                                                {trip.no_of_days}
                                            </div>
                                            <div>
                                                <strong className="text-gray-800">Budget:</strong>{" "}
                                                {trip.budget}
                                            </div>
                                            <div>
                                                <strong className="text-gray-800">People:</strong>{" "}
                                                {trip.people}
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-gray-600">No trips found for this user.</li>
                                )}
                            </ul>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-xl text-gray-700">No users found.</div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
