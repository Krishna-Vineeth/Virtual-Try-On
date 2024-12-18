import { useState } from 'react';

interface ModelSelectionProps {
  onTryOn: (modelFile: File, type: 'upper' | 'lower') => Promise<void>;
}

export function ModelSelection({ onTryOn }: ModelSelectionProps) {
  const [selectedType, setSelectedType] = useState<'upper' | 'lower'>('upper');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await onTryOn(file, selectedType);
    }
  };

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <label>
          <input
            type="radio"
            value="upper"
            checked={selectedType === 'upper'}
            onChange={(e) => setSelectedType(e.target.value as 'upper' | 'lower')}
          />
          Upper Body
        </label>
        <label>
          <input
            type="radio"
            value="lower"
            checked={selectedType === 'lower'}
            onChange={(e) => setSelectedType(e.target.value as 'upper' | 'lower')}
          />
          Lower Body
        </label>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
} 