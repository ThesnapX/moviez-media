import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const FilterSidebar = ({
  isOpen,
  onClose,
  selectedFilter,
  setSelectedFilter,
  sortBy,
  setSortBy,
}) => {
  const filters = [
    { id: "all", label: "All" },
    { id: "movie", label: "Movies" },
    { id: "tv-series", label: "TV Series" },
    { id: "anime", label: "Anime" },
  ];

  const sortOptions = [
    { id: "relevance", label: "Relevance" },
    { id: "rating", label: "Rating" },
    { id: "year", label: "Year" },
    { id: "views", label: "Popularity" },
  ];

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-xs">
                  <div className="flex h-full flex-col bg-[#1a1a1a] shadow-xl border-r border-primary/20">
                    <div className="flex items-center justify-between px-4 py-6 border-b border-primary/20">
                      <Dialog.Title className="text-lg text-primary">
                        Filter & Sort
                      </Dialog.Title>
                      <button
                        onClick={onClose}
                        className="p-2 text-secondary hover:text-primary transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                      {/* Filter Section */}
                      <div>
                        <h3 className="text-sm font-medium text-secondary mb-3">
                          Filter by Type
                        </h3>
                        <div className="space-y-2">
                          {filters.map((filter) => (
                            <button
                              key={filter.id}
                              onClick={() => {
                                setSelectedFilter(filter.id);
                                onClose();
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                selectedFilter === filter.id
                                  ? "bg-primary text-white"
                                  : "bg-[#2a2a2a] text-secondary hover:bg-primary/20 hover:text-primary"
                              }`}
                            >
                              {filter.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sort Section */}
                      <div>
                        <h3 className="text-sm font-medium text-secondary mb-3">
                          Sort by
                        </h3>
                        <div className="space-y-2">
                          {sortOptions.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => {
                                setSortBy(option.id);
                                onClose();
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                sortBy === option.id
                                  ? "bg-primary text-white"
                                  : "bg-[#2a2a2a] text-secondary hover:bg-primary/20 hover:text-primary"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-primary/20 p-4">
                      <button
                        onClick={() => {
                          setSelectedFilter("all");
                          setSortBy("relevance");
                          onClose();
                        }}
                        className="w-full px-4 py-2 bg-[#2a2a2a] text-secondary rounded-lg hover:bg-[#3a3a3a] transition-colors text-sm"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default FilterSidebar;
