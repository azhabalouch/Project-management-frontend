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

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  isCompleted: boolean;
  createdAt: string; 
  dueDate: Date;   
}

export interface HandleSubmitEvent extends React.SyntheticEvent<HTMLFormElement> {};