import { role } from './role';
import { movie } from './movie';

export const modules = {
  breadcrumbs: [{ text: 'Admin', to: { path: '/' } }],
  role,
  movie
};
