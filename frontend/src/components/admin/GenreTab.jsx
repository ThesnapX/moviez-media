import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

const GenreTab = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/genres`,
      );
      setGenres(response.data);
    } catch (error) {
      toast.error("Failed to fetch genres");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGenre) {
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/genres/${editingGenre._id}`,
          formData,
        );
        toast.success("Genre updated successfully");
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/genres`,
          formData,
        );
        toast.success("Genre added successfully");
      }
      setShowModal(false);
      setEditingGenre(null);
      setFormData({ name: "" });
      fetchGenres();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save genre");
    }
  };

  const handleDelete = async (genreId) => {
    if (!window.confirm("Are you sure you want to delete this genre?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/genres/${genreId}`,
      );
      toast.success("Genre deleted successfully");
      fetchGenres();
    } catch (error) {
      toast.error("Failed to delete genre");
    }
  };

  const openEditModal = (genre) => {
    setEditingGenre(genre);
    setFormData({
      name: genre.name,
    });
    setShowModal(true);
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl text-primary">Manage Genres</h2>
        <button
          onClick={() => {
            setEditingGenre(null);
            setFormData({ name: "" });
            setShowModal(true);
          }}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-[#d00000] transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Genre</span>
        </button>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 blur-backdrop">
          <div className="bg-[#1a1a1a] rounded-lg w-full max-w-md p-6 border border-primary/20">
            <h3 className="text-xl mb-4 text-primary">
              {editingGenre ? "Edit Genre" : "Add New Genre"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-secondary mb-1">Genre Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Action, Comedy, Drama"
                  required
                />
              </div>
              <div className="flex space-x-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-[#d00000] transition-colors"
                >
                  {editingGenre ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingGenre(null);
                    setFormData({ name: "" });
                  }}
                  className="flex-1 bg-[#2a2a2a] text-secondary py-2 rounded-lg hover:bg-[#3a3a3a] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Genres List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {genres.map((genre) => (
          <div
            key={genre._id}
            className="bg-[#2a2a2a] rounded-lg p-4 border border-primary/20 hover:border-primary/40 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="text-xl  text-white mb-1">{genre.name}</h4>
                <p className="text-xs text-secondary/60">
                  Added: {new Date(genre.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => openEditModal(genre)}
                  className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                  title="Edit genre"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(genre._id)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete genre"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {genres.length === 0 && !loading && (
        <div className="text-center py-12 bg-[#2a2a2a] rounded-lg border border-primary/20">
          <p className="text-secondary mb-4">No genres found</p>
          <button
            onClick={() => {
              setEditingGenre(null);
              setFormData({ name: "" });
              setShowModal(true);
            }}
            className="inline-flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-[#d00000] transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Your First Genre</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default GenreTab;
