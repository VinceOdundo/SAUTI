import { useState } from "react";
import { useDispatch } from "react-redux";
import { updateProfile } from "../features/auth/authAPI";

const CompleteProfilePage = () => {
  const [profileData, setProfileData] = useState({
    county: "",
    constituency: "",
    ward: "",
    yob: "",
    phone: "",
  });

  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(updateProfile(profileData));
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center">
          Complete Your Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Add form fields for county, constituency, ward, etc */}
        </form>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
