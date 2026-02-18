import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { formatDistanceToNow } from "date-fns";
import { UserCircleIcon } from "@heroicons/react/24/outline";

const Comments = ({ movieId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchComments();
  }, [movieId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/comments/movie/${movieId}`,
      );
      setComments(response.data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`${backendUrl}/api/comments`, {
        movie: movieId,
        text: newComment.trim(),
      });

      setComments([response.data, ...comments]);
      setNewComment("");
      toast.success("Comment posted successfully!");
    } catch (error) {
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h3 className="text-2xl text-primary mb-6 tracking-wide">Comments</h3>

      {/* Comment Form */}
      <div className="bg-[#2a2a2a] rounded-lg p-4 mb-8 border border-primary/20">
        <form onSubmit={handleSubmitComment}>
          <div className="flex items-start space-x-4">
            {/* User Avatar - First Letter */}
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30 flex-shrink-0">
              {user ? (
                <span className="text-primary text-sm font-semibold">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              ) : (
                <UserCircleIcon className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  user ? "Write a comment..." : "Login to comment..."
                }
                className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border border-primary/20 resize-none"
                rows="3"
                disabled={!user}
              />
              {showLoginPrompt && !user && (
                <p className="text-primary text-sm mt-2">
                  Please login to comment
                </p>
              )}
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={submitting || !user}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-[#d00000] transition-colors disabled:opacity-50"
                >
                  {submitting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment._id}
              className="bg-[#2a2a2a] rounded-lg p-4 border border-primary/10"
            >
              <div className="flex items-start space-x-4">
                {/* User Avatar - First Letter */}
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30 flex-shrink-0">
                  <span className="text-primary text-sm font-semibold">
                    {comment.user?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>

                {/* Comment Content */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-white">{comment.user?.name}</h4>
                    <span className="text-xs text-secondary/60">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-secondary/80 text-sm leading-relaxed">
                    {comment.text}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-[#2a2a2a] rounded-lg border border-primary/20">
            <p className="text-secondary/60">
              No comments yet. Be the first to comment!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comments;
