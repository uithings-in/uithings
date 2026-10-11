"use client";

import React from "react";
import { AddComponentView } from "./add-component/AddComponentPage";

interface AddComponentPanelProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddComponentPanel({ onSuccess, onCancel }: AddComponentPanelProps) {
  return <AddComponentView onSuccess={onSuccess} onCancel={onCancel} />;
}
