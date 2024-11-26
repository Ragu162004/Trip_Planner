import { LogInContext } from "@/Context/LogInContext/Login";
import { db } from "@/Service/Firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import AlltripsCard from "./AlltripsCard";
import { Link } from "react-router-dom";

function Alltrips() {
  const { user } = useContext(LogInContext);
  const [allTrips, setAllTrips] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  const getAllTrips = async () => {
    try {
      setLoading(true); // Start loading
      const queryRef = query(
        collection(db, "Trips"),
        where("userEmail", "==", user?.email)
      );
      const querySnapshot = await getDocs(queryRef);

      const trips = querySnapshot.docs.map(doc => doc.data());
      setAllTrips(trips); // Set all trips at once
    } catch (err) {
      console.error(err);
      setError("Failed to load trips. Please try again."); // Set error message
    } finally {
      setLoading(false); // End loading
    }
  };

  useEffect(() => {
    if (user) getAllTrips(); // Fetch trips only if user is available
  }, [user]);

  return (
    <div className="">
      <h1 className="w-full font-medium text-lg text-center sm:text-left sm:text-2xl sm:font-bold mb-3">
        All Trips
      </h1>
      <div className="container flex gap-3 flex-wrap items-center">
        {loading ? ( // Loading state
          <div className="w-full flex justify-center">
            <div className="loader">Loading trips...</div> {/* Loading indicator */}
          </div>
        ) : error ? ( // Error state
          <div className="w-full text-center text-red-500">
            {error}
          </div>
        ) : allTrips?.length > 0 ? ( // Trips available
          allTrips.map((trip, idx) => (
            <Link key={idx} to={`/my-trips/${trip.tripId}`}>
              <AlltripsCard trip={trip} />
            </Link>
          ))
        ) : ( // No trips available
          <div className="w-full text-center text-gray-500">
            No trips found. Start planning your adventures!
          </div>
        )}
      </div>
    </div>
  );
}

export default Alltrips;
