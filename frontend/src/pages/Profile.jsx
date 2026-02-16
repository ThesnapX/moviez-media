import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import AvatarSelector from "../components/common/AvatarSelector";

const Profile = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [editing, setEditing] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(
    user?.profilePicture || "/uploads/avatars/default-avatar.png",
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile`, {
        ...data,
        profilePicture: selectedAvatar,
      });
      toast.success("Profile updated successfully");
      setEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl mb-4 text-primary">Profile</h1>
        <p className="text-secondary">Please login to view your profile</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 mb-6 border border-primary/20">
          <div className="flex items-center space-x-4">
            {user.profilePicture ? (
              <img
                src={`${import.meta.env.VITE_BACKEND_URL}${selectedAvatar}`}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-primary"
              />
            ) : (
              <UserCircleIcon className="w-20 h-20 text-primary" />
            )}
            <div>
              <h1 className="text-3xl text-primary">{user.name}</h1>
              <p className="text-secondary">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-primary/20">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-2 px-4 font-semibold transition-colors ${
              activeTab === "profile"
                ? "text-primary border-b-2 border-primary"
                : "text-secondary hover:text-primary"
            }`}
          >
            Edit Profile
          </button>
          <button
            onClick={() => setActiveTab("watchlist")}
            className={`pb-2 px-4 font-semibold transition-colors ${
              activeTab === "watchlist"
                ? "text-primary border-b-2 border-primary"
                : "text-secondary hover:text-primary"
            }`}
          >
            Watchlist
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && (
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-primary/20">
            {!editing ? (
              <div>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-secondary block mb-1">Name</label>
                    <p className="text-white bg-[#2a2a2a] p-3 rounded-lg">
                      {user.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-secondary block mb-1">Email</label>
                    <p className="text-white bg-[#2a2a2a] p-3 rounded-lg">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-[#d00000] transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="text-secondary block mb-1">Name</label>
                  <input
                    {...register("name", { required: "Name is required" })}
                    className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.name && (
                    <p className="text-primary text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-secondary block mb-1">Email</label>
                  <input
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.email && (
                    <p className="text-primary text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Avatar selector in edit mode */}
                <AvatarSelector
                  selectedAvatar={selectedAvatar}
                  onSelect={setSelectedAvatar}
                />

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-[#d00000] transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setSelectedAvatar(user.profilePicture);
                    }}
                    className="bg-[#2a2a2a] text-secondary px-6 py-2 rounded-lg hover:bg-[#3a3a3a] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === "watchlist" && (
          <div className="bg-[#1a1a1a] rounded-lg p-6 border border-primary/20">
            <p className="text-secondary">
              Your watchlist items will appear here
            </p>
          </div>
        )}

        {/* Logout Button */}
        <div className="mt-6 text-center">
          <button onClick={logout} className="text-primary hover:underline">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
