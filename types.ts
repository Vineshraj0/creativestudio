
import React from 'react';

export interface Idea {
  title: string;
  icon: React.ReactNode;
  description: string;
  howItWorks: string;
  models: string[];
  color: string;
}
