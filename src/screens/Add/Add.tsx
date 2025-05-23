import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ScrollArea } from "../../components/ui/scroll-area";
import { useAtomStore } from "../../store/atoms";
import { Modal } from "../../components/ui/modal";
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
  const { addAtom, addTag, addCreator, fetchTags, fetchCreators, fetchAtoms, tags, creators } = useAtomStore((state) => ({
    addAtom: state.addAtom,
    addTag: state.addTag,
    addCreator: state.addCreator,
    fetchTags: state.fetchTags,
    fetchCreators: state.fetchCreators,
    fetchAtoms: state.fetchAtoms,
    tags: state.tags,
    creators: state.creators
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
  const [locationAddress, setLocationAddress] = useState("");
  const [locationLatitude, setLocationLatitude] = useState<number | null>(null);
  const [locationLongitude, setLocationLongitude] = useState<number | null>(null);
  const [isMoreDetailsOpen, setIsMoreDetailsOpen] = useState(false);

  useEffect(() => {
    fetchTags();
    fetchCreators();
  }, [fetchTags, fetchCreators]);

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

    await addAtom({
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

  return (
    <Modal open={open} onClose={onClose}>
      <ModalWrapper>
        <ScrollArea className="max-h-[calc(100vh-12rem)] overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {contentTypes.map((type) => (
                <Button
                  key={type.type}
                  variant={selectedType === type.type ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedType(type.type)}
                  className={`h-8 px-3 justify-start gap-2 ${
                    selectedType === type.type
                      ? colors.tag.selected
                      : colors.tag.unselected
                  }`}
                >
                  {type.icon}
                  {type.label}
                </Button>
              ))}
            </div>

            <div className="space-y-4">
              <Input
                placeholder="Source link (direct media URL)"
                value={sourceLink}
                onChange={(e) => setSourceLink(e.target.value)}
                className={colors.button.secondary}
              />

              <div className="space-y-4">
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
                  className={colors.button.secondary}
                />

                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <Button
                        key={tag}
                        variant="secondary"
                        size="sm"
                        className={colors.button.secondary}
                        onClick={() => removeTag(tag)}
                        tabIndex={-1}
                      >
                        {tag}
                        <XIcon className="h-4 w-4 ml-2" />
                      </Button>
                    ))}
                  </div>
                )}

                {(tagSearch || showCreateTag) && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {filteredTags.map((tag) => (
                      <Button
                        key={tag.id}
                        variant="ghost"
                        size="sm"
                        className={`justify-start h-8 px-3 ${colors.tag.unselected}`}
                        onClick={() => handleTagClick(tag.name)}
                      >
                        {tag.name}
                      </Button>
                    ))}
                    {showCreateTag && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`justify-start h-8 px-3 ${colors.tag.unselected}`}
                        onClick={handleCreateTag}
                      >
                        Create "{tagSearch}"
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
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
                  className={colors.button.secondary}
                />

                {selectedCreators.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedCreators.map((creator) => (
                      <Button
                        key={creator}
                        variant="secondary"
                        size="sm"
                        className={colors.button.secondary}
                        onClick={() => removeCreator(creator)}
                        tabIndex={-1}
                      >
                        {creator}
                        <XIcon className="h-4 w-4 ml-2" />
                      </Button>
                    ))}
                  </div>
                )}

                {(creatorSearch || showCreateCreator) && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {filteredCreators.map((creator) => (
                      <Button
                        key={creator.id}
                        variant="ghost"
                        size="sm"
                        className={`justify-start h-8 px-3 ${colors.tag.unselected}`}
                        onClick={() => handleCreatorClick(creator.name)}
                      >
                        {creator.name}
                      </Button>
                    ))}
                    {showCreateCreator && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`justify-start h-8 px-3 ${colors.tag.unselected}`}
                        onClick={handleCreateCreator}
                      >
                        Create "{creatorSearch}"
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <Input
                placeholder="External link (webpage URL)"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                className={colors.button.secondary}
              />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMoreDetailsOpen(!isMoreDetailsOpen)}
                className={`w-full justify-between ${colors.button.secondary}`}
              >
                More details
                {isMoreDetailsOpen ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
              </Button>

              {isMoreDetailsOpen && (
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Title (optional)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={colors.button.secondary}
                  />

                  <div className="space-y-2">
                    <RichTextEditor
                      value={description}
                      onChange={setDescription}
                      placeholder="Add a description..."
                      className={`min-h-[120px] ${colors.button.secondary}`}
                    />
                  </div>

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
              )}

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSave}
                  disabled={!selectedType}
                  className={colors.button.primary}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </ModalWrapper>
    </Modal>
  );
};