import { useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

// Generate avatar paths dynamically
const generateAvatarPaths = (count = 20) => {
  return Array.from(
    { length: count },
    (_, i) => `/uploads/avatars/avatar-${i + 1}.png`,
  );
};

const presetAvatars = generateAvatarPaths(20);

const AvatarSelector = ({ selectedAvatar, onSelect }) => {
  const [hoveredAvatar, setHoveredAvatar] = useState(null);

  return (
    <div className="space-y-3">
      <label className="block text-secondary text-sm">
        Choose Profile Picture
      </label>
      <div className="grid grid-cols-6 gap-3 max-h-60 overflow-y-auto p-2 bg-[#2a2a2a] rounded-lg">
        {presetAvatars.map((avatar, index) => (
          <div
            key={index}
            className="relative cursor-pointer group"
            onClick={() => onSelect(avatar)}
            onMouseEnter={() => setHoveredAvatar(avatar)}
            onMouseLeave={() => setHoveredAvatar(null)}
          >
            <div
              className={`relative rounded-full overflow-hidden border-2 transition-all ${
                selectedAvatar === avatar
                  ? "border-primary scale-110 shadow-lg shadow-primary/50"
                  : "border-transparent group-hover:border-primary/50"
              }`}
            >
              <img
                src={`${import.meta.env.VITE_BACKEND_URL}${avatar}`}
                alt={`Avatar ${index + 1}`}
                className="w-12 h-12 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `${import.meta.env.VITE_BACKEND_URL}/uploads/avatars/default-avatar.png`;
                }}
              />
            </div>
            {selectedAvatar === avatar && (
              <CheckCircleIcon className="absolute -top-1 -right-1 w-5 h-5 text-primary bg-white rounded-full" />
            )}
            {hoveredAvatar === avatar && selectedAvatar !== avatar && (
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-secondary/60">
        Select an avatar to personalize your profile
      </p>
    </div>
  );
};

export default AvatarSelector;
