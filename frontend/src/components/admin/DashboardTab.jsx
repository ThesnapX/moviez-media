import { useState, useEffect } from "react";
import axios from "axios";
import {
  FilmIcon,
  TvIcon,
  RocketLaunchIcon,
  TagIcon,
  UsersIcon,
  ChatBubbleLeftIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { formatDistanceToNow } from "date-fns";

const DashboardTab = () => {
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalTVSeries: 0,
    totalAnime: 0,
    totalGenres: 0,
    totalUsers: 0,
  });
  const [latestComments, setLatestComments] = useState([]);
  const [latestUsers, setLatestUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/admin/dashboard`);
      console.log("Dashboard data:", response.data); // Debug log
      setStats(response.data.stats);
      setLatestComments(response.data.latestComments);
      setLatestUsers(response.data.latestUsers);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get full image URL
  const getProfileImageUrl = (profilePath) => {
    if (!profilePath) return null;

    // Log the profile path for debugging
    console.log("Dashboard - Profile path:", profilePath);

    // If it's already a full URL, return as is
    if (profilePath.startsWith("http")) return profilePath;

    // Make sure the path starts with a slash
    const normalizedPath = profilePath.startsWith("/")
      ? profilePath
      : `/${profilePath}`;

    // Construct the full URL
    const fullUrl = `${backendUrl}${normalizedPath}`;
    console.log("Dashboard - Full image URL:", fullUrl);

    return fullUrl;
  };

  const statCards = [
    {
      label: "Total Movies",
      value: stats.totalMovies,
      icon: FilmIcon,
      color: "text-blue-500",
    },
    {
      label: "TV Series",
      value: stats.totalTVSeries,
      icon: TvIcon,
      color: "text-green-500",
    },
    {
      label: "Anime",
      value: stats.totalAnime,
      icon: RocketLaunchIcon,
      color: "text-purple-500",
    },
    {
      label: "Genres",
      value: stats.totalGenres,
      icon: TagIcon,
      color: "text-yellow-500",
    },
    {
      label: "Users",
      value: stats.totalUsers,
      icon: UsersIcon,
      color: "text-pink-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-[#2a2a2a] rounded-lg p-4 border border-primary/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Comments */}
        <div>
          <h3 className="text-xl mb-4 text-primary">Latest Comments</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {latestComments.length > 0 ? (
              latestComments.map((comment) => (
                <div
                  key={comment._id}
                  className="bg-[#2a2a2a] rounded-lg p-4 border border-primary/10"
                >
                  <div className="flex items-start space-x-3">
                    {comment.user?.profilePicture ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30 flex-shrink-0">
                        <img
                          src={getProfileImageUrl(comment.user.profilePicture)}
                          alt={comment.user.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.log(
                              "Comment image failed to load for user:",
                              comment.user.name,
                            );
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML = `
                              <div class="w-full h-full bg-primary/20 flex items-center justify-center">
                                <span class="text-primary text-sm font-semibold">
                                  ${comment.user.name?.charAt(0).toUpperCase() || "U"}
                                </span>
                              </div>
                            `;
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30 flex-shrink-0">
                        <span className="text-primary text-sm font-semibold">
                          {comment.user?.name?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="font-semibold text-white truncate">
                          {comment.user?.name}
                        </h4>
                        <span className="text-xs text-secondary/60 whitespace-nowrap">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-secondary text-sm mt-1 line-clamp-2">
                        {comment.text}
                      </p>
                      <p className="text-xs text-primary mt-2 truncate">
                        on: {comment.movie?.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-[#2a2a2a] rounded-lg border border-primary/10">
                <ChatBubbleLeftIcon className="w-12 h-12 text-primary/30 mx-auto mb-2" />
                <p className="text-secondary/60">No comments yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Latest Users */}
        <div>
          <h3 className="text-xl mb-4 text-primary">Latest Users</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {latestUsers.length > 0 ? (
              latestUsers.map((user) => {
                console.log(
                  "Dashboard - Rendering user:",
                  user.name,
                  "with profile:",
                  user.profilePicture,
                );
                return (
                  <div
                    key={user._id}
                    className="bg-[#2a2a2a] rounded-lg p-4 border border-primary/10"
                  >
                    <div className="flex items-center space-x-3">
                      {user.profilePicture ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/30 flex-shrink-0">
                          <img
                            src={getProfileImageUrl(user.profilePicture)}
                            alt={user.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.log(
                                "User image failed to load for:",
                                user.name,
                                "URL:",
                                e.target.src,
                              );
                              e.target.onerror = null;
                              e.target.style.display = "none";
                              e.target.parentElement.innerHTML = `
                                <div class="w-full h-full bg-primary/20 flex items-center justify-center">
                                  <span class="text-primary text-lg font-semibold">
                                    ${user.name?.charAt(0).toUpperCase() || "U"}
                                  </span>
                                </div>
                              `;
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30 flex-shrink-0">
                          <span className="text-primary text-lg font-semibold">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h4 className="font-semibold text-white truncate">
                            {user.name}
                          </h4>
                          <span className="text-xs text-secondary/60 whitespace-nowrap">
                            {formatDistanceToNow(new Date(user.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-secondary text-sm truncate">
                          {user.email}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span
                            className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                              user.role === "admin"
                                ? "bg-primary/20 text-primary"
                                : "bg-secondary/20 text-secondary"
                            }`}
                          >
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 bg-[#2a2a2a] rounded-lg border border-primary/10">
                <UsersIcon className="w-12 h-12 text-primary/30 mx-auto mb-2" />
                <p className="text-secondary/60">No users yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
