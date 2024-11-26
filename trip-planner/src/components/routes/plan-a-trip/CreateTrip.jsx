import { Input } from "@/components/ui/input";
import React, { useContext, useEffect, useState } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import {
  PROMPT,
  SelectBudgetOptions,
  SelectNoOfPersons,
} from "../../constants/Options";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { chatSession } from "@/Service/AiModel";
import { LogInContext } from "@/Context/LogInContext/Login";
import { db } from "@/Service/Firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function CreateTrip() {
  const [place, setPlace] = useState("");
  const [formData, setFormData] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false); // New state
  const navigate = useNavigate();

  const { user, loginWithPopup, isAuthenticated } = useContext(LogInContext);

  const handleInputChange = (name, value) => {
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const SignIn = async () => {
    await loginWithPopup();
  };

  const SaveUser = async () => {
    const User = JSON.parse(localStorage.getItem("User"));
    const id = User?.email;

    console.log("User Data:", User);
    console.log("User ID:", id);

    if (!id) {
      console.error("No valid user ID found!");
      return;
    }

    try {
      await setDoc(doc(db, "Users", id), {
        userName: User?.name || "Unnamed User",
        userEmail: User?.email || "No Email",
        userPicture: User?.picture || "",
        userNickname: User?.nickname || "",
      });
      console.log("User saved successfully");
    } catch (error) {
      console.error("Error saving user: ", error);
    }
  };

  useEffect(() => {
    const loadScript = () => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAP_API_KEY}&libraries=places`;
      script.async = true;
      script.onload = () => setIsScriptLoaded(true); // Set the script loaded state
      document.body.appendChild(script);
    };

    loadScript();
  }, []);

  useEffect(() => {
    if (user && isAuthenticated) {
      localStorage.setItem("User", JSON.stringify(user));
      SaveUser();
    }
  }, [user, isAuthenticated]);

  const SaveTrip = async (TripData) => {
    const User = JSON.parse(localStorage.getItem("User"));
    const id = Date.now().toString();

    console.log("Trip Data:", TripData);
    console.log("User Name:", User?.name);
    console.log("User Email:", User?.email);

    try {
      await setDoc(doc(db, "Trips", id), {
        tripId: id,
        userSelection: formData,
        tripData: TripData,
        userName: User?.name,
        userEmail: User?.email,
      });
      console.log("Trip saved successfully");
      navigate("/all-trips");
    } catch (error) {
      console.error("Error saving trip: ", error);
    }
  };

  const saveTripToDatabase = async () => {
    const User = JSON.parse(localStorage.getItem("User"));

    if (!User?.email) {
      toast.error("No user found. Please log in.");
      return;
    }

    const tripDetails = {
      user_email: User.email,
      user_name: User.name || "Unknown",
      location: formData?.location,
      no_of_days: parseInt(formData?.noOfDays, 10),
      budget: formData?.Budget,
      people: parseInt(formData?.People, 10),
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripDetails),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || "Trip saved successfully!");
        navigate("/all-trips");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save the trip.");
      }
    } catch (error) {
      console.error("Error saving trip: ", error);
      toast.error("Failed to save the trip. Please try again.");
    }
  };

  const generateTrip = async () => {
    if (!isAuthenticated) {
      toast("Sign In to continue", { icon: "⚠️" });
      return setIsDialogOpen(true);
    }
    if (!formData?.noOfDays || !formData?.location || !formData?.People || !formData?.Budget) {
      return toast.error("Please fill out every field or select every option.");
    }
    if (formData?.noOfDays > 5 || formData?.noOfDays < 1) {
      return toast.error("Please enter a valid number of Trip Days (1-5).");
    }

    const FINAL_PROMPT = PROMPT.replace(/{location}/g, formData?.location)
      .replace(/{noOfDays}/g, formData?.noOfDays)
      .replace(/{People}/g, formData?.People)
      .replace(/{Budget}/g, formData?.Budget);

    try {
      const toastId = toast.loading("Generating Trip", { icon: "✈️" });
      setIsLoading(true);
      const result = await chatSession.sendMessage(FINAL_PROMPT);
      const trip = JSON.parse(result.response.text());
      await SaveTrip(trip);
      await saveTripToDatabase(); // Save trip to MySQL via Flask
      toast.dismiss(toastId);
      toast.success("Trip Generated Successfully");
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error("Failed to generate trip. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-10">
      <div className="text text-center md:text-left">
        <h2 className="text-2xl md:text-4xl font-bold">
          Share Your Travel Preferences 🌟🚀
        </h2>
        <p className="text-sm text-gray-600 font-medium mt-3">
          Help us craft your perfect adventure with just a few details.
          JourneyJolt will generate a tailored itinerary based on your
          preferences.
        </p>
      </div>

      <div className="form mt-10 flex flex-col gap-10 md:gap-20">
        <div className="place">
          <h2 className="font-semibold text-md md:text-lg mb-3 text-center md:text-left">
            Where do you want to Explore? 🏖️
          </h2>
          {isScriptLoaded ? ( // Conditionally render the autocomplete
            <GooglePlacesAutocomplete
              apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}
              selectProps={{
                value: place,
                onChange: (place) => {
                  setPlace(place);
                  handleInputChange("location", place.label);
                },
              }}
            />
          ) : (
            <p>Loading Google Places...</p>
          )}
        </div>

        <div className="day">
          <h2 className="font-semibold text-md md:text-lg mb-3 text-center md:text-left">
            How long is your Trip? 🕜
          </h2>
          <Input
            placeholder="Ex: 2"
            type="text"
            onChange={(day) => handleInputChange("noOfDays", day.target.value)}
          />
        </div>

        <div className="budget">
          <h2 className="font-semibold text-md md:text-lg mb-3 text-center md:text-left">
            What is your Budget? 💳
          </h2>
          <div className="options grid grid-cols-1 gap-5 md:grid-cols-3 cursor-pointer">
            {SelectBudgetOptions.map((item) => (
              <div
                onClick={() => handleInputChange("Budget", item.title)}
                key={item.id}
                className={`option transition-all hover:scale-110 p-4 h-32 flex items-center justify-center flex-col border rounded-lg hover:shadow-lg
                ${formData?.Budget === item.title && "border-black shadow-xl"}`}
              >
                <h3 className="font-bold text-[15px] md:font-[18px]">
                  {item.icon} {item.title} :
                </h3>
                <p className="text-gray-500 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="people">
          <h2 className="font-semibold text-md md:text-lg mb-3 text-center md:text-left">
            Who are you traveling with? 🚗
          </h2>
          <div className="options grid grid-cols-1 gap-5 md:grid-cols-3 cursor-pointer">
            {SelectNoOfPersons.map((item) => (
              <div
                onClick={() => handleInputChange("People", item.no)}
                key={item.id}
                className={`option transition-all hover:scale-110 p-4 h-32 flex items-center justify-center flex-col border rounded-lg hover:shadow-lg
                ${formData?.People === item.no && "border border-black shadow-xl"}`}
              >
                <h3 className="font-bold text-[15px] md:font-[18px]">
                  {item.icon} {item.title} :
                </h3>
                <p className="text-gray-500 font-medium">{item.desc}</p>
                <p className="text-gray-500 text-sm font-normal">{item.no}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="create-trip-btn w-full flex items-center justify-center h-32">
        <Button disabled={isLoading} onClick={generateTrip}>
          {isLoading ? (
            <AiOutlineLoading3Quarters className="h-6 w-6 animate-spin" />
          ) : (
            "Plan A Trip"
          )}
        </Button>
      </div>

      <Dialog
        className="m-4"
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {user ? "Thank you for LogIn" : "Sign In to Continue"}
            </DialogTitle>
            <DialogDescription>
              <span className="flex gap-2">
                <span>
                  {user
                    ? "Logged In Securely to JourneyJolt with Google Authentication"
                    : "Sign in with Google to save your trip and get personalized recommendations!"}
                </span>
                <FcGoogle
                  onClick={SignIn}
                  className="h-6 w-6 cursor-pointer"
                />
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose className="bg-gray-300 px-4 py-2 rounded">
              Close
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateTrip;
