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
  taskName: string;
  detail: string;
};

export interface HandleSubmitEvent extends React.SyntheticEvent<HTMLFormElement> {};