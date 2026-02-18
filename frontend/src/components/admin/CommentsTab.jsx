import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { formatDistanceToNow } from "date-fns";
import { TrashIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";

const CommentsTab = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/comments/all`);
      setComments(response.data);
    } catch (error) {
      toast.error("Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    setProcessing(true);
    try {
      await axios.delete(`${backendUrl}/api/comments/${commentId}`);
      toast.success("Comment deleted successfully");
      fetchComments();
    } catch (error) {
      toast.error("Failed to delete comment");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl mb-6 text-primary tracking-wide">
        Manage Comments
      </h2>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment._id}
              className="bg-[#2a2a2a] rounded-lg p-4 border border-primary/10 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
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
                    <p className="text-secondary/80 text-sm mb-2">
                      {comment.text}
                    </p>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-primary/60">on:</span>
                      <span className="text-secondary/60">
                        {comment.movie?.title || "Deleted movie"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(comment._id)}
                  disabled={processing}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-4"
                  title="Delete comment"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-[#2a2a2a] rounded-lg border border-primary/20">
            <ChatBubbleLeftIcon className="w-16 h-16 text-primary/30 mx-auto mb-3" />
            <p className="text-secondary">No comments found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsTab;
