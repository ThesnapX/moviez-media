import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMovies } from "../context/MovieContext";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import {
  ChevronRightIcon,
  BookmarkIcon,
  FilmIcon,
  TvIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import AvatarSelector from "../components/common/AvatarSelector";
import MovieCard from "../components/common/MovieCard";

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const { watchlist, watchlistLoading, refreshWatchlist } = useMovies();
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

  // Refresh watchlist when tab changes to watchlist
  useEffect(() => {
    if (activeTab === "watchlist") {
      refreshWatchlist();
    }
  }, [activeTab]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const updateData = {
        name: data.name,
        email: data.email,
        profilePicture: tempSelectedAvatar,
      };

      if (data.newPassword) {
        updateData.password = data.newPassword;
      }

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/profile`,
        updateData,
      );

      updateUser({
        name: data.name,
        email: data.email,
        profilePicture: tempSelectedAvatar,
      });

      setSelectedAvatar(tempSelectedAvatar);
      toast.success("Profile updated successfully");
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "movie":
        return <FilmIcon className="w-4 h-4" />;
      case "tv-series":
        return <TvIcon className="w-4 h-4" />;
      case "anime":
        return <RocketLaunchIcon className="w-4 h-4" />;
      default:
        return null;
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
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 mb-6 border border-primary/20">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary">
              <img
                src={`${import.meta.env.VITE_BACKEND_URL}${selectedAvatar}`}
                alt={user.name}
                className="w-full h-full object-cover"
                key={selectedAvatar}
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
            className={`pb-2 px-4 font-semibold transition-colors flex items-center space-x-2 ${
              activeTab === "watchlist"
                ? "text-primary border-b-2 border-primary"
                : "text-secondary hover:text-primary"
            }`}
          >
            <BookmarkIcon className="w-5 h-5" />
            <span>Watchlist</span>
            {watchlist.length > 0 && (
              <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                {watchlist.length}
              </span>
            )}
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
                    {...register("name", { required: "Name is required" })}
                    type="text"
                    className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                        message: "Invalid email address",
                      },
                    })}
                    type="email"
                    className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.email && (
                    <p className="text-primary text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Fields */}
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
                  />
                </div>

                <div>
                  <label className="text-secondary block mb-2">
                    Confirm Password
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
                    onClick={() => {
                      setEditing(false);
                      setValue("name", user.name);
                      setValue("email", user.email);
                      setValue("newPassword", "");
                      setValue("confirmPassword", "");
                      setTempSelectedAvatar(selectedAvatar);
                    }}
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-['Bebas_Neue'] text-primary">
                Your Watchlist
              </h2>
              {watchlist.length > 4 && (
                <Link
                  to="/watchlist"
                  className="flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors"
                >
                  <span>View All</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </Link>
              )}
            </div>

            {watchlistLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : watchlist.length === 0 ? (
              <div className="text-center py-8">
                <BookmarkIcon className="w-16 h-16 text-primary/30 mx-auto mb-3" />
                <p className="text-secondary mb-4">Your watchlist is empty</p>
                <Link
                  to="/movies"
                  className="inline-block bg-primary text-white px-4 py-2 rounded-lg hover:bg-[#d00000] transition-colors"
                >
                  Browse Movies
                </Link>
              </div>
            ) : (
              <>
                {/* Latest 4 watchlist items */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {watchlist.slice(0, 4).map((item) => (
                    <div key={item._id} className="relative">
                      <MovieCard movie={item} />
                      {/* Type Badge */}
                      <div className="absolute top-2 left-2 z-10">
                        <div className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs text-white flex items-center space-x-1">
                          {getTypeIcon(item.type)}
                          <span className="capitalize">
                            {item.type.replace("-", " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View All Button for smaller screens */}
                {watchlist.length > 4 && (
                  <div className="mt-6 text-center md:hidden">
                    <Link
                      to="/watchlist"
                      className="inline-flex items-center space-x-2 bg-primary/20 text-primary px-6 py-2 rounded-lg hover:bg-primary/30 transition-colors"
                    >
                      <span>View All {watchlist.length} Items</span>
                      <ChevronRightIcon className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Logout Button */}
        <div className="mt-6 text-center">
          <button onClick={logout} className="text-primary hover:underline">
            Logout
          </button>
        </div>
      </div>
      {/* Mobile Footer */}
      <div className="md:hidden mt-12 pt-6 border-t border-primary/20">
        <div className="text-center space-y-2">
          <p className="text-xs text-secondary/40">
            © 2024 MoviezMedia. All rights reserved.
          </p>
          <div className="flex justify-center space-x-4 text-xs">
            <Link
              to="/privacy"
              className="text-secondary/40 hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-secondary/40 hover:text-primary transition-colors"
            >
              Terms
            </Link>
            <Link
              to="/contact"
              className="text-secondary/40 hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
