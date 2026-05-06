import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

function IconBase({ size = 24, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox='0 0 24 24'
      width={size}
      height={size}
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      focusable='false'
      {...props}
    >
      {children}
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d='M4 7h16' strokeWidth='2' />
      <path d='M4 12h16' strokeWidth='2' />
      <path d='M4 17h16' strokeWidth='2' />
    </IconBase>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx='11' cy='11' r='6.5' strokeWidth='1.9' />
      <path d='m16 16 4 4' strokeWidth='1.9' />
    </IconBase>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx='12' cy='12' r='4.5' strokeWidth='1.8' />
      <path d='M12 2.75v2.5M12 18.75v2.5M4.75 12h2.5M16.75 12h2.5M6.6 6.6l1.77 1.77M15.63 15.63l1.77 1.77M17.4 6.6l-1.77 1.77M8.37 15.63 6.6 17.4' strokeWidth='1.8' />
    </IconBase>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d='M15.25 3.75A8.5 8.5 0 1 0 20.25 16.8 9.75 9.75 0 0 1 15.25 3.75Z' strokeWidth='1.8' />
    </IconBase>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d='M12 5v14M5 12h14' strokeWidth='2.2' />
    </IconBase>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d='M10 17l-5-5 5-5' strokeWidth='1.9' />
      <path d='M5 12h11' strokeWidth='1.9' />
      <path d='M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3' strokeWidth='1.9' />
    </IconBase>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx='12' cy='12' r='7' strokeWidth='1.8' />
      <path d='M12 8v4l2.75 1.65' strokeWidth='1.8' />
    </IconBase>
  );
}

export function EditIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d='M4.75 19.25h3.75L18.75 9l-3.75-3.75-10.25 10.25v3.75Z' strokeWidth='1.8' />
      <path d='m12.5 6.5 3.75 3.75' strokeWidth='1.8' />
    </IconBase>
  );
}

export function MoreHorizontalIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx='5' cy='12' r='1.4' fill='currentColor' stroke='none' />
      <circle cx='12' cy='12' r='1.4' fill='currentColor' stroke='none' />
      <circle cx='19' cy='12' r='1.4' fill='currentColor' stroke='none' />
    </IconBase>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d='m6.5 6.5 11 11M17.5 6.5l-11 11' strokeWidth='2' />
    </IconBase>
  );
}

export function TaskIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x='5' y='4.5' width='14' height='15' rx='2.5' strokeWidth='1.8' />
      <path d='M8 9h8M8 13h5.5M8 17h7' strokeWidth='1.8' />
      <path d='m8 9 1.25 1.25L11 8.5' strokeWidth='1.8' />
    </IconBase>
  );
}

export function TodoIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d='M8 5.5h11M8 12h11M8 18.5h11' strokeWidth='1.8' />
      <rect x='4.5' y='4.5' width='1.8' height='1.8' rx='.5' strokeWidth='1.5' />
      <rect x='4.5' y='11.25' width='1.8' height='1.8' rx='.5' strokeWidth='1.5' />
      <rect x='4.5' y='18' width='1.8' height='1.8' rx='.5' strokeWidth='1.5' />
    </IconBase>
  );
}

export function ProjectIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d='M4.5 7.25A2.25 2.25 0 0 1 6.75 5h3.1l1.6 2h6.05A1.5 1.5 0 0 1 19 8.5v7A2.5 2.5 0 0 1 16.5 18H7A2.5 2.5 0 0 1 4.5 15.5v-8.25Z' strokeWidth='1.8' />
    </IconBase>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x='4' y='5.5' width='16' height='14' rx='2.5' strokeWidth='1.8' />
      <path d='M8 3.5v4M16 3.5v4M4 9.5h16' strokeWidth='1.8' />
    </IconBase>
  );
}

export function HistoryIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d='M4.75 7.5V4.75H2' strokeWidth='1.8' />
      <path d='M4.5 7.5a8 8 0 1 1-1.1 4' strokeWidth='1.8' />
      <path d='M12 8v4l2.75 1.65' strokeWidth='1.8' />
    </IconBase>
  );
}

export function ErrorIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx='12' cy='12' r='9' strokeWidth='1.8' />
      <path d='M12 7.5v5.2' strokeWidth='1.9' />
      <circle cx='12' cy='16.4' r='1' fill='currentColor' stroke='none' />
    </IconBase>
  );
}

export function EmptyStateIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d='M5.5 7.5h13l-1 9H6.5l-1-9Z' strokeWidth='1.8' />
      <path d='M8.5 7.5 9.8 4.8h4.4l1.3 2.7' strokeWidth='1.8' />
      <path d='M9 11h6M9 14h4.5' strokeWidth='1.8' />
    </IconBase>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d='M19 6.5 9.5 16 5 11.5' strokeWidth='2.2' />
    </IconBase>
  );
}
