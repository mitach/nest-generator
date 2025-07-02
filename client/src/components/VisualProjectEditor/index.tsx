'use client';

import React, { useState } from 'react';
import FeatureSidebar from './FeatureSidebar';
import ServiceGrid from './ServiceGrid';
import MonolithCanvas from './MonolithCanvas';
import ConfigPanel from './ConfigPanel';
import TopBar from './TopBar';
import { Service } from '../../lib/types';
import { availableFeatures } from '../../lib/constants';

// @ts-nocheck

const VisualProjectEditor = () => {
  const [projectName, setProjectName] = useState('my-nestjs-app');
  const [architecture, setArchitecture] = useState('monolith');
  const [services, setServices] = useState<Service[]>([
    {
      id: 'api-gateway',
      name: 'API Gateway',
      type: 'api-gateway',
      features: ['swagger', 'validation', 'rate-limiting'],
      config: {},
      locked: true,
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'auth',
      name: 'Auth Service',
      type: 'auth',
      features: ['auth:jwt', 'database:mongodb'],
      config: {},
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'users',
      name: 'Users Service',
      type: 'users',
      features: ['users:mongodb', 'database:mongodb'],
      config: {
        authFields: ['email', 'password'],
        profileFields: ['firstName', 'lastName', 'avatar'],
        features: {
          emailVerification: true,
          passwordReset: true,
          twoFactorAuth: false,
          socialLogin: ['google'],
        },
      },
      color: 'from-green-500 to-green-600',
    },
  ]);

  const [draggingFeature, setDraggingFeature] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [_, setShowServiceMenu] = useState(false);
  const [dragOverService, setDragOverService] = useState<string | null>(null);

  const handleServiceDrop = (e: React.DragEvent, serviceId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggingFeature && architecture === 'microservice') {
      const service = services.find((s) => s.id === serviceId);
      if (service && !service.features.includes(draggingFeature)) {
        setServices(
          services.map((s) =>
            s.id === serviceId ? { ...s, features: [...s.features, draggingFeature] } : s,
          ),
        );
      }
    }
    setDraggingFeature(null);
    setDragOverService(null);
  };

  const handleServiceDragOver = (e: React.DragEvent, serviceId: string) => {
    e.preventDefault();
    if (draggingFeature) {
      setDragOverService(serviceId);
    }
  };

  const handleServiceDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverService(null);
  };

  const removeFeatureFromService = (serviceId: string | null, feature: string) => {
    if (architecture === 'microservice') {
      setServices(
        services.map((s) =>
          s.id === serviceId ? { ...s, features: s.features.filter((f) => f !== feature) } : s,
        ),
      );
    } else {
      // setMonolithFeatures(monolithFeatures.filter((f) => f !== feature));
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Sidebar - Features */}
      <FeatureSidebar availableFeatures={availableFeatures} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <TopBar
          projectName={projectName}
          setProjectName={setProjectName}
          architecture={architecture}
          setArchitecture={setArchitecture}
        />
        {/* Canvas */}
        <div className="flex-1 p-6 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
          {architecture === 'microservice' ? (
            <ServiceGrid
              services={services}
              dragOverService={dragOverService}
              draggingFeature={draggingFeature}
              handleServiceDrop={handleServiceDrop}
              handleServiceDragOver={handleServiceDragOver}
              handleServiceDragLeave={handleServiceDragLeave}
              selectedService={selectedService}
              setSelectedService={setSelectedService}
              setShowServiceMenu={setShowServiceMenu}
              removeFeatureFromService={removeFeatureFromService}
            />
          ) : (
            <MonolithCanvas />
          )}
        </div>

        <ConfigPanel />
      </div>
    </div>
  );
};

export default VisualProjectEditor;
