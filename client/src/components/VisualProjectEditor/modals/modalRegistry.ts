import React from 'react';
import CorsModal from './CorsModal';
import UsersModal from './UsersModal';
import HelmetModal from './HelmetModal';
import SwaggerModal from './SwaggerModal';
import RateLimitModal from './RateLimitModal';
import CompressionModal from './CompressionModal';

type ModalComponent = React.ComponentType<{
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: unknown) => void;
}>;

// Define the mapping of feature names to their modal components
const FEATURE_MODAL_MAP: Record<string, ModalComponent> = {
  cors: CorsModal,
  helmet: HelmetModal,
  swagger: SwaggerModal,
  compression: CompressionModal,
  'rate-limiting': RateLimitModal,
  'users:mongodb': UsersModal,
  'users:postgres': UsersModal,
  // Add more mappings as your modals grow
  // "auth": AuthModal,
  // "database": DatabaseModal,
};

/**
 * Normalizes a feature name for lookup in the modal map
 * @param feature - The feature name to normalize
 * @returns The normalized feature name
 */
function normalizeFeatureName(feature: string): string {
  return feature.toLowerCase().replace(/\s+/g, '');
}

/**
 * Checks if a feature has an associated modal
 * @param feature - The feature name to check
 * @returns true if the feature has a modal, false otherwise
 */
export function hasModalForFeature(feature: string): boolean {
  const normalizedName = normalizeFeatureName(feature);
  return normalizedName in FEATURE_MODAL_MAP;
}

/**
 * Gets the modal component for a specific feature
 * @param feature - The feature name
 * @returns The modal component or undefined if not found
 */
export function getModalForFeature(feature: string): ModalComponent | undefined {
  const normalizedName = normalizeFeatureName(feature);
  return FEATURE_MODAL_MAP[normalizedName];
}

/**
 * Gets all available feature names that have modals
 * @returns Array of feature names
 */
export function getAvailableModalFeatures(): string[] {
  return Object.keys(FEATURE_MODAL_MAP);
}

/**
 * Registers a new modal for a feature
 * This can be useful for dynamic modal registration
 * @param feature - The feature name
 * @param modalComponent - The modal component
 */
export function registerModal(feature: string, modalComponent: ModalComponent): void {
  const normalizedName = normalizeFeatureName(feature);
  FEATURE_MODAL_MAP[normalizedName] = modalComponent;
}

// You can also export the type if needed elsewhere
export type { ModalComponent };
