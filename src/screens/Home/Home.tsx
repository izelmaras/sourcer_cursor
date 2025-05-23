import React, { useEffect, useCallback, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AddAndNavigationByAnima } from "./sections/AddAndNavigationByAnima";
import { FrameByAnima } from "./sections/FrameByAnima/FrameByAnima";
import { Detail } from "../Detail/Detail";
import { Add } from "../Add/Add";
import { Organize } from "../Organize/Organize";
import { useAtomStore } from "../../store/atoms";
import { useDropzone } from 'react-dropzone';
import { colors } from "../../lib/design-tokens";
import { PlusIcon, FolderIcon, XIcon } from "lucide-react";
import { Button } from "../../components/ui/button";

export const Home = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    fetchAtoms, 
    fetchTags, 
    fetchCategories, 
    fetchCreators, 
    fetchCategoryTags, 
    fetchDefaultCategory,
    setDefaultCategory,
    addAtom, 
    selectedTags, 
    toggleTag,
    atoms,
    defaultCategoryId,
    categories,
    getCategoryTags
  } = useAtomStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isOrganizeOpen, setIsOrganizeOpen] = useState(false);

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
    };
    
    initializeData();
  }, []);

  const hasFilters = selectedTags.length > 0 || selectedContentTypes.length > 0 || searchTerm || defaultCategoryId !== null;

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

  return (
    <main 
      className={`flex flex-col items-center w-full min-h-screen ${colors.background.primary} py-6 px-6 relative`}
    >
      <div className="w-full max-w-7xl space-y-6">
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
          <div className="flex flex-wrap gap-2 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            {selectedContentTypes.map(type => (
              <Button
                key={type}
                variant="secondary"
                size="sm"
                className="bg-gray-900 text-white hover:bg-gray-800"
                onClick={() => handleContentTypeSelect(type)}
              >
                {type}
                <XIcon className="w-4 h-4 ml-2" />
              </Button>
            ))}

            {searchTerm && (
              <Button
                variant="secondary"
                size="sm"
                className="bg-gray-900 text-white hover:bg-gray-800"
                onClick={() => setSearchTerm('')}
              >
                Search: {searchTerm}
                <XIcon className="w-4 h-4 ml-2" />
              </Button>
            )}

            {selectedCategory && (
              <Button
                variant="secondary"
                size="sm"
                className="bg-gray-900 text-white hover:bg-gray-800"
                onClick={() => useAtomStore.getState().setDefaultCategory(null)}
              >
                Category: {selectedCategory.name}
                <XIcon className="w-4 h-4 ml-2" />
              </Button>
            )}

            {selectedTags.map((tag) => (
              <Button
                key={tag}
                variant="secondary"
                size="sm"
                className="bg-gray-900 text-white hover:bg-gray-800"
                onClick={() => toggleTag(tag)}
              >
                {tag}
                <XIcon className="w-4 h-4 ml-2" />
              </Button>
            ))}
          </div>
        )}

        <div className="space-y-6">
          <Routes>
            <Route path="/" element={
              <FrameByAnima 
                searchTerm={searchTerm}
                selectedContentTypes={selectedContentTypes}
                selectedCreator={selectedCreator}
              />
            } />
            <Route path="/detail/:id" element={
              <Detail 
                open={true}
                onClose={() => navigate('/', { replace: true })}
                filteredAtoms={atoms}
              />
            } />
          </Routes>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 flex flex-col gap-2 items-center">
        <button
          onClick={() => setIsOrganizeOpen(true)}
          className="w-14 h-14 bg-white hover:bg-gray-50 text-black rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
        >
          <FolderIcon className="w-6 h-6" />
        </button>
        <button
          onClick={() => setIsAddOpen(true)}
          className="w-14 h-14 bg-white hover:bg-gray-50 text-black rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
        >
          <PlusIcon className="w-6 h-6" />
        </button>
      </div>

      <Add open={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <Organize 
        open={isOrganizeOpen} 
        onClose={() => setIsOrganizeOpen(false)} 
        onCreatorSelect={setSelectedCreator}
      />
    </main>
  );
};