import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import {
  ChartBarIcon,
  UsersIcon,
  TagIcon,
  FilmIcon,
  ChatBubbleLeftIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// Import admin components (we'll create these next)
import DashboardTab from "../../components/admin/DashboardTab";
import UsersTab from "../../components/admin/UsersTab";
import GenreTab from "../../components/admin/GenreTab";
import PostTab from "../../components/admin/PostTab";
import SuggestionsTab from "../../components/admin/SuggestionsTab";
import CommentsTab from "../../components/admin/CommentsTab";
import NewsletterTab from "../../components/admin/NewsletterTab";
import AdsTab from "../../components/admin/AdsTab";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: "dashboard", name: "Dashboard", icon: ChartBarIcon },
    { id: "users", name: "Users", icon: UsersIcon },
    { id: "genre", name: "Genre", icon: TagIcon },
    { id: "post", name: "Posts", icon: FilmIcon },
    { id: "suggestions", name: "Suggestions", icon: ChatBubbleLeftIcon },
    { id: "comments", name: "Comments", icon: ChatBubbleLeftIcon },
    { id: "newsletter", name: "Newsletter", icon: EnvelopeIcon },
    { id: "ads", name: "Manage Ads", icon: CurrencyDollarIcon },
  ];

  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl mb-4 text-primary">Access Denied</h1>
        <p className="text-secondary">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl mb-8 text-primary">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-primary/20 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "text-secondary hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-primary/20">
          {activeTab === "dashboard" && <DashboardTab />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "genre" && <GenreTab />}
          {activeTab === "post" && <PostTab />}
          {activeTab === "suggestions" && <SuggestionsTab />}
          {activeTab === "comments" && <CommentsTab />}
          {activeTab === "newsletter" && <NewsletterTab />}
          {activeTab === "ads" && <AdsTab />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
