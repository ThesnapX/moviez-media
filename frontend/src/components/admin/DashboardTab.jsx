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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/dashboard`,
      );
      setStats(response.data.stats);
      setLatestComments(response.data.latestComments);
      setLatestUsers(response.data.latestUsers);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
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
          <div className="space-y-4">
            {latestComments.map((comment) => (
              <div key={comment._id} className="bg-[#2a2a2a] rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  {comment.user?.profilePicture ? (
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}${comment.user.profilePicture}`}
                      alt={comment.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-10 h-10 text-primary" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white">
                        {comment.user?.name}
                      </h4>
                      <span className="text-xs text-secondary">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-secondary text-sm mt-1">
                      {comment.text}
                    </p>
                    <p className="text-xs text-primary mt-2">
                      on: {comment.movie?.title}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Users */}
        <div>
          <h3 className="text-xl mb-4 text-primary">Latest Users</h3>
          <div className="space-y-4">
            {latestUsers.map((user) => (
              <div key={user._id} className="bg-[#2a2a2a] rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  {user.profilePicture ? (
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}${user.profilePicture}`}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-10 h-10 text-primary" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white">{user.name}</h4>
                      <span className="text-xs text-secondary">
                        {formatDistanceToNow(new Date(user.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-secondary text-sm">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-primary/20 text-primary text-xs rounded">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
