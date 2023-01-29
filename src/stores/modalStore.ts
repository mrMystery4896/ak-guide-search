import type React from "react";
import { create } from "zustand";

type ModalState = {
  isOpen: boolean;
  open: (obj: {
    title?: string;
    children: React.ReactNode;
    callback?: () => void;
  }) => void;
  close: (callback?: () => void) => void;
  title?: string;
  children: React.ReactNode;
};

export const useModal = create<ModalState>((set) => ({
  isOpen: false,
  // set isOpen to true, and call callback if provided
  open: ({ title, children, callback }) => {
    set((state) => ({ ...state, children, title, isOpen: true }));
    callback && callback();
  },
  // reset modal state, set isOpen to false, and call callback if provided
  close: (callback) => {
    set((state) => ({
      ...state,
      title: undefined,
      isOpen: false,
      children: null,
      initialFocus: undefined,
    }));
    callback && callback();
  },
  children: null,
}));
