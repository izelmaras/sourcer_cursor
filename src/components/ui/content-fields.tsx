import React from 'react';
import { Input } from './input';
import { Button } from './button';
import { PlusIcon, MinusIcon } from 'lucide-react';

interface ContentFieldsProps {
  type: string;
  locationAddress: string;
  setLocationAddress: (value: string) => void;
  locationLatitude: number | null;
  setLocationLatitude: (value: number | null) => void;
  locationLongitude: number | null;
  setLocationLongitude: (value: number | null) => void;
  sourceLink: string;
  setSourceLink: (value: string) => void;
  steps: string[];
  setSteps: (value: string[]) => void;
  materials: { material: string; amount: string }[];
  setMaterials: (value: { material: string; amount: string }[]) => void;
  className?: string;
}

export const ContentFields = ({
  type,
  locationAddress,
  setLocationAddress,
  locationLatitude,
  setLocationLatitude,
  locationLongitude,
  setLocationLongitude,
  sourceLink,
  setSourceLink,
  steps,
  setSteps,
  materials,
  setMaterials,
  className
}: ContentFieldsProps): JSX.Element | null => {
  const handleAddStep = () => {
    setSteps([...steps, '']);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleUpdateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleAddMaterial = () => {
    setMaterials([...materials, { material: '', amount: '' }]);
  };

  const handleRemoveMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleUpdateMaterial = (index: number, field: 'material' | 'amount', value: string) => {
    const newMaterials = [...materials];
    newMaterials[index][field] = value;
    setMaterials(newMaterials);
  };

  // List of types that support a source link
  const typesWithSourceLink = [
    "video", "audio", "image", "recipe", "location", "link", "website", "youtube", "pdf", "movie", "podcast"
  ];

  if (typesWithSourceLink.includes(type)) {
    return (
      <div className="space-y-4">
        <Input
          placeholder="Direct media URL (e.g., .jpg, .png, .mp4)"
          value={sourceLink}
          onChange={(e) => setSourceLink(e.target.value)}
          inputSize="lg"
          color="glass"
        />
        {/* Additional fields for recipe */}
        {type === 'recipe' && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white/80">Steps</h3>
                <Button
                  size="sm"
                  onClick={handleAddStep}
                >
                  <PlusIcon className="h-4 w-4" />
                  <span className="ml-2">Add step</span>
                </Button>
              </div>
              {steps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={step}
                    onChange={(e) => handleUpdateStep(index, e.target.value)}
                    placeholder={`Step ${index + 1}`}
                    inputSize="lg"
                    color="glass"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleRemoveStep(index)}
                  >
                    <MinusIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white/80">Materials</h3>
                <Button
                  size="sm"
                  onClick={handleAddMaterial}
                >
                  <PlusIcon className="h-4 w-4" />
                  <span className="ml-2">Add material</span>
                </Button>
              </div>
              {materials.map((material, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={material.material}
                    onChange={(e) => handleUpdateMaterial(index, 'material', e.target.value)}
                    placeholder="Material"
                    inputSize="lg"
                    color="glass"
                  />
                  <Input
                    value={material.amount}
                    onChange={(e) => handleUpdateMaterial(index, 'amount', e.target.value)}
                    placeholder="Amount"
                    inputSize="lg"
                    color="glass"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleRemoveMaterial(index)}
                  >
                    <MinusIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
        {/* Additional fields for location */}
        {type === 'location' && (
          <div className="space-y-4">
            <Input
              placeholder="Address"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              color="glass"
              inputSize="lg"
            />
            <Input
              type="number"
              placeholder="Latitude"
              value={locationLatitude || ''}
              onChange={(e) => setLocationLatitude(parseFloat(e.target.value) || null)}
              color="glass"
              inputSize="lg"
            />
            <Input
              type="number"
              placeholder="Longitude"
              value={locationLongitude || ''}
              onChange={(e) => setLocationLongitude(parseFloat(e.target.value) || null)}
              color="glass"
              inputSize="lg"
            />
          </div>
        )}
      </div>
    );
  }

  return null;
}