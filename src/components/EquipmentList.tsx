import React, { useState } from 'react';
import { Camera, Lightbulb, Mic, Wrench, Battery, HardDrive, Settings } from 'lucide-react';
import { EquipmentList as EquipmentListType, Scene } from '../types';

interface EquipmentListProps {
  scene: Scene;
  onSceneUpdate: (scene: Scene) => void;
}

export const EquipmentList: React.FC<EquipmentListProps> = ({ scene, onSceneUpdate }) => {
  const [activeCategory, setActiveCategory] = useState('cameras');

  const categories = [
    { id: 'cameras', label: 'Cameras', icon: Camera, items: scene.equipment.cameras },
    { id: 'lenses', label: 'Lenses', icon: Settings, items: scene.equipment.lenses },
    { id: 'lighting', label: 'Lighting', icon: Lightbulb, items: scene.equipment.lighting },
    { id: 'audio', label: 'Audio', icon: Mic, items: scene.equipment.audio },
    { id: 'support', label: 'Support', icon: Wrench, items: scene.equipment.support },
    { id: 'power', label: 'Power', icon: Battery, items: scene.equipment.power },
    { id: 'storage', label: 'Storage', icon: HardDrive, items: scene.equipment.storage }
  ];

  const renderCameras = () => (
    <div className="space-y-4">
      {scene.equipment.cameras.map((camera) => (
        <div key={camera.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                {camera.model}
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`
                  px-2 py-1 text-xs font-medium rounded-full
                  ${camera.type === 'primary' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                    camera.type === 'secondary' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                  }
                `}>
                  {camera.type}
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Qty: {camera.quantity}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Settings
              </label>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {camera.settings}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Accessories
              </label>
              <div className="flex flex-wrap gap-1">
                {camera.accessories.map((accessory, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs"
                  >
                    {accessory}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLenses = () => (
    <div className="space-y-4">
      {scene.equipment.lenses.map((lens) => (
        <div key={lens.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Focal Length
              </label>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {lens.focal}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Aperture
              </label>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {lens.aperture}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Purpose
              </label>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {lens.purpose}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Quantity
              </label>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {lens.quantity}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLighting = () => (
    <div className="space-y-4">
      {scene.equipment.lighting.map((light) => (
        <div key={light.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Type
              </label>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {light.type}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Wattage
              </label>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {light.wattage}W
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Modifiers
              </label>
              <div className="flex flex-wrap gap-1">
                {light.modifiers.map((modifier, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-xs"
                  >
                    {modifier}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Quantity
              </label>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {light.quantity}
                </span>
                {light.stands && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">
                    + Stands
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAudio = () => (
    <div className="space-y-4">
      {scene.equipment.audio.map((audio) => (
        <div key={audio.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Type
              </label>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {audio.type}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Model
              </label>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {audio.model}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Purpose
              </label>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {audio.purpose}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Accessories
              </label>
              <div className="flex flex-wrap gap-1">
                {audio.accessories.map((accessory, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
                  >
                    {accessory}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-4">
      {scene.equipment.support.map((support) => (
        <div key={support.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Type
              </label>
              <div className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                {support.type.replace('-', ' ')}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Model
              </label>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {support.model}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Capacity
              </label>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {support.capacity}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Purpose
              </label>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {support.purpose}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPower = () => (
    <div className="space-y-4">
      {scene.equipment.power.map((power) => (
        <div key={power.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Type
              </label>
              <div className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                {power.type.replace('-', ' ')}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Capacity
              </label>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {power.capacity}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Duration
              </label>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {power.duration}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Quantity
              </label>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {power.quantity}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderStorage = () => (
    <div className="space-y-4">
      {scene.equipment.storage.map((storage) => (
        <div key={storage.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Type
              </label>
              <div className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                {storage.type.replace('-', ' ')}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Capacity
              </label>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {storage.capacity}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Speed
              </label>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {storage.speed}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Quantity
              </label>
              <div className="font-medium text-slate-900 dark:text-slate-100">
                {storage.quantity}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'cameras': return renderCameras();
      case 'lenses': return renderLenses();
      case 'lighting': return renderLighting();
      case 'audio': return renderAudio();
      case 'support': return renderSupport();
      case 'power': return renderPower();
      case 'storage': return renderStorage();
      default: return renderCameras();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Equipment List
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Complete equipment requirements for this scene
          </p>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${activeCategory === category.id
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{category.label}</span>
              <span className="px-2 py-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs">
                {category.items.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Equipment Content */}
      <div>
        {renderCategoryContent()}
      </div>

      {/* Equipment Summary */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Equipment Summary
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {scene.equipment.cameras.length + scene.equipment.lenses.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Camera Gear</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {scene.equipment.lighting.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Lighting</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {scene.equipment.audio.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Audio Gear</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {scene.equipment.support.length + scene.equipment.accessories.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Support & Misc</div>
          </div>
        </div>
      </div>
    </div>
  );
};