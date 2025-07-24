import React, { useEffect, useState } from "react";
import { AddAndNavigationByAnima } from "./sections/AddAndNavigationByAnima";
import { GallerySection } from "./sections/FrameByAnima/FrameByAnima";
import { Add } from "../Add/Add";
import { Organize } from "../Organize/Organize";
import { useAtomStore } from "../../store/atoms";
import { XIcon } from "lucide-react";
import { Button } from "../../components/ui/button";

export const Home = (): JSX.Element => {
  const { 
    fetchAtoms, 
    fetchTags, 
    fetchCategories, 
    fetchCreators, 
    fetchCategoryTags, 
    fetchDefaultCategory,
    selectedTags, 
    toggleTag,
    defaultCategoryId,
    categories,
    getCategoryTags,
    isTagDrawerCollapsed,
    setTagDrawerCollapsed,
    selectedCreator,
    setSelectedCreator
  } = useAtomStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isOrganizeOpen, setIsOrganizeOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchTags(),
        fetchCategories(),
        fetchCreators(),
        fetchCategoryTags(),
        fetchDefaultCategory()
      ]);
      await fetchAtoms();
      setInitialLoading(false);
    };
    
    initializeData();
  }, []);

  useEffect(() => {
    if ((selectedTags.length > 0 || selectedCreator) && isTagDrawerCollapsed) {
      setTagDrawerCollapsed(false);
    }
  }, [selectedTags, selectedCreator, isTagDrawerCollapsed, setTagDrawerCollapsed]);

  useEffect(() => {
    const handleOpenAdd = () => setIsAddOpen(true);
    const handleOpenOrganize = () => setIsOrganizeOpen(true);

    window.addEventListener('openAdd', handleOpenAdd);
    window.addEventListener('openOrganize', handleOpenOrganize);

    return () => {
      window.removeEventListener('openAdd', handleOpenAdd);
      window.removeEventListener('openOrganize', handleOpenOrganize);
    };
  }, []);

  const hasFilters = selectedTags.length > 0 || selectedContentTypes.length > 0 || searchTerm || defaultCategoryId !== null || selectedCreator !== null;

  const handleContentTypeSelect = (type: string) => {
    setSelectedContentTypes(prev => {
      if (type === 'All') return [];
      const isSelected = prev.includes(type);
      if (isSelected) {
        return prev.filter(t => t !== type);
      }
      return [...prev, type];
    });
  };

  const selectedCategory = categories.find(c => c.id === defaultCategoryId);

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900/40 via-gray-800/50 to-gray-900/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen bg-white/5 backdrop-blur-sm">
          <div className="w-full max-w-7xl space-y-6 p-6">
            <div className="h-12 bg-white/10 backdrop-blur-sm rounded-xl mb-6" />
            <div className="h-8 bg-white/10 backdrop-blur-sm rounded mb-4 w-1/2" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 bg-white/10 backdrop-blur-sm rounded-3xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900/40 via-gray-800/50 to-gray-900/40 relative overflow-hidden">
      {/* Main content with glassmorphism */}
      <div className="relative z-10 min-h-screen bg-white/3 backdrop-blur-sm">
        <main className="flex flex-col items-center w-full min-h-screen">
          <div className="w-full max-w-7xl space-y-6 p-6">
            <AddAndNavigationByAnima
              onViewChange={() => {}} 
              searchTerm={searchTerm}
              onSearchChange={(value) => setSearchTerm(value)}
              selectedContentTypes={selectedContentTypes}
              onContentTypeSelect={handleContentTypeSelect}
              selectedCreator={selectedCreator}
              onCreatorSelect={setSelectedCreator}
            />

            {hasFilters && (
              <div className="flex flex-wrap gap-2 p-4 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl">
                {selectedContentTypes.map(type => (
                  <Button
                    key={type}
                    size="sm"
                    selected={true}
                    rightIcon={<XIcon className="w-4 h-4" />}
                    onClick={() => handleContentTypeSelect(type)}
                  >
                    {type}
                  </Button>
                ))}
                {searchTerm && (
                  <Button
                    size="sm"
                    selected={true}
                    rightIcon={<XIcon className="w-4 h-4" />}
                    onClick={() => setSearchTerm("")}
                  >
                    Search: {searchTerm}
                  </Button>
                )}
                {selectedCategory && (
                  <Button
                    size="sm"
                    selected={true}
                    rightIcon={<XIcon className="w-4 h-4" />}
                    onClick={() => useAtomStore.getState().setDefaultCategory(null)}
                  >
                    Category: {selectedCategory.name}
                  </Button>
                )}
                {selectedCreator && (
                  <Button
                    size="sm"
                    selected={true}
                    rightIcon={<XIcon className="w-4 h-4" />}
                    onClick={() => setSelectedCreator(null)}
                  >
                    Creator: {selectedCreator}
                  </Button>
                )}
                {selectedTags.map((tag) => (
                  <Button
                    key={tag}
                    size="sm"
                    selected={true}
                    rightIcon={<XIcon className="w-4 h-4" />}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            )}

            <div className="space-y-6">
              <GallerySection 
                searchTerm={searchTerm}
                selectedContentTypes={selectedContentTypes}
                selectedCreator={selectedCreator}
              />
            </div>
          </div>
        </main>



        <Add open={isAddOpen} onClose={() => setIsAddOpen(false)} />
        <Organize 
          open={isOrganizeOpen} 
          onClose={() => setIsOrganizeOpen(false)} 
          onCreatorSelect={setSelectedCreator}
        />
      </div>
    </div>
  );
};