export type WebSocketPosition = {
  user_id: string;
  symbol: string;
  size: number;
  side: string;
  position_value: number;
  entry_price: number;
  liq_price: number;
  bust_price: number;
  leverage: number;
  order_margin: number;
  position_margin: number;
  occ_closing_fee: number;
  take_profit: number;
  tp_trigger_by: string;
  stop_loss: number;
  sl_trigger_by: string;
  trailing_stop: number;
  realised_pnl: number;
  auto_add_margin: string;
  cum_realised_pnl: number;
  position_status: string;
  position_id: string;
  position_seq: string;
  adl_rank_indicator: string;
  free_qty: number;
  tp_sl_mode: string;
  risk_id: string;
  isolated: boolean;
  mode: string;
  position_idx: string;
};

export type WebSocketUpdate = {
  topic: string;
  action: string;
  data: any;
  wsKey: string;
};
