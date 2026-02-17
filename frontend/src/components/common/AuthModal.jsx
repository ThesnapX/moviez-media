import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  XMarkIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import AvatarSelector from "./AvatarSelector";

const AuthModal = () => {
  const {
    showAuthModal,
    setShowAuthModal,
    authMode,
    setAuthMode,
    login,
    register: registerUser,
    forgotPassword,
  } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(
    "/uploads/avatars/default-avatar.png",
  );
  if (!showAuthModal) return null;

  const onSubmit = async (data) => {
    setLoading(true);

    if (authMode === "login") {
      await login(data.email, data.password);
    } else if (authMode === "register") {
      // Add selected avatar to registration data
      await registerUser({
        ...data,
        profilePicture: selectedAvatar,
      });
    } else if (authMode === "forgot") {
      await forgotPassword(data.email);
    }

    setLoading(false);
  };

  const handleClose = (e) => {
    if (e.target === e.currentTarget) {
      setShowAuthModal(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 blur-backdrop animate-fade-in"
      onClick={handleClose}
    >
      <div className="bg-[#1a1a1a] rounded-lg w-full max-w-md p-6 relative animate-slide-up border border-[#f00000] glow-red">
        {/* Close button */}
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 text-secondary hover:text-primary transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Header */}
        <h2 className="text-3xl mb-6 text-primary">
          {authMode === "login" && "Login"}
          {authMode === "register" && "Register"}
          {authMode === "forgot" && "Forgot Password"}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {authMode === "register" && (
            <>
              <div>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />
                  <input
                    {...register("name", { required: "Name is required" })}
                    type="text"
                    placeholder="Full Name"
                    className="w-full bg-[#2a2a2a] text-secondary pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {errors.name && (
                  <p className="text-primary text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Avatar Selector for Registration */}
              <AvatarSelector
                selectedAvatar={selectedAvatar}
                onSelect={setSelectedAvatar}
              />
            </>
          )}

          <div>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                type="email"
                placeholder="Email"
                className="w-full bg-[#2a2a2a] text-secondary pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {errors.email && (
              <p className="text-primary text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {authMode !== "forgot" && (
            <div>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  type="password"
                  placeholder="Password"
                  className="w-full bg-[#2a2a2a] text-secondary pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {errors.password && (
                <p className="text-primary text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-[#d00000] transition-all glow-red-hover disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : authMode === "login"
                ? "Login"
                : authMode === "register"
                  ? "Register"
                  : "Send Reset Link"}
          </button>
        </form>

        {/* Footer links */}
        <div className="mt-6 text-center space-y-2">
          {authMode === "login" && (
            <>
              <button
                onClick={() => setAuthMode("forgot")}
                className="text-secondary hover:text-primary text-sm transition-colors"
              >
                Forgot password?
              </button>
              <p className="text-secondary text-sm">
                Don't have an account?{" "}
                <button
                  onClick={() => setAuthMode("register")}
                  className="text-primary hover:underline"
                >
                  Register
                </button>
              </p>
            </>
          )}

          {authMode === "register" && (
            <p className="text-secondary text-sm">
              Already have an account?{" "}
              <button
                onClick={() => setAuthMode("login")}
                className="text-primary hover:underline"
              >
                Login
              </button>
            </p>
          )}

          {authMode === "forgot" && (
            <button
              onClick={() => setAuthMode("login")}
              className="text-primary hover:underline text-sm"
            >
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
