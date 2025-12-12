import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AddAndNavigationByAnima } from "./sections/AddAndNavigationByAnima";
import { GallerySection } from "./sections/FrameByAnima/FrameByAnima";
import { Add } from "../Add/Add";
import { Organize } from "../Organize/Organize";
import { useAtomStore } from "../../store/atoms";
import { XIcon, LightbulbIcon } from "lucide-react";
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
    setSelectedCreator,
    atoms
  } = useAtomStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isOrganizeOpen, setIsOrganizeOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchMode, setSearchMode] = useState<'search' | 'creators'>('search');
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Sync selectedCreators with selectedCreator (for GallerySection compatibility)
  // This syncs when selectedCreator changes from external sources (like Organize component)
  useEffect(() => {
    if (selectedCreator && !selectedCreators.includes(selectedCreator)) {
      setSelectedCreators([selectedCreator]);
    } else if (!selectedCreator && selectedCreators.length > 0) {
      setSelectedCreators([]);
    }
  }, [selectedCreator]);

  // Sync selectedCreator with selectedCreators (when creators change from AddAndNavigationByAnima)
  useEffect(() => {
    if (selectedCreators.length > 0 && selectedCreators[0] !== selectedCreator) {
      setSelectedCreator(selectedCreators[0]);
    } else if (selectedCreators.length === 0 && selectedCreator) {
      setSelectedCreator(null);
    }
  }, [selectedCreators]);

  // Read filterIdea from URL params
  useEffect(() => {
    const filterIdeaParam = searchParams.get('filterIdea');
    if (filterIdeaParam) {
      const ideaId = parseInt(filterIdeaParam, 10);
      if (!isNaN(ideaId)) {
        setSelectedIdea(ideaId);
        // Clear the URL param after reading it
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('filterIdea');
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [searchParams, setSearchParams]);

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
    const handleOpenAdd = () => setIsAddOpen(true);
    const handleOpenOrganize = () => setIsOrganizeOpen(true);

    window.addEventListener('openAdd', handleOpenAdd);
    window.addEventListener('openOrganize', handleOpenOrganize);

    return () => {
      window.removeEventListener('openAdd', handleOpenAdd);
      window.removeEventListener('openOrganize', handleOpenOrganize);
    };
  }, []);

  const selectedIdeaAtom = selectedIdea ? atoms.find(a => a.id === selectedIdea) : null;
  const selectedCategory = categories.find(c => c.id === defaultCategoryId);
  
  // Count actual filter badges that will be rendered
  const hasSearchFilter = searchTerm && searchTerm.trim().length > 0;
  const hasCategoryFilter = selectedCategory !== undefined && selectedCategory !== null;
  const hasCreatorFilter = selectedCreator !== null && selectedCreator !== undefined;
  const hasIdeaFilter = selectedIdeaAtom !== null && selectedIdeaAtom !== undefined;
  
  const filterBadgeCount = selectedTags.length + 
    selectedContentTypes.length + 
    (hasSearchFilter ? 1 : 0) + 
    (hasCategoryFilter ? 1 : 0) + 
    (hasCreatorFilter ? 1 : 0) + 
    (hasIdeaFilter ? 1 : 0);
  
  const hasActiveFilters = filterBadgeCount > 0;

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

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-500/45 via-gray-400/55 via-gray-500/50 to-gray-400/60 relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen bg-white/6 backdrop-blur-md">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-500/45 via-gray-400/55 via-gray-500/50 to-gray-400/60 relative overflow-hidden">
      {/* Main content with glassmorphism */}
      <div className="relative z-10 min-h-screen bg-white/6 backdrop-blur-md">
        <main className="flex flex-col items-center w-full min-h-screen">
          <div className="w-full max-w-7xl space-y-6 p-6">
            <AddAndNavigationByAnima
              onViewChange={() => {}} 
              searchTerm={searchTerm}
              onSearchChange={(value) => setSearchTerm(value)}
              selectedContentTypes={selectedContentTypes}
              onContentTypeSelect={handleContentTypeSelect}
              selectedCreators={selectedCreators}
              onCreatorsSelect={setSelectedCreators}
              showOnlyFavorites={showOnlyFavorites}
              onShowOnlyFavoritesChange={setShowOnlyFavorites}
              searchMode={searchMode}
              onSearchModeChange={setSearchMode}
              selectedIdea={selectedIdea}
              onIdeaFilterChange={setSelectedIdea}
            />

            {hasActiveFilters ? (
              <div className="flex flex-wrap gap-2 p-4 md:p-5 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-xl md:shadow-lg">
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
                {selectedIdeaAtom && (
                  <Button
                    size="sm"
                    selected={true}
                    rightIcon={<XIcon className="w-4 h-4" />}
                    onClick={() => setSelectedIdea(null)}
                    leftIcon={<LightbulbIcon className="w-4 h-4" />}
                  >
                    Idea: {selectedIdeaAtom.title || `Idea #${selectedIdeaAtom.id}`}
                  </Button>
                )}
              </div>
            ) : null}

            <div className="space-y-6">
              <GallerySection 
                searchTerm={searchTerm}
                selectedContentTypes={selectedContentTypes}
                selectedCreator={selectedCreator}
                selectedIdea={selectedIdea}
                onIdeaFilterChange={setSelectedIdea}
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