import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import AvatarSelector from "../components/common/AvatarSelector";

const Profile = () => {
  const { user, logout, updateUser } = useAuth(); // Add updateUser
  const [activeTab, setActiveTab] = useState("profile");
  const [editing, setEditing] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(
    user?.profilePicture || "/uploads/avatars/avatar-1.png",
  );
  const [tempSelectedAvatar, setTempSelectedAvatar] = useState(
    user?.profilePicture || "/uploads/avatars/avatar-1.png",
  );
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Watch password fields for validation
  const newPassword = watch("newPassword");

  useEffect(() => {
    if (user) {
      setValue("name", user.name);
      setValue("email", user.email);
      setSelectedAvatar(user.profilePicture || "/uploads/avatars/avatar-1.png");
      setTempSelectedAvatar(
        user.profilePicture || "/uploads/avatars/avatar-1.png",
      );
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const updateData = {
        name: data.name,
        email: data.email,
        profilePicture: tempSelectedAvatar, // Use tempSelectedAvatar
      };

      // Only include password if it's provided
      if (data.newPassword) {
        updateData.password = data.newPassword;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/profile`,
        updateData,
      );

      // Update user in context using the updateUser function
      updateUser({
        name: data.name,
        email: data.email,
        profilePicture: tempSelectedAvatar,
      });

      // Update selectedAvatar to match tempSelectedAvatar
      setSelectedAvatar(tempSelectedAvatar);

      toast.success("Profile updated successfully");
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setValue("name", user.name);
    setValue("email", user.email);
    setValue("newPassword", "");
    setValue("confirmPassword", "");
    // Reset temp selection to the actual saved avatar
    setTempSelectedAvatar(
      user.profilePicture || "/uploads/avatars/avatar-1.png",
    );
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
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary">
              <img
                src={`${import.meta.env.VITE_BACKEND_URL}${selectedAvatar}`}
                alt={user.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `${import.meta.env.VITE_BACKEND_URL}/uploads/avatars/avatar-1.png`;
                }}
              />
            </div>
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="text-secondary block mb-2">Full Name</label>
                  <input
                    {...register("name", {
                      required: "Name is required",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters",
                      },
                    })}
                    type="text"
                    className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your name"
                  />
                  {errors.name && (
                    <p className="text-primary text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="text-secondary block mb-2">
                    Email Address
                  </label>
                  <input
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Please enter a valid email address",
                      },
                    })}
                    type="email"
                    className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="text-primary text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* New Password Field */}
                <div>
                  <label className="text-secondary block mb-2">
                    New Password (optional)
                  </label>
                  <input
                    {...register("newPassword", {
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    type="password"
                    className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Leave blank to keep current password"
                  />
                  {errors.newPassword && (
                    <p className="text-primary text-sm mt-1">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="text-secondary block mb-2">
                    Confirm New Password
                  </label>
                  <input
                    {...register("confirmPassword", {
                      validate: (value) =>
                        !newPassword ||
                        value === newPassword ||
                        "Passwords do not match",
                    })}
                    type="password"
                    className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Confirm your new password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-primary text-sm mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Avatar Selector */}
                <div className="pt-4">
                  <AvatarSelector
                    selectedAvatar={selectedAvatar}
                    tempSelectedAvatar={tempSelectedAvatar}
                    onTempSelect={setTempSelectedAvatar}
                    onSelect={setSelectedAvatar}
                  />
                </div>

                {/* Form Actions */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-[#d00000] transition-colors disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-[#2a2a2a] text-secondary py-3 rounded-lg font-semibold hover:bg-[#3a3a3a] transition-colors"
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
            <p className="text-secondary text-center py-8">
              Your watchlist will appear here
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
