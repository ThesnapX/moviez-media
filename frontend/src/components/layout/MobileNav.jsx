import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  FilmIcon,
  TvIcon,
  RocketLaunchIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { HomeIcon as HomeIconSolid } from "@heroicons/react/24/solid";

const MobileNav = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/", icon: HomeIcon, activeIcon: HomeIconSolid, label: "Home" },
    { path: "/movies", icon: FilmIcon, activeIcon: FilmIcon, label: "Movies" },
    {
      path: "/search",
      icon: MagnifyingGlassIcon,
      activeIcon: MagnifyingGlassIcon,
      label: "Search",
      special: true,
    },
    { path: "/tv-series", icon: TvIcon, activeIcon: TvIcon, label: "TV" },
    {
      path: "/anime",
      icon: RocketLaunchIcon,
      activeIcon: RocketLaunchIcon,
      label: "Anime",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-darker border-t border-primary/20 py-2 px-4 z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon =
            isActive(item.path) && item.activeIcon
              ? item.activeIcon
              : item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center ${
                item.special
                  ? "bg-primary rounded-full p-3 -mt-8 glow-red"
                  : isActive(item.path)
                    ? "text-primary"
                    : "text-secondary"
              }`}
            >
              <Icon className={`w-6 h-6 ${item.special ? "text-white" : ""}`} />
              {!item.special && (
                <span className="text-xs mt-1">{item.label}</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
