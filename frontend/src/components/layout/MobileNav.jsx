import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSearch } from "../../context/SearchContext";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
  UserIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  UserIcon as UserIconSolid,
} from "@heroicons/react/24/solid";

const MobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setShowSearchModal } = useSearch();
  const isActive = (path) => location.pathname === path;

  const navItems = [
    {
      path: "/",
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
      label: "Home",
    },
    {
      path: "/search",
      icon: MagnifyingGlassIcon,
      activeIcon: MagnifyingGlassIconSolid,
      label: "Search",
    },
    {
      path: "/watchlist",
      icon: BookmarkIcon,
      activeIcon: BookmarkIconSolid,
      label: "Watchlist",
    },
    {
      path: "/profile",
      icon: UserIcon,
      activeIcon: UserIconSolid,
      label: "Profile",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-primary/20 py-2 px-4 z-50 backdrop-blur-md bg-opacity-90">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = isActive(item.path) ? item.activeIcon : item.icon;
          const isActiveRoute = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center group relative"
              aria-label={item.label}
            >
              <div
                className={`p-2 rounded-xl transition-all duration-300 ${
                  isActiveRoute
                    ? "bg-primary/20 text-primary scale-110"
                    : "text-secondary/60 group-hover:text-primary/80 group-hover:scale-105"
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span
                className={`text-[10px] mt-1 transition-all duration-300 ${
                  isActiveRoute
                    ? "text-primary font-medium"
                    : "text-secondary/40 group-hover:text-primary/60"
                }`}
              >
                {item.label}
              </span>
              {isActiveRoute && (
                <span className="absolute -top-1 w-1 h-1 bg-primary rounded-full animate-pulse"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
