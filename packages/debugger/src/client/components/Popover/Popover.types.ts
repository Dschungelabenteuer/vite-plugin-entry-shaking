export type PopoverProps = {
  isOpen: boolean;
};

export type PopoverEvents = {
  close: [];
  afterOpen: [];
};

export type PopoverSlots = {
  default(props: { isTransitioning: boolean }): any;
};
