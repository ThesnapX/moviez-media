import { useState, useEffect } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const AvatarSelector = ({
  selectedAvatar,
  onSelect,
  tempSelectedAvatar,
  onTempSelect,
}) => {
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch avatars from backend
  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${backendUrl}/api/avatars`);
        const data = await response.json();
        setAvatars(data.avatars);
      } catch (error) {
        console.error("Error fetching avatars:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatars();
  }, []);

  const handleAvatarClick = (avatarUrl) => {
    onTempSelect(avatarUrl); // Update temporary selection
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block text-secondary text-sm font-medium">
        Choose Profile Picture
      </label>

      {/* Avatar Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4 max-h-80 overflow-y-auto p-3 bg-[#2a2a2a] rounded-xl">
        {avatars.map((avatarItem) => {
          const isSelected =
            (tempSelectedAvatar || selectedAvatar) === avatarItem.url;
          const fullUrl = `${backendUrl}${avatarItem.url}`;

          return (
            <div
              key={avatarItem.id}
              onClick={() => handleAvatarClick(avatarItem.url)}
              className="relative cursor-pointer group"
            >
              {/* Avatar Image */}
              <div
                className={`relative rounded-full overflow-hidden transition-all duration-200 ${
                  isSelected
                    ? "ring-4 ring-primary ring-offset-2 ring-offset-[#2a2a2a] scale-105"
                    : "ring-2 ring-transparent group-hover:ring-primary/50"
                }`}
              >
                <img
                  src={fullUrl}
                  alt={`Avatar ${avatarItem.id}`}
                  className="w-full h-full aspect-square object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `${backendUrl}/uploads/avatars/avatar-1.png`;
                  }}
                />
              </div>

              {/* Selected Check Icon */}
              {isSelected && (
                <div className="absolute -top-1 -right-1">
                  <CheckCircleIcon className="w-5 h-5 text-primary bg-white rounded-full" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selection Status */}
      <div className="text-center text-sm">
        {tempSelectedAvatar ? (
          <span className="text-primary">
            Avatar selected{" "}
            {tempSelectedAvatar !== selectedAvatar && "(not saved)"}
          </span>
        ) : selectedAvatar ? (
          <span className="text-secondary">Current avatar selected</span>
        ) : (
          <span className="text-secondary/60">Click an avatar to select</span>
        )}
      </div>
    </div>
  );
};

export default AvatarSelector;
