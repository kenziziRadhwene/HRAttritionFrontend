export interface NotifItem {
  type: string;
  message: string;
  valeur?: any;
  date?: string;
  lue: boolean;
}

export interface NotificationPanneau {
  recalculTermine:   NotifItem;
  risquesCritiques:  NotifItem;
  rapportDisponible: NotifItem;
  prochainRecalcul:  NotifItem;
}
