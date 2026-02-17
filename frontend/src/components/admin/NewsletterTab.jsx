import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import { formatDistanceToNow } from "date-fns";
import {
  EnvelopeIcon,
  PaperAirplaneIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const NewsletterTab = () => {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNewsletters: 0,
    lastNewsletter: null,
  });
  const [loading, setLoading] = useState(true);
  const [selectedNewsletter, setSelectedNewsletter] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [historyRes, statsRes] = await Promise.all([
        axios.get(`${backendUrl}/api/newsletter/history`),
        axios.get(`${backendUrl}/api/newsletter/stats`),
      ]);
      setHistory(historyRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast.error("Failed to fetch newsletter data");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!window.confirm(`Send newsletter to ${stats.totalUsers} users?`)) {
      return;
    }

    setSending(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/newsletter/send`,
        formData,
      );

      toast.success(
        `Newsletter sent successfully to ${response.data.stats.sent} users!`,
      );

      setFormData({ subject: "", message: "" });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send newsletter");
    } finally {
      setSending(false);
    }
  };

  const getProfileImageUrl = (profilePath) => {
    if (!profilePath) return null;
    if (profilePath.startsWith("http")) return profilePath;
    const normalizedPath = profilePath.startsWith("/")
      ? profilePath
      : `/${profilePath}`;
    return `${backendUrl}${normalizedPath}`;
  };

  const handleImageError = (e, userName) => {
    e.target.onerror = null;
    e.target.style.display = "none";
    const parent = e.target.parentElement;
    const fallback = document.createElement("div");
    fallback.className =
      "w-full h-full bg-primary/20 flex items-center justify-center";
    fallback.innerHTML = `<span class="text-primary text-sm">${userName?.charAt(0).toUpperCase() || "U"}</span>`;
    parent.appendChild(fallback);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl text-primary tracking-wide">
        Newsletter Management
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Total Users</p>
              <p className="text-3xl text-white">{stats.totalUsers}</p>
            </div>
            <UserGroupIcon className="w-8 h-8 text-primary/60" />
          </div>
        </div>

        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Newsletters Sent</p>
              <p className="text-3xl text-white">{stats.totalNewsletters}</p>
            </div>
            <DocumentTextIcon className="w-8 h-8 text-primary/60" />
          </div>
        </div>

        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Last Newsletter</p>
              <p className="text-lg text-white">
                {stats.lastNewsletter ? (
                  <>
                    {stats.lastNewsletter.subject}
                    <span className="block text-xs text-secondary/60 mt-1">
                      {formatDistanceToNow(
                        new Date(stats.lastNewsletter.date),
                        {
                          addSuffix: true,
                        },
                      )}
                    </span>
                  </>
                ) : (
                  "No newsletters yet"
                )}
              </p>
            </div>
            <ClockIcon className="w-8 h-8 text-primary/60" />
          </div>
        </div>

        <div className="bg-[#2a2a2a] rounded-lg p-4 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Success Rate</p>
              <p className="text-3xl text-white">
                {stats.totalNewsletters > 0 ? "100%" : "0%"}
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-primary/60" />
          </div>
        </div>
      </div>

      {/* Compose Newsletter */}
      <div className="bg-[#1a1a1a] rounded-lg border border-primary/20 p-6">
        <h3 className="text-xl text-primary mb-4 tracking-wide">
          Compose Newsletter
        </h3>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-secondary mb-2">Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              placeholder="e.g., New Movies Added This Week!"
              className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20"
              required
            />
          </div>

          <div>
            <label className="block text-secondary mb-2">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Write your newsletter message here..."
              rows="8"
              className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20 resize-none"
              required
            />
          </div>

          {/* Preview Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="px-6 py-2 bg-[#2a2a2a] text-secondary rounded-lg hover:bg-[#3a3a3a] transition-colors"
            >
              Preview
            </button>
            <button
              type="submit"
              disabled={sending}
              className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-[#d00000] transition-colors disabled:opacity-50"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
              <span>
                {sending ? "Sending..." : `Send to ${stats.totalUsers} Users`}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Newsletter History */}
      <div className="bg-[#1a1a1a] rounded-lg border border-primary/20 p-6">
        <h3 className="text-xl text-primary mb-4 tracking-wide">
          Newsletter History
        </h3>

        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {history.length > 0 ? (
            history.map((newsletter) => (
              <div
                key={newsletter._id}
                className="bg-[#2a2a2a] rounded-lg p-4 border border-primary/10 hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => setSelectedNewsletter(newsletter)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Admin Avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30 flex-shrink-0">
                      {newsletter.sentBy?.profilePicture ? (
                        <img
                          src={getProfileImageUrl(
                            newsletter.sentBy.profilePicture,
                          )}
                          alt={newsletter.sentBy.name}
                          className="w-full h-full object-cover"
                          onError={(e) =>
                            handleImageError(e, newsletter.sentBy.name)
                          }
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                          <span className="text-primary text-sm">
                            {newsletter.sentBy?.name?.charAt(0).toUpperCase() ||
                              "A"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Newsletter Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-white">{newsletter.subject}</h4>
                        <span className="text-xs text-secondary/60">
                          {formatDistanceToNow(new Date(newsletter.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-secondary/80 text-sm line-clamp-2">
                        {newsletter.message}
                      </p>
                      <div className="flex items-center space-x-3 mt-2 text-xs">
                        <span className="text-primary/60">
                          Sent by: {newsletter.sentBy?.name}
                        </span>
                        <span className="text-secondary/40">•</span>
                        <span className="text-green-500">
                          ✓ {newsletter.sentTo?.length || 0} recipients
                        </span>
                        {newsletter.status === "failed" && (
                          <>
                            <span className="text-secondary/40">•</span>
                            <span className="text-red-500">
                              <XCircleIcon className="w-3 h-3 inline mr-1" />
                              Failed
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <CheckCircleIcon className="w-5 h-5 text-green-500/50" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-[#2a2a2a] rounded-lg border border-primary/10">
              <EnvelopeIcon className="w-12 h-12 text-primary/30 mx-auto mb-2" />
              <p className="text-secondary/60">No newsletters sent yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 blur-backdrop">
          <div className="bg-[#1a1a1a] rounded-xl w-full max-w-2xl border border-primary/20 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary/20 to-transparent p-6 border-b border-primary/20">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl text-primary tracking-wide mb-2">
                    Newsletter Preview
                  </h3>
                  <p className="text-sm text-secondary/60">
                    This is how your newsletter will look to recipients
                  </p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-secondary" />
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-lg border border-primary/20 p-6">
                {/* Email Header */}
                <div className="text-center mb-6">
                  <h1 className="text-4xl text-primary tracking-wide mb-2">
                    Moviez<span className="text-white">Media</span>
                  </h1>
                  <p className="text-secondary/60">
                    Stay Updated with the Latest Content!
                  </p>
                </div>

                {/* Email Content */}
                <div className="space-y-4">
                  <div className="text-primary">Hello Valued Member! 👋</div>

                  <h2 className="text-xl text-primary">
                    {formData.subject || "Newsletter Subject"}
                  </h2>

                  <div className="bg-black/20 rounded-lg p-4 border-l-4 border-primary">
                    <p className="text-secondary/80 whitespace-pre-wrap">
                      {formData.message ||
                        "Your newsletter message will appear here..."}
                    </p>
                  </div>

                  {/* Sample Button */}
                  <div className="text-center">
                    <button className="bg-primary text-white px-6 py-2 rounded-lg">
                      Visit MoviezMedia
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="text-center text-xs text-secondary/40 mt-6 pt-4 border-t border-primary/20">
                    <p>
                      © {new Date().getFullYear()} MoviezMedia. All rights
                      reserved.
                    </p>
                    <p className="mt-1">
                      You're receiving this because you're subscribed to
                      MoviezMedia updates.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-[#2a2a2a] p-6 border-t border-primary/20">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-6 py-2 bg-[#3a3a3a] text-secondary rounded-lg hover:bg-[#4a4a4a] transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    document.getElementById("send-newsletter-btn")?.click();
                  }}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-[#d00000] transition-colors"
                >
                  Send Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Newsletter Details Modal */}
      {selectedNewsletter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 blur-backdrop">
          <div className="bg-[#1a1a1a] rounded-xl w-full max-w-2xl border border-primary/20 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary/20 to-transparent p-6 border-b border-primary/20">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl text-primary tracking-wide mb-2">
                    Newsletter Details
                  </h3>
                  <p className="text-sm text-secondary/60">
                    Sent{" "}
                    {formatDistanceToNow(
                      new Date(selectedNewsletter.createdAt),
                      { addSuffix: true },
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedNewsletter(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-secondary" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Sent By */}
              <div className="flex items-center space-x-3 p-3 bg-[#2a2a2a] rounded-lg">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  {selectedNewsletter.sentBy?.profilePicture ? (
                    <img
                      src={getProfileImageUrl(
                        selectedNewsletter.sentBy.profilePicture,
                      )}
                      alt={selectedNewsletter.sentBy.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-sm">
                        {selectedNewsletter.sentBy?.name
                          ?.charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-white">
                    Sent by: {selectedNewsletter.sentBy?.name}
                  </p>
                  <p className="text-xs text-secondary/60">
                    {selectedNewsletter.sentBy?.email}
                  </p>
                </div>
              </div>

              {/* Subject */}
              <div className="p-3 bg-[#2a2a2a] rounded-lg">
                <p className="text-xs text-secondary/60 mb-1">Subject</p>
                <p className="text-white">{selectedNewsletter.subject}</p>
              </div>

              {/* Message */}
              <div className="p-3 bg-[#2a2a2a] rounded-lg">
                <p className="text-xs text-secondary/60 mb-1">Message</p>
                <p className="text-secondary/80 whitespace-pre-wrap">
                  {selectedNewsletter.message}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#2a2a2a] rounded-lg">
                  <p className="text-xs text-secondary/60 mb-1">Recipients</p>
                  <p className="text-lg text-white">
                    {selectedNewsletter.sentTo?.length || 0} users
                  </p>
                </div>
                <div className="p-3 bg-[#2a2a2a] rounded-lg">
                  <p className="text-xs text-secondary/60 mb-1">Status</p>
                  <p
                    className={`text-lg ${selectedNewsletter.status === "sent" ? "text-green-500" : "text-red-500"}`}
                  >
                    {selectedNewsletter.status || "sent"}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-[#2a2a2a] p-6 border-t border-primary/20">
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedNewsletter(null)}
                  className="px-6 py-2 bg-[#3a3a3a] text-secondary rounded-lg hover:bg-[#4a4a4a] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterTab;
