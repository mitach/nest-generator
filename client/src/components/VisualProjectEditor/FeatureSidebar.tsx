import React, { useState, useEffect } from 'react';
import {
  Info,
  Code,
  X,
  Plus,
  Minus,
  Grid3X3,
  List,
  CheckCircle2,
  Puzzle,
  Search,
} from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { FeatureCategory, FeatureInfo } from '@/lib/types';
import { useMonolithStore } from '@/store/monolithStore';

interface FeatureSidebarProps {
  availableFeatures: FeatureCategory[];
}

const CATEGORY_MENU_VIEW_MODES = {
  DETAILED: 'detailed',
  SIMPLE: 'simple',
} as const;

const MIN_FEATURES_FOR_SEARCH = 8;

type ViewMode = (typeof CATEGORY_MENU_VIEW_MODES)[keyof typeof CATEGORY_MENU_VIEW_MODES];

const FeatureSidebar: React.FC<FeatureSidebarProps> = ({ availableFeatures }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(CATEGORY_MENU_VIEW_MODES.DETAILED);
  const [categorySearch, setCategorySearch] = useState('');
  const { monolithFeatures, addFeature, removeFeature } = useMonolithStore();

  const isFeatureSelected = (name: string) => monolithFeatures.includes(name);
  const handleFeatureToggle = (name: string) =>
    isFeatureSelected(name) ? removeFeature(name) : addFeature(name);

  const activeCategoryData = availableFeatures.find((cat) => cat.category === activeCategory);
  const filteredFeatures =
    activeCategoryData?.items.filter((feature) =>
      feature.name.toLowerCase().includes(categorySearch.toLowerCase()),
    ) || [];

  useEffect(() => {
    setCategorySearch('');

    if (!activeCategory) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveCategory(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeCategory]);

  const FeatureTooltip = ({ feature }: { feature: FeatureInfo }) => (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button className="p-2 hover:bg-gray-200 rounded-lg transition-all">
          <Info className="w-4 h-4 text-gray-400 hover:text-blue-500" />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="max-w-sm bg-gray-900 p-4 rounded-xl  border z-50">
          <div className="space-y-3">
            <h4 className="font-bold text-blue-300">{feature.name}</h4>
            {feature.description && <p className="text-sm text-gray-200">{feature.description}</p>}
            {feature.useCase && (
              <div className="pt-2 border-t border-gray-700">
                <p className="text-xs text-gray-400 font-semibold mb-1 uppercase">Use Case</p>
                <p className="text-sm text-gray-300">{feature.useCase}</p>
              </div>
            )}
          </div>
          <Tooltip.Arrow className="fill-gray-900" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );

  return (
    <Tooltip.Provider delayDuration={0}>
      <div className="w-80 bg-white shadow-2xl overflow-hidden flex flex-col relative z-20 border-r border-gray-100">
        {/* Header */}
        <div className="bg-slate-800 text-white p-6">
          <div className="font-bold text-xl flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Puzzle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Available Features</h3>
              <div className="text-sm text-slate-300 font-normal">
                {monolithFeatures.length} features applied
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto p-4 bg-white space-y-3">
          {availableFeatures.map((category) => {
            const addedCount = category.items.filter((f) => isFeatureSelected(f.name)).length;
            const isActive = activeCategory === category.category;

            return (
              <button
                key={category.category}
                onClick={() => setActiveCategory(isActive ? null : category.category)}
                className={`w-full flex items-center border justify-between p-4 rounded-xl transition-all duration-200 transform hover:shadow-md ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg transition-colors bg-gray-100 ${isActive ? 'bg-white/20' : ''}`}
                  >
                    <category.icon
                      className={`w-5 h-5 text-gray-600 ${isActive ? 'text-white' : ''}`}
                    />
                  </div>
                  <div className="flex text-left flex-wrap">
                    <div className="font-semibold text-sm">{category.category}</div>
                    {!!addedCount && (
                      <div className="text-sm ml-1 font-extralight">{addedCount} applied</div>
                    )}
                  </div>
                </div>
                <div
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {category.items.length}
                </div>
              </button>
            );
          })}
        </div>

        {/* Overlay */}
        {activeCategory && activeCategoryData && (
          <>
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-all duration-200"
              onClick={() => setActiveCategory(null)}
            />
            <div className="fixed top-0 left-80 right-0 bottom-0 z-40">
              <div className="bg-white shadow-2xl w-full h-full">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                        <activeCategoryData.icon className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {activeCategoryData.category}
                      </h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
                        {Object.values(CATEGORY_MENU_VIEW_MODES).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              viewMode === mode
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            {mode === CATEGORY_MENU_VIEW_MODES.DETAILED ? (
                              <Grid3X3 className="w-4 h-4" />
                            ) : (
                              <List className="w-4 h-4" />
                            )}
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setActiveCategory(null)}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Search Bar - Only show if more than 8 features */}
                  {activeCategoryData.items.length > MIN_FEATURES_FOR_SEARCH && (
                    <div className="relative">
                      <input
                        type="text"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                        placeholder={`Search ${activeCategoryData.category.toLowerCase()} features...`}
                      />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 h-full overflow-y-auto bg-white">
                  {viewMode === CATEGORY_MENU_VIEW_MODES.DETAILED ? (
                    // DETAILED VIEW
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
                      {filteredFeatures.map((feature, index) => {
                        const isAdded = isFeatureSelected(feature.name);
                        const FeatureIcon = feature.icon || Code;

                        return (
                          <div
                            key={index}
                            className={`border rounded-2xl p-6 transition-all duration-200 relative ${
                              isAdded ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                            }`}
                          >
                            {isAdded && (
                              <div className="absolute top-4 right-4 p-1 bg-green-100 rounded-full">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              </div>
                            )}
                            <div className="flex items-center gap-4 mb-4">
                              <div
                                className={`p-3 rounded-xl transition-colors ${isAdded ? 'bg-blue-100' : 'bg-gray-100'}`}
                              >
                                <FeatureIcon
                                  className={`w-6 h-6 ${isAdded ? 'text-blue-600' : 'text-gray-600'}`}
                                />
                              </div>
                              <h3 className="font-bold text-lg text-gray-800">{feature.name}</h3>
                            </div>
                            {feature.description && (
                              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                {feature.description}
                              </p>
                            )}
                            {feature.useCase && (
                              <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-blue-300 mb-4">
                                <p className="text-xs text-gray-500 mb-2 uppercase">Use Case</p>
                                <p className="text-sm text-gray-700">{feature.useCase}</p>
                              </div>
                            )}
                            <button
                              onClick={() => handleFeatureToggle(feature.name)}
                              className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-200 transform ${
                                isAdded
                                  ? 'bg-red-600 hover:bg-red-700'
                                  : 'bg-blue-600 hover:bg-blue-700'
                              }`}
                            >
                              <span className="flex items-center justify-center gap-2">
                                {isAdded ? (
                                  <Minus className="w-4 h-4" />
                                ) : (
                                  <Plus className="w-4 h-4" />
                                )}
                                {isAdded ? 'Remove' : 'Add'}
                              </span>
                            </button>
                          </div>
                        );
                      })}
                      {filteredFeatures.length === 0 && categorySearch && (
                        <div className="col-span-full text-center py-12">
                          <p className="text-gray-500">
                            No features found matching &quot;{categorySearch}&quot;
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // SIMPLE VIEW
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      {filteredFeatures.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {filteredFeatures.map((feature, index) => {
                            const isAdded = isFeatureSelected(feature.name);

                            return (
                              <div
                                key={index}
                                onClick={() => handleFeatureToggle(feature.name)}
                                className={`flex items-center justify-between py-4 px-6 transition-all hover:bg-gray-50 cursor-pointer ${
                                  isAdded ? 'bg-blue-50 border-l-4' : ''
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {isAdded && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                                  <span
                                    className={`font-medium ${isAdded ? 'text-blue-700' : 'text-gray-700'}`}
                                  >
                                    {feature.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {feature.description && <FeatureTooltip feature={feature} />}
                                  <button
                                    onClick={() => handleFeatureToggle(feature.name)}
                                    className={`p-2 rounded-lg transition-all transform hover:scale-110 ${
                                      isAdded
                                        ? 'text-red-600 hover:bg-red-100'
                                        : 'text-blue-600 hover:bg-blue-100'
                                    }`}
                                  >
                                    {isAdded ? (
                                      <Minus className="w-4 h-4" />
                                    ) : (
                                      <Plus className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : categorySearch ? (
                        <div className="text-center py-12">
                          <p className="text-gray-500">
                            No features found matching &quot;{categorySearch}&quot;
                          </p>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Tooltip.Provider>
  );
};

export default FeatureSidebar;
