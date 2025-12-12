import React, { useState, useEffect, useRef } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ScrollArea } from "../../components/ui/scroll-area";
import { useAtomStore } from "../../store/atoms";
import * as Dialog from "@radix-ui/react-dialog";
import { BookAudioIcon as AudioIcon, BookIcon, FileTextIcon, FilmIcon, FolderIcon, HeartIcon, ImageIcon, LinkIcon, ListIcon, LightbulbIcon, MapPinIcon, MusicIcon, NewspaperIcon, PlayCircleIcon, UtensilsIcon, VideoIcon, XIcon, ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { ContentFields } from "../../components/ui/content-fields";
import { colors } from "../../lib/design-tokens";
import { ModalWrapper } from "../../components/ui/modal-wrapper";
import { RichTextEditor } from "../../components/ui/rich-text-editor";

interface AddProps {
  open: boolean;
  onClose: () => void;
}

type ContentType = {
  icon: JSX.Element;
  label: string;
  type: string;
};

export const Add = ({ open, onClose }: AddProps): JSX.Element => {
  const { addAtom, addTag, addCreator, fetchTags, fetchCreators, fetchAtoms, tags, creators, atoms, addChildAtom } = useAtomStore((state) => ({
    addAtom: state.addAtom,
    addTag: state.addTag,
    addCreator: state.addCreator,
    fetchTags: state.fetchTags,
    fetchCreators: state.fetchCreators,
    fetchAtoms: state.fetchAtoms,
    tags: state.tags,
    creators: state.creators,
    atoms: state.atoms,
    addChildAtom: state.addChildAtom
  }));
  const [selectedType, setSelectedType] = useState<string>("image");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [sourceLink, setSourceLink] = useState("");
  const [steps, setSteps] = useState<string[]>([""]);
  const [materials, setMaterials] = useState<{ material: string; amount: string }[]>([{ material: "", amount: "" }]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
  const [creatorSearch, setCreatorSearch] = useState("");
  const [selectedIdeas, setSelectedIdeas] = useState<number[]>([]);
  const [ideaSearch, setIdeaSearch] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [locationLatitude, setLocationLatitude] = useState<number | null>(null);
  const [locationLongitude, setLocationLongitude] = useState<number | null>(null);

  useEffect(() => {
    fetchTags();
    fetchCreators();
    fetchAtoms();
  }, [fetchTags, fetchCreators, fetchAtoms]);



  const contentTypes: ContentType[] = [
    { icon: <NewspaperIcon className="h-4 w-4" />, label: "Article/blog", type: "article" },
    { icon: <AudioIcon className="h-4 w-4" />, label: "Audio", type: "audio" },
    { icon: <BookIcon className="h-4 w-4" />, label: "Book", type: "book" },
    { icon: <HeartIcon className="h-4 w-4" />, label: "Feeling", type: "feeling" },
    { icon: <LightbulbIcon className="h-4 w-4" />, label: "Idea", type: "idea" },
    { icon: <ImageIcon className="h-4 w-4" />, label: "Image", type: "image" },
    { icon: <FileTextIcon className="h-4 w-4" />, label: "Life event", type: "life-event" },
    { icon: <LinkIcon className="h-4 w-4" />, label: "Link", type: "link" },
    { icon: <FileTextIcon className="h-4 w-4" />, label: "Memory", type: "memory" },
    { icon: <FilmIcon className="h-4 w-4" />, label: "Movie", type: "movie" },
    { icon: <FileTextIcon className="h-4 w-4" />, label: "Note", type: "note" },
    { icon: <FileTextIcon className="h-4 w-4" />, label: "PDF", type: "pdf" },
    { icon: <PlayCircleIcon className="h-4 w-4" />, label: "Podcast", type: "podcast" },
    { icon: <FolderIcon className="h-4 w-4" />, label: "Project", type: "project" },
    { icon: <UtensilsIcon className="h-4 w-4" />, label: "Recipe", type: "recipe" },
    { icon: <MusicIcon className="h-4 w-4" />, label: "Spotify", type: "spotify" },
    { icon: <MusicIcon className="h-4 w-4" />, label: "Playlist", type: "playlist" },
    { icon: <ListIcon className="h-4 w-4" />, label: "Task", type: "task" },
    { icon: <VideoIcon className="h-4 w-4" />, label: "Video", type: "video" },
    { icon: <LinkIcon className="h-4 w-4" />, label: "Website", type: "website" },
    { icon: <PlayCircleIcon className="h-4 w-4" />, label: "YouTube", type: "youtube" },
  ];

  const orderedTypes = [
    ...contentTypes.filter(t => t.type === "image"),
    ...contentTypes.filter(t => t.type === "link"),
    ...contentTypes.filter(t => t.type === "youtube"),
    ...contentTypes.filter(t => !["image", "link", "youtube"].includes(t.type)).sort((a, b) => a.label.localeCompare(b.label)),
  ];

  const handleSave = async () => {
    if (!selectedType) return;

    for (const creatorName of selectedCreators) {
      if (!creators.find(c => c.name === creatorName)) {
        await addCreator({
          name: creatorName,
          count: 1,
        });
      }
    }

    for (const tag of selectedTags) {
      if (!tags.find(t => t.name === tag)) {
        await addTag({
          name: tag,
          count: 1,
        });
      }
    }

    const newAtom = await addAtom({
      title: title || ' ',
      description,
      content_type: selectedType,
      link: externalLink || null,
      media_source_link: sourceLink || null,
      creator_name: selectedCreators.join(', ') || null,
      tags: selectedTags,
      metadata: selectedType === 'recipe' ? {
        steps,
        materials,
      } : null,
      store_in_database: true,
      is_external: Boolean(externalLink),
      location_address: selectedType === 'location' ? locationAddress : null,
      location_latitude: selectedType === 'location' ? locationLatitude : null,
      location_longitude: selectedType === 'location' ? locationLongitude : null,
    });

    // Add atom to selected ideas
    if (newAtom && selectedIdeas.length > 0) {
      console.log('Adding atom to ideas:', { atomId: newAtom.id, ideaIds: selectedIdeas });
      for (const ideaId of selectedIdeas) {
        try {
          console.log(`Adding atom ${newAtom.id} to idea ${ideaId}...`);
          await addChildAtom(ideaId, newAtom.id);
          console.log(`Successfully added atom ${newAtom.id} to idea ${ideaId}`);
        } catch (error) {
          console.error(`Error adding atom to idea ${ideaId}:`, error);
          // Show alert to user
          alert(`Failed to add atom to idea. Check console for details. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } else {
      console.log('No ideas selected or atom not created:', { newAtom: !!newAtom, selectedIdeasCount: selectedIdeas.length });
    }

    await fetchAtoms();
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSelectedType("image");
    setTitle("");
    setDescription("");
    setExternalLink("");
    setSourceLink("");
    setSteps([""]);
    setMaterials([{ material: "", amount: "" }]);
    setSelectedTags([]);
    setTagSearch("");
    setSelectedCreators([]);
    setCreatorSearch("");
    setSelectedIdeas([]);
    setIdeaSearch("");
    setLocationAddress("");
    setLocationLatitude(null);
    setLocationLongitude(null);
  };

  const handleTagClick = (tagName: string) => {
    if (!selectedTags.includes(tagName)) {
      setSelectedTags([...selectedTags, tagName]);
    }
    setTagSearch("");
  };

  const handleCreateTag = () => {
    if (tagSearch && !tags.find(t => t.name === tagSearch)) {
      setSelectedTags([...selectedTags, tagSearch]);
      setTagSearch("");
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const handleCreatorClick = (creatorName: string) => {
    if (!selectedCreators.includes(creatorName)) {
      setSelectedCreators([...selectedCreators, creatorName]);
    }
    setCreatorSearch("");
  };

  const handleCreateCreator = async () => {
    if (creatorSearch && !creators.find(c => c.name === creatorSearch)) {
      try {
        await addCreator({
          name: creatorSearch,
          count: 1,
        });
        await fetchCreators();
        setSelectedCreators([...selectedCreators, creatorSearch]);
        setCreatorSearch("");
      } catch (error) {
        console.error('Error creating creator:', error);
      }
    }
  };

  const removeCreator = (creator: string) => {
    setSelectedCreators(selectedCreators.filter(c => c !== creator));
  };

  const handleIdeaClick = (ideaId: number) => {
    if (!selectedIdeas.includes(ideaId)) {
      setSelectedIdeas([...selectedIdeas, ideaId]);
    }
    setIdeaSearch("");
  };

  const removeIdea = (ideaId: number) => {
    setSelectedIdeas(selectedIdeas.filter(id => id !== ideaId));
  };

  const filteredTags = tags
    .filter(tag => 
      tag.name.toLowerCase().includes(tagSearch.toLowerCase()) &&
      !selectedTags.includes(tag.name)
    )
    .slice(0, 12);

  const showCreateTag = tagSearch && 
    !tags.find(t => t.name.toLowerCase() === tagSearch.toLowerCase()) &&
    !selectedTags.includes(tagSearch);

  const filteredCreators = creators
    .filter(creator => 
      creator.name.toLowerCase().includes(creatorSearch.toLowerCase()) &&
      !selectedCreators.includes(creator.name)
    )
    .slice(0, 12);

  const showCreateCreator = creatorSearch && 
    !creators.find(c => c.name.toLowerCase() === creatorSearch.toLowerCase()) &&
    !selectedCreators.includes(creatorSearch);

  // Filter ideas (only show ideas, not the current atom being created)
  const ideaAtoms = atoms.filter(atom => atom.content_type === 'idea');
  const filteredIdeas = ideaAtoms
    .filter(idea => 
      idea.title?.toLowerCase().includes(ideaSearch.toLowerCase()) &&
      !selectedIdeas.includes(idea.id)
    )
    .slice(0, 12);

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-3xl px-4 sm:px-6 outline-none max-h-[80vh]">
          <ModalWrapper>
            <ScrollArea className="max-h-[calc(80vh-0rem)] overflow-y-auto">
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-white/80">Content type</label>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {orderedTypes.map(type => (
                        <button
                          key={type.type}
                          type="button"
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            selectedType === type.type
                              ? 'bg-white/20 text-white border border-white/30 shadow-lg scale-105'
                              : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 hover:scale-102'
                          }`}
                          onClick={() => setSelectedType(type.type)}
                        >
                          {type.icon}
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {(() => {
                    // List of types that support a source link
                    const typesWithSourceLink = [
                      "video", "audio", "image", "recipe", "location", "link", "website", "youtube", "pdf", "movie", "podcast"
                    ];
                    const hasSourceLink = typesWithSourceLink.includes(selectedType);
                    
                    if (!hasSourceLink) return null;
                    
                    return (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white/80">Source link</label>
                        <ContentFields
                          type={selectedType}
                          locationAddress={locationAddress}
                          setLocationAddress={setLocationAddress}
                          locationLatitude={locationLatitude}
                          setLocationLatitude={setLocationLatitude}
                          locationLongitude={locationLongitude}
                          setLocationLongitude={setLocationLongitude}
                          sourceLink={sourceLink}
                          setSourceLink={setSourceLink}
                          steps={steps}
                          setSteps={setSteps}
                          materials={materials}
                          setMaterials={setMaterials}
                          className={colors.button.secondary}
                        />
                      </div>
                    );
                  })()}

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80 mt-2">External link</label>
                    <Input
                      placeholder="Webpage URL"
                      value={externalLink}
                      onChange={(e) => setExternalLink(e.target.value)}
                      inputSize="lg"
                      color="glass"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80 mt-2">Tag(s)</label>
                    <Input
                      placeholder="Add tag"
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (filteredTags.length > 0) {
                            handleTagClick(filteredTags[0].name);
                          } else if (showCreateTag) {
                            handleCreateTag();
                          }
                        }
                      }}
                      inputSize="lg"
                      color="glass"
                    />

                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        {selectedTags.map((tag) => (
                          <Button
                            key={tag}
                            size="sm"
                            rightIcon={<XIcon className="h-4 w-4 ml-2" />}
                            onClick={() => removeTag(tag)}
                            tabIndex={-1}
                          >
                            {tag}
                          </Button>
                        ))}
                      </div>
                    )}

                    {(tagSearch || showCreateTag) && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {filteredTags.map((tag) => (
                          <Button
                            key={tag.id}
                            size="sm"
                            onClick={() => handleTagClick(tag.name)}
                          >
                            {tag.name}
                          </Button>
                        ))}
                        {showCreateTag && (
                          <Button
                            size="sm"
                            onClick={handleCreateTag}
                          >
                            Create "{tagSearch}"
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80 mt-2">Creator(s)</label>
                    <Input
                      placeholder="Add creator"
                      value={creatorSearch}
                      onChange={(e) => setCreatorSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (filteredCreators.length > 0) {
                            handleCreatorClick(filteredCreators[0].name);
                          } else if (showCreateCreator) {
                            handleCreateCreator();
                          }
                        }
                      }}
                      inputSize="lg"
                      color="glass"
                    />

                    {selectedCreators.length > 0 && (
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        {selectedCreators.map((creator) => (
                          <Button
                            key={creator}
                            size="sm"
                            rightIcon={<XIcon className="h-4 w-4 ml-2" />}
                            onClick={() => removeCreator(creator)}
                            tabIndex={-1}
                          >
                            {creator}
                          </Button>
                        ))}
                      </div>
                    )}

                    {(creatorSearch || showCreateCreator) && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {filteredCreators.map((creator) => (
                          <Button
                            key={creator.id}
                            size="sm"
                            onClick={() => handleCreatorClick(creator.name)}
                          >
                            {creator.name}
                          </Button>
                        ))}
                        {showCreateCreator && (
                          <Button
                            size="sm"
                            onClick={handleCreateCreator}
                          >
                            Create "{creatorSearch}"
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80 mt-2 flex items-center gap-2">
                      <LightbulbIcon className="h-4 w-4" />
                      Add to Idea(s)
                    </label>
                    <Input
                      placeholder="Search ideas..."
                      value={ideaSearch}
                      onChange={(e) => setIdeaSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (filteredIdeas.length > 0) {
                            handleIdeaClick(filteredIdeas[0].id);
                          }
                        }
                      }}
                      inputSize="lg"
                      color="glass"
                    />

                    {selectedIdeas.length > 0 && (
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        {selectedIdeas.map((ideaId) => {
                          const idea = ideaAtoms.find(i => i.id === ideaId);
                          return idea ? (
                            <Button
                              key={ideaId}
                              size="sm"
                              rightIcon={<XIcon className="h-4 w-4 ml-2" />}
                              onClick={() => removeIdea(ideaId)}
                              tabIndex={-1}
                            >
                              {idea.title}
                            </Button>
                          ) : null;
                        })}
                      </div>
                    )}

                    {ideaSearch && filteredIdeas.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {filteredIdeas.map((idea) => (
                          <Button
                            key={idea.id}
                            size="sm"
                            onClick={() => handleIdeaClick(idea.id)}
                          >
                            {idea.title}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80 mt-2">Title</label>
                    <Input
                      placeholder="Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      inputSize="lg"
                      color="glass"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80 mt-2">Description</label>
                    <RichTextEditor
                      value={description}
                      onChange={setDescription}
                      placeholder="Add a description..."
                      className="h-12 px-5 text-base rounded-[12px] bg-white/5 backdrop-blur-sm text-white border border-white/10 placeholder:text-white/60 focus:ring-2 focus:ring-white/20 focus:border-white/20"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={!selectedType}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </ModalWrapper>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};