import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  CheckCircleIcon,
  XCircleIcon,
  FilmIcon,
  TvIcon,
  RocketLaunchIcon,
  CalendarIcon,
  UserIcon,
  EnvelopeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { formatDistanceToNow } from "date-fns";

const SuggestionsTab = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/requests/all`);
      setRequests(response.data);
    } catch (error) {
      toast.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request) => {
    if (!window.confirm(`Approve request for "${request.title}"?`)) return;

    setProcessing(true);
    try {
      await axios.put(`${backendUrl}/api/requests/${request._id}`, {
        status: "approved",
      });

      await axios.post(`${backendUrl}/api/requests/notify`, {
        requestId: request._id,
        action: "approved",
      });

      toast.success(`Request for "${request.title}" approved`);
      fetchRequests();
      if (selectedRequest?._id === request._id) {
        setSelectedRequest({ ...selectedRequest, status: "approved" });
      }
    } catch (error) {
      toast.error("Failed to approve request");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (request) => {
    if (!window.confirm(`Reject request for "${request.title}"?`)) return;

    setProcessing(true);
    try {
      await axios.put(`${backendUrl}/api/requests/${request._id}`, {
        status: "rejected",
      });

      await axios.post(`${backendUrl}/api/requests/notify`, {
        requestId: request._id,
        action: "rejected",
      });

      toast.success(`Request for "${request.title}" rejected`);
      fetchRequests();
      if (selectedRequest?._id === request._id) {
        setSelectedRequest({ ...selectedRequest, status: "rejected" });
      }
    } catch (error) {
      toast.error("Failed to reject request");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (requestId) => {
    if (!window.confirm("Are you sure you want to delete this request?"))
      return;

    try {
      await axios.delete(`${backendUrl}/api/requests/${requestId}`);
      toast.success("Request deleted successfully");
      fetchRequests();
      if (selectedRequest?._id === requestId) {
        setShowModal(false);
        setSelectedRequest(null);
      }
    } catch (error) {
      toast.error("Failed to delete request");
    }
  };

  const openRequestModal = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "movie":
        return <FilmIcon className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "tv-series":
        return <TvIcon className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "anime":
        return <RocketLaunchIcon className="w-4 h-4 sm:w-5 sm:h-5" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs whitespace-nowrap">
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-1 bg-red-500/20 text-red-500 rounded-full text-xs whitespace-nowrap">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs whitespace-nowrap">
            Pending
          </span>
        );
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
      <h2 className="text-xl sm:text-2xl mb-4 sm:mb-6 text-primary tracking-wide">
        User Suggestions & Requests
      </h2>

      {/* Requests List */}
      <div className="space-y-3 sm:space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {requests.length > 0 ? (
          requests.map((request) => (
            <div
              key={request._id}
              onClick={() => openRequestModal(request)}
              className="bg-[#2a2a2a] rounded-lg p-3 sm:p-4 border border-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  {/* User Avatar - First Letter */}
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30 flex-shrink-0">
                    <span className="text-primary text-sm font-semibold">
                      {request.user?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>

                  {/* Request Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1">
                      <h4 className="text-base text-white truncate">
                        {request.user?.name}
                      </h4>
                      <span className="text-xs text-secondary/60 whitespace-nowrap">
                        {formatDistanceToNow(new Date(request.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-primary font-medium truncate max-w-[120px] sm:max-w-[200px]">
                        {request.title}
                      </span>
                      <span className="text-secondary/40 hidden sm:inline">
                        •
                      </span>
                      <div className="flex items-center space-x-1 text-secondary/60">
                        {getTypeIcon(request.type)}
                        <span className="capitalize text-xs">
                          {request.type.replace("-", " ")}
                        </span>
                      </div>
                      {request.releaseYear && (
                        <>
                          <span className="text-secondary/40 hidden sm:inline">
                            •
                          </span>
                          <div className="flex items-center space-x-1 text-secondary/60">
                            <CalendarIcon className="w-3 h-3" />
                            <span className="text-xs">
                              {request.releaseYear}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center justify-end sm:justify-start space-x-2 sm:ml-4">
                  {getStatusBadge(request.status)}

                  {request.status === "pending" && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(request);
                        }}
                        disabled={processing}
                        className="p-1.5 sm:p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                        title="Approve request"
                      >
                        <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReject(request);
                        }}
                        disabled={processing}
                        className="p-1.5 sm:p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Reject request"
                      >
                        <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(request._id);
                    }}
                    className="p-1.5 sm:p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete request"
                  >
                    <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-[#2a2a2a] rounded-lg border border-primary/20">
            <EnvelopeIcon className="w-12 h-12 sm:w-16 sm:h-16 text-primary/30 mx-auto mb-3" />
            <p className="text-secondary">No requests found</p>
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 blur-backdrop">
          <div className="bg-[#1a1a1a] rounded-xl w-full max-w-2xl border border-primary/20 overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary/20 to-transparent p-4 sm:p-6 border-b border-primary/20 sticky top-0 bg-[#1a1a1a] z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl sm:text-2xl text-primary tracking-wide mb-2">
                    Request Details
                  </h3>
                  <p className="text-xs sm:text-sm text-secondary/60">
                    Submitted{" "}
                    {formatDistanceToNow(new Date(selectedRequest.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* User Info */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 bg-[#2a2a2a] rounded-lg border border-primary/10">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30 flex-shrink-0 mx-auto sm:mx-0">
                  <span className="text-primary text-xl sm:text-2xl font-semibold">
                    {selectedRequest.user?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="text-lg sm:text-xl text-white">
                    {selectedRequest.user?.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-secondary break-all">
                    {selectedRequest.user?.email}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                    {selectedRequest.user?.role}
                  </span>
                </div>
              </div>

              {/* Request Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-[#2a2a2a] rounded-lg border border-primary/10">
                  <p className="text-xs text-secondary/60 mb-1">Title</p>
                  <p className="text-base sm:text-lg text-white break-words">
                    {selectedRequest.title}
                  </p>
                </div>

                <div className="p-3 sm:p-4 bg-[#2a2a2a] rounded-lg border border-primary/10">
                  <p className="text-xs text-secondary/60 mb-1">Type</p>
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                      {getTypeIcon(selectedRequest.type)}
                    </div>
                    <span className="text-sm sm:text-base text-white capitalize">
                      {selectedRequest.type.replace("-", " ")}
                    </span>
                  </div>
                </div>

                {selectedRequest.releaseYear && (
                  <div className="p-3 sm:p-4 bg-[#2a2a2a] rounded-lg border border-primary/10">
                    <p className="text-xs text-secondary/60 mb-1">
                      Release Year
                    </p>
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary/60" />
                      <span className="text-sm sm:text-base text-white">
                        {selectedRequest.releaseYear}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-3 sm:p-4 bg-[#2a2a2a] rounded-lg border border-primary/10">
                  <p className="text-xs text-secondary/60 mb-1">Status</p>
                  <div className="flex items-center space-x-2">
                    {selectedRequest.status === "approved" && (
                      <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    )}
                    {selectedRequest.status === "rejected" && (
                      <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                    )}
                    {selectedRequest.status === "pending" && (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin" />
                    )}
                    <span
                      className={`text-sm sm:text-base capitalize ${
                        selectedRequest.status === "approved"
                          ? "text-green-500"
                          : selectedRequest.status === "rejected"
                            ? "text-red-500"
                            : "text-yellow-500"
                      }`}
                    >
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Request ID */}
              <div className="p-3 bg-[#2a2a2a] rounded-lg border border-primary/10">
                <p className="text-xs text-secondary/60 mb-1">Request ID</p>
                <p className="text-xs sm:text-sm font-mono text-primary/80 break-all">
                  {selectedRequest._id}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-[#2a2a2a] p-4 sm:p-6 border-t border-primary/20 sticky bottom-0">
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                {selectedRequest.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedRequest);
                        setShowModal(false);
                      }}
                      disabled={processing}
                      className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors text-sm sm:text-base"
                    >
                      <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedRequest);
                        setShowModal(false);
                      }}
                      disabled={processing}
                      className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors text-sm sm:text-base"
                    >
                      <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Reject</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    handleDelete(selectedRequest._id);
                    setShowModal(false);
                  }}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors text-sm sm:text-base"
                >
                  <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-[#3a3a3a] text-secondary rounded-lg hover:bg-[#4a4a4a] transition-colors text-sm sm:text-base"
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

export default SuggestionsTab;
