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

      {/* Avatar Grid - Scrollable with fixed height */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4 max-h-80 overflow-y-auto p-3 bg-[#2a2a2a] rounded-xl scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {avatars.map((avatar) => {
          const isSelected =
            (tempSelectedAvatar || selectedAvatar) === avatar.url;
          const fullUrl = `${backendUrl}${avatar.url}`;

          return (
            <div
              key={avatar.id}
              onClick={() => handleAvatarClick(avatar.url)}
              className="relative cursor-pointer group aspect-square"
            >
              {/* Avatar Image Container */}
              <div className="relative w-full h-full">
                {/* Avatar Image with darken effect when selected */}
                <div
                  className={`absolute inset-0 rounded-full overflow-hidden transition-all duration-200 ${
                    isSelected ? "brightness-50" : "group-hover:brightness-90"
                  }`}
                >
                  <img
                    src={fullUrl}
                    alt={`Avatar ${avatar.id}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `${backendUrl}/uploads/avatars/avatar-1.png`;
                    }}
                  />
                </div>

                {/* Selection Ring */}
                {isSelected && (
                  <>
                    {/* Outer ring */}
                    <div className="absolute inset-0 rounded-full ring-4 ring-primary ring-offset-2 ring-offset-[#2a2a2a]"></div>

                    {/* Center Tick Icon - No background, just red tick */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckCircleIcon className="w-8 h-8 text-primary drop-shadow-lg" />
                    </div>
                  </>
                )}

                {/* Hover Ring for non-selected */}
                {!isSelected && (
                  <div className="absolute inset-0 rounded-full ring-2 ring-transparent group-hover:ring-primary/50 transition-all"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AvatarSelector;
