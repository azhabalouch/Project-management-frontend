import React from 'react';

export interface LoginFormData {
  email: string;
  password: string;
};

export interface RegisterFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export interface TaskData {
  title: string;
  description: string;
  status: string;
  isCompleted: boolean;
  dueDate: Date | null;
  userId: string;
};

export interface HandleSubmitEvent extends React.SyntheticEvent<HTMLFormElement> {};